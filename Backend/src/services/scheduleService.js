import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class ScheduleService {
  //Create a new Schedule
  static async createSchedule(data, UserId) {
    const newSchedule = await prisma.schedule.create({
      data: {
        teamOneId: data.teamOneId,
        teamTwoId: data.teamTwoId,
        scheduleStatus: data.scheduleStatus || "UPCOMING",
        date: new Date(data.date),
        scheduleType: data.scheduleType,
        location: data.location,
        createdFromClub: data.createdFromClub || null,
        createdFromTournament: data.createdFromTournament || null,
        createdFromUser: UserId,
      },
      include: {
        teamOne: true,
        teamTwo: true,
        creatorFromClub: true,
        creatorFromTournament: true,
        creationFromUser: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    return newSchedule;
  }
  //Get All Schedule
  static async getAllSchedules() {
    const schedules = await prisma.schedule.findMany({
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
        creationFromUser: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
          },
        },
        creatorFromClub: {
          select: {
            clubId: true,
            name: true,
          },
        },
        creatorFromTournament: {
          select: {
            tournamentId: true,
            name: true,
          },
        },
        match: {
          include: {
            matchEvents: true,
            lineups: {
              include: {
                user: {
                  select: {
                    userId: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });
    return schedules;
  }
  //Get Schedule By ID
  static async getScheduleById(scheduleId) {
    const schedule = await prisma.schedule.findUnique({
      where: { scheduleId: Number(scheduleId) },
    });
    return schedule;
  }

  //Get Schedule For Specific User
  /**
   * Logic
   * SCHEDULE STATUS = UPCOMING/ONGOING: show if user is member of either team
   * FINISHED = SHOW ONLY IF USER WAS IN LINEUP
   */
  static async getMySchedules(userId) {
    // Get all clubs where user is a member
    const userClubs = await prisma.userClub.findMany({
      where: { userId: userId },
      select: { clubId: true },
    });

    const clubIds = userClubs.map((uc) => uc.clubId);

    // Get upcoming and ongoing schedules for clubs the user is a member of
    const upcomingSchedules = await prisma.schedule.findMany({
      where: {
        AND: [
          {
            OR: [
              { teamOneId: { in: clubIds } },
              { teamTwoId: { in: clubIds } },
            ],
          },
          {
            scheduleStatus: {
              in: ["UPCOMING", "ONGOING"],
            },
          },
        ],
      },
      include: {
        teamOne: true,
        teamTwo: true,
        creatorFromClub: true,
        creatorFromTournament: true,
        match: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    // Get finished schedules where user was in the match lineup
    const finishedSchedules = await prisma.schedule.findMany({
      where: {
        scheduleStatus: "FINISHED",
        match: {
          lineups: {
            some: {
              userId: userId,
            },
          },
        },
      },
      include: {
        teamOne: true,
        teamTwo: true,
        creatorFromClub: true,
        creatorFromTournament: true,
        match: {
          include: {
            matchEvents: true,
            lineups: {
              where: {
                userId: userId,
              },
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return {
      upcoming: upcomingSchedules,
      finished: finishedSchedules,
      all: [...upcomingSchedules, ...finishedSchedules],
    };
  }
  
  //Get Schedule By Club
  static async getScheduleByClub(clubId) {
    const schedules = await prisma.schedule.findMany({
      where: {
        OR: [
          { teamOneId: Number(clubId) },
          { teamTwoId: Number(clubId) },
          { createdFromClub: Number(clubId) },
        ],
      },
      include: {
        teamOne: true,
        teamTwo: true,
        creatorFromClub: true,
        creatorFromTournament: true,
        match: {
          include: {
            matchEvents: true,
            lineups: {
              include: {
                user: {
                  select: {
                    userId: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });
    return schedules;
  }

  //Get All the Schedule of the tournament
  static async getScheduleByTournament(tournamentId) {
    const schedules = await prisma.schedule.findMany({
      where: {
        createdFromTournament: Number(tournamentId),
      },
      include: {
        teamOne: true,
        teamTwo: true,
        match: {
          include: {
            events: true,
            lineups: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });
    return schedules;
  }

  //Update Schedule
  static async updateSchedule(scheduleId, data) {
    const updatedSchedule = await prisma.schedule.update({
      where: { scheduleId: Number(scheduleId) },
      data: {
        ...(data.teamOneId && { teamOneId: data.teamOneId }),
        ...(data.teamTwoId && { teamTwoId: data.teamTwoId }),
        ...(data.scheduleStatus && { scheduleStatus: data.scheduleStatus }),
        ...(data.date && { date: new Date(data.date) }),
        ...(data.scheduleType && { scheduleType: data.scheduleType }),
        ...(data.location && { location: data.location }),
      },
      include: {
        teamOne: true,
        teamTwo: true,
        match: true,
      },
    });
    return updatedSchedule;
  }

  //Delete Schedule
  static async deleteSchedule(scheduleId) {
    const deleteSchedule = await prisma.schedule.delete({
      where: { scheduleId: Number(scheduleId) },
    });
    return deleteSchedule;
  }
}

export default ScheduleService;
