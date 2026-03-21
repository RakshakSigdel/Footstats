import {PrismaClient} from "@prisma/client";
import { hashPassword } from "../utils/hashPassword.js";
import { hasValidCoordinates, parseCoordinate } from "../utils/geo.js";

const prisma = new PrismaClient();

class PlayerService {
  static async getAllPlayers(filters = {}) {
    const limit = Math.min(Math.max(Number(filters.limit) || 24, 1), 100);
    const cursor = Number(filters.cursor) || null;
    const players = await prisma.user.findMany({
      where: { role: "PLAYER" },
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        dateOfBirth: true,
        gender: true,
        Phone: true,
        location: true,
        locationLatitude: true,
        locationLongitude: true,
        locationPlaceId: true,
        profilePhoto: true,
        // position: true,
        createdAt: true,
      },
      orderBy: { userId: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { userId: cursor }, skip: 1 } : {}),
    });
    const hasMore = players.length > limit;
    const items = hasMore ? players.slice(0, limit) : players;
    const nextCursor = hasMore ? items[items.length - 1].userId : null;
    return { players: items, meta: { hasMore, nextCursor, limit } };
  }

  static async getPlayerByUserId(userId) {
    const player = await prisma.user.findUnique({
      where: { userId: Number(userId) },
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        email: true,
        emailVerified: true,
        dateOfBirth: true,
        gender: true,
        Phone: true,
        location: true,
        locationLatitude: true,
        locationLongitude: true,
        locationPlaceId: true,
        profilePhoto: true,
        // position: true,
        // matchesPlayed: true,
        // goalsScored: true,
        // assist: true,
        createdAt: true,
      },
    });
    if (!player) throw { status: 404, message: "Player not found" };
    return player;
  }

  static async getPlayerById(id) {
    const userIdNum = Number(id);
    const player = await prisma.user.findUnique({
      where: { userId: userIdNum },
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        gender: true,
        location: true,
        locationLatitude: true,
        locationLongitude: true,
        locationPlaceId: true,
        profilePhoto: true,
        preferredFoot: true,
        dateOfBirth: true,
        createdAt: true,
        userClubs: {
          include: {
            club: {
              select: { clubId: true, name: true, location: true, logo: true },
            },
          },
          orderBy: { joinedAt: "asc" },
        },
      },
    });
    if (!player) throw { status: 404, message: "Player not found" };

    // Include clubs created by this user so owner clubs also carry stats.
    const createdClubs = await prisma.club.findMany({
      where: { createdBy: userIdNum },
      select: { clubId: true, name: true, location: true, logo: true, createdAt: true },
    });

    const ownerClubIds = new Set(createdClubs.map((club) => club.clubId));
    const membershipClubIds = new Set(player.userClubs.map((uc) => uc.clubId));

    const mergedUserClubs = [
      ...player.userClubs,
      ...createdClubs
        .filter((club) => !membershipClubIds.has(club.clubId))
        .map((club) => ({
          userClubId: null,
          userId: userIdNum,
          clubId: club.clubId,
          role: "OWNER",
          position: null,
          joinedAt: club.createdAt,
          club: {
            clubId: club.clubId,
            name: club.name,
            location: club.location,
            logo: club.logo,
          },
        })),
    ];

    // Per-club stats
    const userClubsWithStats = await Promise.all(
      mergedUserClubs.map(async (uc) => {
        const [appearances, goals, assists] = await Promise.all([
          prisma.matchLineup.count({ where: { userId: userIdNum, clubId: uc.clubId } }),
          prisma.matchEvent.count({ where: { userId: userIdNum, clubId: uc.clubId, eventType: "GOAL" } }),
          prisma.matchEvent.count({ where: { assistById: userIdNum, clubId: uc.clubId, eventType: "GOAL" } }),
        ]);

        const role = ownerClubIds.has(uc.clubId) ? "OWNER" : uc.role;
        return { ...uc, role, appearances, goals, assists };
      })
    );

    // Full match history (lineups the player featured in)
    const lineups = await prisma.matchLineup.findMany({
      where: { userId: userIdNum },
      include: {
        club: { select: { clubId: true, name: true } },
        match: {
          include: {
            schedule: {
              select: {
                scheduleId: true,
                date: true,
                location: true,
                scheduleType: true,
                scheduleStatus: true,
                teamOne: { select: { clubId: true, name: true } },
                teamTwo: { select: { clubId: true, name: true } },
              },
            },
          },
        },
      },
      orderBy: { match: { playedAt: "desc" } },
    });

    const matches = lineups.map((lu) => {
      const match = lu.match;
      const schedule = match?.schedule;
      const isTeamOne = lu.clubId === schedule?.teamOne?.clubId;
      const myGoals = isTeamOne ? match?.teamOneGoals : match?.teamTwoGoals;
      const oppGoals = isTeamOne ? match?.teamTwoGoals : match?.teamOneGoals;
      let result = null;
      // Only set result if match is completed
      const isCompleted = schedule?.scheduleStatus === 'FINISHED' || match?.endedAt != null;
      if (isCompleted && myGoals != null && oppGoals != null) {
        if (myGoals > oppGoals) result = "Win";
        else if (myGoals < oppGoals) result = "Loss";
        else result = "Draw";
      }
      return {
        matchId: match?.matchId,
        scheduleId: schedule?.scheduleId,
        date: schedule?.date,
        location: schedule?.location,
        scheduleType: schedule?.scheduleType,
        teamOne: schedule?.teamOne,
        teamTwo: schedule?.teamTwo,
        teamOneGoals: match?.teamOneGoals,
        teamTwoGoals: match?.teamTwoGoals,
        myClub: lu.club,
        position: lu.position,
        isStarter: lu.isStarter,
        minutesPlayed: lu.minutesPlayed,
        result,
      };
    });

    // Overall stats
    const [totalGoals, totalAssists, totalYellow, totalRed] = await Promise.all([
      prisma.matchEvent.count({ where: { userId: userIdNum, eventType: "GOAL" } }),
      prisma.matchEvent.count({ where: { assistById: userIdNum, eventType: "GOAL" } }),
      prisma.matchEvent.count({ where: { userId: userIdNum, eventType: "YELLOW_CARD" } }),
      prisma.matchEvent.count({ where: { userId: userIdNum, eventType: "RED_CARD" } }),
    ]);

    let wins = 0, draws = 0, losses = 0;
    matches.forEach((m) => {
      if (m.result === "Win") wins++;
      else if (m.result === "Draw") draws++;
      else if (m.result === "Loss") losses++;
    });

    const completedMatches = wins + draws + losses;

    const hatTrickBuckets = await prisma.matchEvent.groupBy({
      by: ["matchId"],
      where: {
        userId: userIdNum,
        eventType: "GOAL",
      },
      _count: { _all: true },
    });

    const hatTrickCount = hatTrickBuckets.filter((bucket) => bucket._count._all >= 3).length;

    const achievements = [];
    if (completedMatches >= 1) {
      achievements.push({
        id: "first-cap",
        title: "First Cap",
        description: "Played your first completed match.",
        tier: "Bronze",
        icon: "CAP",
      });
    }
    if (wins >= 1) {
      achievements.push({
        id: "first-win",
        title: "First Win",
        description: "Registered your first win.",
        tier: "Bronze",
        icon: "WIN",
      });
    }
    if (totalGoals >= 1) {
      achievements.push({
        id: "first-goal",
        title: "On The Scoresheet",
        description: "Scored your first official goal.",
        tier: "Bronze",
        icon: "GOAL",
      });
    }
    if (totalAssists >= 5) {
      achievements.push({
        id: "playmaker",
        title: "Playmaker",
        description: `Created ${totalAssists} assists for teammates.`,
        tier: "Silver",
        icon: "AST",
      });
    }
    if (totalGoals >= 10) {
      achievements.push({
        id: "goal-machine",
        title: "Goal Machine",
        description: `Hit ${totalGoals} career goals.`,
        tier: "Gold",
        icon: "G10",
      });
    }
    if (hatTrickCount >= 1) {
      achievements.push({
        id: "hat-trick",
        title: "Hat Trick Hero",
        description: `Recorded ${hatTrickCount} hat-trick${hatTrickCount > 1 ? "s" : ""}.`,
        tier: "Gold",
        icon: "H3",
      });
    }
    if (completedMatches >= 3 && wins === completedMatches) {
      achievements.push({
        id: "perfect-run",
        title: "Perfect Run",
        description: `Maintained a 100% win rate across ${completedMatches} completed matches.`,
        tier: "Gold",
        icon: "100",
      });
    }
    if (completedMatches >= 5 && totalYellow === 0 && totalRed === 0) {
      achievements.push({
        id: "clean-discipline",
        title: "Clean Discipline",
        description: "Played 5+ completed matches without cards.",
        tier: "Silver",
        icon: "FAIR",
      });
    }
    if (mergedUserClubs.length >= 2) {
      achievements.push({
        id: "multi-club",
        title: "Club Journeyman",
        description: `Contributed across ${mergedUserClubs.length} clubs.`,
        tier: "Bronze",
        icon: "CLUB",
      });
    }

    return {
      ...player,
      userClubs: userClubsWithStats,
      matches,
      achievements,
      stats: {
        matchesPlayed: completedMatches,
        goals: totalGoals,
        assists: totalAssists,
        yellowCards: totalYellow,
        redCards: totalRed,
        wins,
        draws,
        losses,
        winRate: completedMatches > 0 ? Math.round((wins / completedMatches) * 100) : 0,
      },
    };
  }

  static async updatePlayer(id, data) {
    const userId = Number(id);
    const existing = await prisma.user.findUnique({
      where: { userId },
      select: {
        location: true,
        locationLatitude: true,
        locationLongitude: true,
        locationPlaceId: true,
      },
    });

    if (!existing) throw { status: 404, message: "Player not found" };

    const nextLocation = data.location !== undefined ? String(data.location || "").trim() : undefined;
    const locationChanged =
      nextLocation !== undefined && nextLocation !== String(existing.location || "").trim();
    const hasIncomingCoordinates =
      data.locationLatitude !== undefined ||
      data.locationLongitude !== undefined ||
      data.locationPlaceId !== undefined;

    let locationData = {};
    if (locationChanged || hasIncomingCoordinates) {
      const latitude = parseCoordinate(data.locationLatitude);
      const longitude = parseCoordinate(data.locationLongitude);
      const locationPlaceId = String(data.locationPlaceId || "").trim();

      if (!hasValidCoordinates(latitude, longitude) || !locationPlaceId) {
        throw {
          status: 400,
          message: "Please choose a valid location from the suggestions",
        };
      }

      locationData = {
        locationLatitude: latitude,
        locationLongitude: longitude,
        locationPlaceId,
      };
    }

    const updatedPlayer = await prisma.user.update({
      where: { userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        Phone: data.Phone,
        ...(nextLocation !== undefined && { location: nextLocation }),
        ...locationData,
        profilePhoto: data.profilePhoto,
        // position: data.position,
      },
    });
    return updatedPlayer;
  }

  static async deletePlayer(id) {
    const deleted = await prisma.user.delete({
      where: { userId: Number(id) },
    });
    return { deletedId: deleted.userId };
  }

  static async getPlayersByClubId(clubId) {
    const clubIdNum = Number(clubId);

    const [clubMembers, club] = await Promise.all([
      prisma.userClub.findMany({
        where: { clubId: clubIdNum },
        include: {
          user: {
            select: {
              userId: true,
              firstName: true,
              lastName: true,
              email: true,
              dateOfBirth: true,
              gender: true,
              Phone: true,
              location: true,
              profilePhoto: true,
              preferredFoot: true,
            },
          },
        },
      }),
      prisma.club.findUnique({
        where: { clubId: clubIdNum },
        select: {
          createdBy: true,
          creator: {
            select: {
              userId: true,
              firstName: true,
              lastName: true,
              email: true,
              dateOfBirth: true,
              gender: true,
              Phone: true,
              location: true,
              profilePhoto: true,
              preferredFoot: true,
            },
          },
        },
      }),
    ]);

    // Build a unified list: start with UserClub members
    const memberMap = new Map(clubMembers.map((m) => [m.userId, m]));

    // Include the club creator even if they have no UserClub entry
    const creatorId = club?.createdBy;
    if (creatorId && !memberMap.has(creatorId) && club?.creator) {
      memberMap.set(creatorId, {
        userId: creatorId,
        user: club.creator,
        role: "ADMIN",
        position: null,
        joinedAt: null,
      });
    }

    const allMembers = [...memberMap.values()];

    // Get stats for each player in this club
    const playersWithStats = await Promise.all(
      allMembers.map(async (member) => {
        const uid = member.userId;
        const [appearances, goals, assists, yellowCards, redCards] = await Promise.all([
          prisma.matchLineup.count({ where: { userId: uid, clubId: clubIdNum } }),
          prisma.matchEvent.count({ where: { userId: uid, clubId: clubIdNum, eventType: "GOAL" } }),
          prisma.matchEvent.count({ where: { assistById: uid, clubId: clubIdNum, eventType: "GOAL" } }),
          prisma.matchEvent.count({ where: { userId: uid, clubId: clubIdNum, eventType: "YELLOW_CARD" } }),
          prisma.matchEvent.count({ where: { userId: uid, clubId: clubIdNum, eventType: "RED_CARD" } }),
        ]);

        return {
          ...member.user,
          role: member.role,
          position: member.position,
          joinedAt: member.joinedAt,
          appearances,
          goals,
          assists,
          yellowCards,
          redCards,
        };
      })
    );

    return playersWithStats;
  }

  // Get comprehensive stats for a player
  static async getPlayerStats(userId) {
    const userIdNum = Number(userId);

    // Get player basic info
    const player = await prisma.user.findUnique({
      where: { userId: userIdNum },
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        profilePhoto: true,
      },
    });

    if (!player) throw { status: 404, message: "Player not found" };

    // Count total matches played (from lineups)
    const matchesPlayed = await prisma.matchLineup.count({
      where: { userId: userIdNum },
    });

    // Count goals scored
    const goalsScored = await prisma.matchEvent.count({
      where: {
        userId: userIdNum,
        eventType: 'GOAL',
      },
    });

    // Count assists
    const assists = await prisma.matchEvent.count({
      where: {
        assistById: userIdNum,
        eventType: 'GOAL',
      },
    });

    // Count yellow cards
    const yellowCards = await prisma.matchEvent.count({
      where: {
        userId: userIdNum,
        eventType: 'YELLOW_CARD',
      },
    });

    // Count red cards
    const redCards = await prisma.matchEvent.count({
      where: {
        userId: userIdNum,
        eventType: 'RED_CARD',
      },
    });

    // Get matches won (where player's team won)
    const lineups = await prisma.matchLineup.findMany({
      where: { userId: userIdNum },
      include: {
        match: {
          include: {
            schedule: true,
          },
        },
        club: true,
      },
    });

    let wins = 0;
    let draws = 0;
    let losses = 0;

    lineups.forEach((lineup) => {
      const match = lineup.match;
      if (!match || !match.schedule) return;
      
      // Only count matches that have been completed
      if (match.schedule.scheduleStatus !== 'FINISHED' && !match.endedAt) return;
      
      const isTeamOne = lineup.clubId === match.schedule.teamOneId;
      const teamGoals = isTeamOne ? match.teamOneGoals : match.teamTwoGoals;
      const opponentGoals = isTeamOne ? match.teamTwoGoals : match.teamOneGoals;

      if (teamGoals > opponentGoals) wins++;
      else if (teamGoals < opponentGoals) losses++;
      else draws++;
    });

    const totalGamesWithResult = wins + draws + losses;
    const winRate = totalGamesWithResult > 0 
      ? Math.round((wins / totalGamesWithResult) * 100) 
      : 0;

    return {
      ...player,
      matchesPlayed: totalGamesWithResult,
      goalsScored,
      assists,
      yellowCards,
      redCards,
      wins,
      draws,
      losses,
      winRate,
    };
  }
}
export default PlayerService;