import {PrismaClient} from "@prisma/client";
import { hashPassword } from "../utils/hashPassword.js";

const prisma = new PrismaClient();

class PlayerService {
  static async getAllPlayers() {
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
        profilePhoto: true,
        // position: true,
        createdAt: true,
      },
    });
    return players;
  }

  static async getPlayerByUserId(userId) {
    const player = await prisma.user.findUnique({
      where: { userId: Number(userId) },
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
    const player = await prisma.user.findUnique({
      where: { userId: Number(id) },
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
        // position: true,
        createdAt: true,
      },
    });
    if (!player) throw { status: 404, message: "Player not found" };
    return player;
  }

  static async updatePlayer(id, data) {
    const updatedPlayer = await prisma.user.update({
      where: { userId: Number(id) },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        Phone: data.Phone,
        location: data.location,
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
    const clubMembers = await prisma.userClub.findMany({
      where: { clubId: Number(clubId) },
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
    });
    
    // Get stats for each player in this club
    const playersWithStats = await Promise.all(
      clubMembers.map(async (member) => {
        // Count appearances (match lineups for this club)
        const appearances = await prisma.matchLineup.count({
          where: {
            userId: member.userId,
            clubId: Number(clubId),
          },
        });

        // Count goals (match events where eventType is GOAL for this club)
        const goals = await prisma.matchEvent.count({
          where: {
            userId: member.userId,
            clubId: Number(clubId),
            eventType: 'GOAL',
          },
        });

        return {
          ...member.user,
          role: member.role,
          position: member.position,
          joinedAt: member.joinedAt,
          appearances,
          goals,
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
        match: true,
        club: true,
      },
    });

    let wins = 0;
    let draws = 0;
    let losses = 0;

    lineups.forEach((lineup) => {
      const match = lineup.match;
      if (!match) return;
      
      const isTeamOne = lineup.clubId === match.teamOneClubId;
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
      matchesPlayed,
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