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
}
export default PlayerService;