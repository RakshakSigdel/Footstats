const { PrismaClient } = require("@prisma/client");
const { hashPassword } = require("../utils/hashPassword");

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
        position: true,
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
        position: true,
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
        position: true,
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
        position: data.position,
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
}

module.exports = { PlayerService };