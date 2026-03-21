import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class MatchService {
  //Create a new Match
  static async createMatch(scheduleId, data) {
    // checking if the schedule exists and is complete or not
    const schedule = await prisma.schedule.findUnique({
      where: { scheduleId: Number(scheduleId) },
      include: {
        teamOne: true,
        teamTwo: true,
      },
    });
    if (!schedule) {
      throw { status: 404, message: "Schedule not found" };
    }

    // checking if a match already exists for the given schedule
    const existingMatch = await prisma.match.findUnique({
      where: { scheduleId: Number(scheduleId) },
    });

    if (existingMatch) {
      throw { status: 400, message: "Match already exists for this schedule" };
    }

    const match = await prisma.match.create({
      data: {
        scheduleId: Number(scheduleId),
        teamOneGoals: data.teamOneGoals || 0,
        teamTwoGoals: data.teamTwoGoals || 0,
        playedAt: data.playedAt ? new Date(data.playedAt) : (schedule.date ?? new Date()),
        startedAt: data.startedAt ? new Date(data.startedAt) : null,
        endedAt: data.endedAt ? new Date(data.endedAt) : null,
      },
      include: {
        schedule: {
          include: {
            teamOne: {
              select: {
                clubId: true,
                name: true,
                logo: true,
              },
            },
            teamTwo: {
              select: {
                clubId: true,
                name: true,
                logo: true,
              },
            },
          },
        },
      },
    });
    return match;
  }

  static async getAllMatches(filters = {}) {
    const limit = Math.min(Math.max(Number(filters.limit) || 20, 1), 100);
    const cursor = Number(filters.cursor) || null;
    const matches = await prisma.match.findMany({
      include: {
        schedule: {
          include: {
            teamOne: {
              select: {
                clubId: true,
                name: true,
                logo: true,
              },
            },
            teamTwo: {
              select: {
                clubId: true,
                name: true,
                logo: true,
              },
            },

            creatorFromTournament: {
              select: {
                tournamentId: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { matchId: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { matchId: cursor }, skip: 1 } : {}),
    });
    const hasMore = matches.length > limit;
    const items = hasMore ? matches.slice(0, limit) : matches;
    const nextCursor = hasMore ? items[items.length - 1].matchId : null;
    return { matches: items, meta: { hasMore, nextCursor, limit } };
  }

  static async getMatchById(matchId) {
    const match = await prisma.match.findUnique({
      where: { matchId: Number(matchId) },
      include: {
        schedule: {
          include: {
            teamOne: {
              select: {
                clubId: true,
                name: true,
                logo: true,
              },
            },
            teamTwo: {
              select: {
                clubId: true,
                name: true,
                logo: true,
              },
            },

            creatorFromTournament: {
              select: {
                tournamentId: true,
                name: true,
              },
            },
          },
        },
      },
    });
    return match;
  }

  static async getMatchByScheduleId(scheduleId) {
    const match = await prisma.match.findUnique({
      where: { scheduleId: Number(scheduleId) },
      include: {
        schedule: {
          include: {
            teamOne: {
              select: {
                clubId: true,
                name: true,
                logo: true,
              },
            },
            teamTwo: {
              select: {
                clubId: true,
                name: true,
                logo: true,
              },
            },

            creatorFromTournament: {
              select: {
                tournamentId: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!match) {
      throw { status: 404, message: "No match found for this schedule" };
    }

    return match;
  }


  static async updateMatch(matchId, data) {
    const match = await prisma.match.findUnique({
      where: { matchId: Number(matchId) },
    });
    if (!match) {
      throw { status: 404, message: "Match not found" };
    }
    const updatedMatch = await prisma.match.update({
      where: { matchId: Number(matchId) },
        data: {
        ...(data.teamOneGoals !== undefined && {
          teamOneGoals: data.teamOneGoals,
        }),
        ...(data.teamTwoGoals !== undefined && {
          teamTwoGoals: data.teamTwoGoals,
        }),
        playedAt: data.playedAt ? new Date(data.playedAt) : match.playedAt,
        startedAt: data.startedAt ? new Date(data.startedAt) : match.startedAt,
        endedAt: data.endedAt ? new Date(data.endedAt) : match.endedAt,
      },
      include: {
        schedule: {
          include: {
            teamOne: {
              select: {
                clubId: true,
                name: true,
                logo: true, 
              },
            },
            teamTwo: {
              select: {
                clubId: true,
                name: true,
                logo: true,
              },
            },
          },
        },
      },
    });
    return updatedMatch;
  }


  static async deleteMatch(matchId) {
    const match = await prisma.match.findUnique({
      where: { matchId: Number(matchId) },
    });
    if (!match) {
      throw { status: 404, message: "Match not found" };
    }
    await prisma.match.delete({
      where: { matchId: Number(matchId) },
    });
    return { message: "Match deleted successfully" };
  }
}

export default MatchService;
