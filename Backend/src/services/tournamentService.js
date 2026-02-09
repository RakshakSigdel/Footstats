const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
class TournamentService {
  static async createTournament(data, userId) {
    const newTournament = await prisma.tournament.create({
      data: {
        name: data.name,
        description: data.description,
        location: data.location,
        logo: data.logo,
        startDate: data.startDate,
        endDate: data.endDate,
        format: data.format,
        entryFee: data.entryFee,
        createdBy: userId,
        status: data.status,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return newTournament;
}

static async getAllTournaments() {
  const tournaments = await prisma.tournament.findMany({    
    include: {
      creator: {
        select: {
          userId: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
  return tournaments;
}

static async getTournamentById(tournamentId) {
    const tournament = await prisma.tournament.findUnique({
      where: { tournamentId: Number(tournamentId) },
    });
    return tournament;
  }

static async getTournamentsByUserId(userId) {
    const tournaments = await prisma.tournament.findMany({
      where: { createdBy: userId },
    });
    return tournaments;
  }


static async updateTournament(tournamentId, data, userId) {
    const updatedTournament = await prisma.tournament.update({
      where: { tournamentId:Number(tournamentId) , createdBy: userId },
        data: {
        name: data.name,
        description: data.description,
        location: data.location,
        logo: data.logo,
        startDate: data.startDate,
        endDate: data.endDate,
        format: data.format,
        entryFee: data.entryFee,
        createdBy: userId,
        status: data.status,
        createdAt:data.createdAt,
        updatedAt: new Date(),
      },
    });
    return updatedTournament;
  }

static async deleteTournament(tournamentId) {
    const deletedTournament = await prisma.tournament.delete({
      where: { tournamentId: Number(tournamentId) },
    });
    return deletedTournament;
  }

}
module.exports = { TournamentService };
