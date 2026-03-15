import { PrismaClient } from "@prisma/client";
import NotificationService from "./notificationService.js";
const prisma = new PrismaClient();

class MatchLineupService {
  /**
   * Create lineup entries for a match
   * @param {number} matchId - The match ID
   * @param {Array} players - Array of player lineup objects
   */
  static async createMatchLineup(matchId, players) {
    // Verify match exists
    const match = await prisma.match.findUnique({
      where: { matchId: Number(matchId) },
      include: { schedule: true },
    });

    if (!match) {
      throw { status: 404, message: "Match not found" };
    }

    const schedule = match.schedule;
    const validClubIds = [schedule.teamOneId, schedule.teamTwoId];

    // Validate all players
    for (const player of players) {
      // Check if club is part of the match
      if (!validClubIds.includes(Number(player.clubId))) {
        throw {
          status: 400,
          message: `Club ${player.clubId} is not part of this match`,
        };
      }

      // Check if user is a member of the club or its creator
      const [membership, clubRecord] = await Promise.all([
        prisma.userClub.findUnique({
          where: { userId_clubId: { userId: Number(player.userId), clubId: Number(player.clubId) } },
        }),
        prisma.club.findUnique({
          where: { clubId: Number(player.clubId) },
          select: { createdBy: true },
        }),
      ]);

      if (!membership && clubRecord?.createdBy !== Number(player.userId)) {
        throw {
          status: 400,
          message: `User ${player.userId} is not a member of club ${player.clubId}`,
        };
      }

      // Check if player is already in lineup
      const existingEntry = await prisma.matchLineup.findUnique({
        where: {
          matchId_userId: {
            matchId: Number(matchId),
            userId: Number(player.userId),
          },
        },
      });

      if (existingEntry) {
        throw {
          status: 400,
          message: `User ${player.userId} is already in the lineup`,
        };
      }
    }

    // Create all lineup entries
    const createdLineups = await prisma.$transaction(
      players.map((player) =>
        prisma.matchLineup.create({
          data: {
            matchId: Number(matchId),
            userId: Number(player.userId),
            clubId: Number(player.clubId),
            isStarter: player.isStarter ?? true,
            position: player.position || null,
            minutesPlayed: player.minutesPlayed ?? 0,
          },
          include: {
            user: {
              select: {
                userId: true,
                firstName: true,
                lastName: true,
                profilePhoto: true,
              },
            },
            club: {
              select: {
                clubId: true,
                name: true,
              },
            },
          },
        })
      )
    );

    const scheduleId = match.schedule?.scheduleId;
    await NotificationService.createBulkNotifications(
      createdLineups.map((entry) => entry.userId),
      {
        type: "LINEUP_ADDED",
        title: "Added to match lineup",
        message: "You were included in a lineup for an upcoming match.",
        link: scheduleId ? `/schedule/${scheduleId}` : null,
        data: { matchId: Number(matchId), scheduleId },
      },
    );

    return createdLineups;
  }

  /**
   * Add single player to lineup
   */
  static async addPlayerToLineup(data) {
    // Verify match exists
    const match = await prisma.match.findUnique({
      where: { matchId: Number(data.matchId) },
      include: { schedule: true },
    });

    if (!match) {
      throw { status: 404, message: "Match not found" };
    }

    const schedule = match.schedule;

    // Verify club is part of the match
    if (
      Number(data.clubId) !== schedule.teamOneId &&
      Number(data.clubId) !== schedule.teamTwoId
    ) {
      throw { status: 400, message: "Club is not part of this match" };
    }

    // Verify user is a member of the club or its creator
    const [membership, clubRecord] = await Promise.all([
      prisma.userClub.findUnique({
        where: { userId_clubId: { userId: Number(data.userId), clubId: Number(data.clubId) } },
      }),
      prisma.club.findUnique({
        where: { clubId: Number(data.clubId) },
        select: { createdBy: true },
      }),
    ]);

    if (!membership && clubRecord?.createdBy !== Number(data.userId)) {
      throw { status: 400, message: "User is not a member of this club" };
    }

    // Check if already in lineup
    const existingEntry = await prisma.matchLineup.findUnique({
      where: {
        matchId_userId: {
          matchId: Number(data.matchId),
          userId: Number(data.userId),
        },
      },
    });

    if (existingEntry) {
      throw { status: 400, message: "User is already in the lineup" };
    }

    const lineup = await prisma.matchLineup.create({
      data: {
        matchId: Number(data.matchId),
        userId: Number(data.userId),
        clubId: Number(data.clubId),
        isStarter: data.isStarter ?? true,
        position: data.position || null,
        minutesPlayed: data.minutesPlayed ?? 0,
      },
      include: {
        user: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
        club: {
          select: {
            clubId: true,
            name: true,
          },
        },
      },
    });

    const scheduleId = match.schedule?.scheduleId;
    await NotificationService.createNotification(lineup.userId, {
      type: "LINEUP_ADDED",
      title: "Added to match lineup",
      message: "You were included in a lineup for an upcoming match.",
      link: scheduleId ? `/schedule/${scheduleId}` : null,
      data: { matchId: Number(data.matchId), scheduleId },
    });

    return lineup;
  }

  /**
   * Get all lineups for a match
   */
  static async getMatchLineups(matchId) {
    const lineups = await prisma.matchLineup.findMany({
      where: { matchId: Number(matchId) },
      include: {
        user: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
            preferredFoot: true,
          },
        },
        club: {
          select: {
            clubId: true,
            name: true,
          },
        },
      },
      orderBy: [{ isStarter: "desc" }, { position: "asc" }],
    });

    return lineups;
  }

  /**
   * Get lineup by ID
   */
  static async getLineupById(lineupId) {
    const lineup = await prisma.matchLineup.findUnique({
      where: { id: Number(lineupId) },
      include: {
        user: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
        club: {
          select: {
            clubId: true,
            name: true,
          },
        },
        match: {
          include: {
            schedule: true,
          },
        },
      },
    });

    return lineup;
  }

  /**
   * Update a lineup entry
   */
  static async updateLineup(lineupId, data) {
    const existing = await prisma.matchLineup.findUnique({
      where: { id: Number(lineupId) },
    });

    if (!existing) {
      throw { status: 404, message: "Lineup entry not found" };
    }

    const updated = await prisma.matchLineup.update({
      where: { id: Number(lineupId) },
      data: {
        ...(data.isStarter !== undefined && { isStarter: data.isStarter }),
        ...(data.position !== undefined && { position: data.position }),
        ...(data.minutesPlayed !== undefined && {
          minutesPlayed: Number(data.minutesPlayed),
        }),
      },
      include: {
        user: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
        club: {
          select: {
            clubId: true,
            name: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Remove a player from lineup
   */
  static async removeFromLineup(lineupId) {
    const existing = await prisma.matchLineup.findUnique({
      where: { id: Number(lineupId) },
    });

    if (!existing) {
      throw { status: 404, message: "Lineup entry not found" };
    }

    // Check if player has any match events
    const events = await prisma.matchEvent.findMany({
      where: {
        matchId: existing.matchId,
        userId: existing.userId,
      },
    });

    if (events.length > 0) {
      throw {
        status: 400,
        message: "Cannot remove player who has match events. Delete events first.",
      };
    }

    const deleted = await prisma.matchLineup.delete({
      where: { id: Number(lineupId) },
    });

    return deleted;
  }
}

export default MatchLineupService;
