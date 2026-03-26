import NotificationService from "./notificationService.js";
import EmailService from "./emailService.js";
import prisma from "../utils/prisma.js";

class ScheduleService {
  //Create a new Schedule
  static async createSchedule(data, UserId) {
    const teamOneId = Number(data.teamOneId);
    const teamTwoId = Number(data.teamTwoId);
    const matchSize = data.matchSize ? Number(data.matchSize) : 11;
    const tournamentId = data.createdFromTournament
      ? Number(data.createdFromTournament)
      : null;

    if (teamOneId === teamTwoId) {
      throw new Error("A team cannot play against itself");
    }

    if (!Number.isInteger(matchSize) || matchSize < 5 || matchSize > 11) {
      throw new Error("Match size must be between 5 and 11");
    }

    if (tournamentId) {
      const accepted = await prisma.tournamentRegistration.findMany({
        where: {
          tournamentId,
          status: "ACCEPTED",
          clubId: { in: [teamOneId, teamTwoId] },
        },
        select: { clubId: true },
      });

      const acceptedIds = new Set(accepted.map((entry) => entry.clubId));

      if (!acceptedIds.has(teamOneId) || !acceptedIds.has(teamTwoId)) {
        throw new Error(
          "Both clubs must be approved tournament participants before scheduling",
        );
      }
    }

    const newSchedule = await prisma.schedule.create({
      data: {
        teamOneId,
        teamTwoId,
        scheduleStatus: data.scheduleStatus || "UPCOMING",
        date: new Date(data.date),
        scheduleType: data.scheduleType,
        location: data.location,
        matchSize,
        createdFromClub: data.createdFromClub || null,
        createdFromTournament: tournamentId,
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

    const [teamOneMembers, teamTwoMembers] = await Promise.all([
      NotificationService.getClubMemberUserIds(teamOneId, true),
      NotificationService.getClubMemberUserIds(teamTwoId, true),
    ]);

    let allRecipients = [...new Set([...teamOneMembers, ...teamTwoMembers])];

    if (tournamentId) {
      const acceptedRegistrations = await prisma.tournamentRegistration.findMany({
        where: {
          tournamentId,
          status: "ACCEPTED",
        },
        select: { clubId: true },
      });

      const tournamentClubIds = [...new Set(acceptedRegistrations.map((entry) => entry.clubId))];
      const tournamentMemberGroups = await Promise.all(
        tournamentClubIds.map((clubId) =>
          NotificationService.getClubMemberUserIds(clubId, true),
        ),
      );
      const tournamentMemberIds = tournamentMemberGroups.flat();

      allRecipients = [...new Set([...allRecipients, ...tournamentMemberIds])];
    }

    await NotificationService.createBulkNotifications(allRecipients, {
      type: "SCHEDULE_CREATED",
      title: "New schedule created",
      message: `${newSchedule.teamOne?.name || "Team 1"} vs ${newSchedule.teamTwo?.name || "Team 2"} has been scheduled.`,
      link: `/schedule/${newSchedule.scheduleId}`,
      data: {
        scheduleId: newSchedule.scheduleId,
        teamOneId,
        teamTwoId,
        createdFromTournament: tournamentId,
      },
    });

    const involvedClubIds = [
      teamOneId,
      teamTwoId,
      data.createdFromClub ? Number(data.createdFromClub) : null,
    ].filter(Boolean);

    const clubRecipientGroups = await Promise.all(
      [...new Set(involvedClubIds)].map(async (clubId) => {
        const [memberIds, adminIds] = await Promise.all([
          NotificationService.getClubMemberUserIds(clubId, true),
          NotificationService.getClubAdminUserIds(clubId),
        ]);
        return [...memberIds, ...adminIds];
      }),
    );

    const emailRecipientUserIds = [...new Set(clubRecipientGroups.flat())];

    const recipients = await prisma.user.findMany({
      where: {
        userId: { in: emailRecipientUserIds },
        emailVerified: true,
      },
      select: {
        email: true,
        firstName: true,
      },
    });

    try {
      await Promise.all(
        recipients.map((recipient) =>
          EmailService.sendScheduleCreatedEmail({
            to: recipient.email,
            recipientName: recipient.firstName,
            teamOneName: newSchedule.teamOne?.name || "Team 1",
            teamTwoName: newSchedule.teamTwo?.name || "Team 2",
            date: newSchedule.date,
            location: newSchedule.location,
            scheduleType: newSchedule.scheduleType,
          }),
        ),
      );
    } catch (emailError) {
      console.warn("Failed to send one or more schedule emails:", emailError.message);
    }

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
    // Auto-finish: if status is not FINISHED and 3+ hours have passed, update it
    await prisma.schedule.updateMany({
      where: {
        scheduleId: Number(scheduleId),
        scheduleStatus: { not: "FINISHED" },
        date: { lte: new Date(Date.now() - 3 * 60 * 60 * 1000) },
      },
      data: { scheduleStatus: "FINISHED" },
    });

    const schedule = await prisma.schedule.findUnique({
      where: { scheduleId: Number(scheduleId) },
      include: {
        teamOne: {
          select: {
            clubId: true,
            name: true,
            logo: true,
            location: true,
          },
        },
        teamTwo: {
          select: {
            clubId: true,
            name: true,
            logo: true,
            location: true,
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
        creationFromUser: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
          },
        },
        match: {
          include: {
            matchEvents: {
              include: {
                user: {
                  select: {
                    userId: true,
                    firstName: true,
                    lastName: true,
                  },
                },
                assistBy: {
                  select: {
                    userId: true,
                    firstName: true,
                    lastName: true,
                  },
                },
                club: {
                  select: {
                    clubId: true,
                    name: true,
                  },
                },
              },
              orderBy: {
                minute: 'asc',
              },
            },
            lineups: {
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
              orderBy: {
                isStarter: 'desc',
              },
            },
          },
        },
      },
    });
    return schedule;
  }

  //Get Schedule For Specific User
  /**
   * Logic
   * SCHEDULE STATUS = UPCOMING/ONGOING: show if user is member of either team or creator
   * FINISHED = SHOW ONLY IF USER WAS IN LINEUP
   */
  static async getMySchedules(userId) {
    // Get all clubs where user is a member
    const userClubs = await prisma.userClub.findMany({
      where: { userId: userId },
      select: { clubId: true },
    });

    // Get all clubs where user is the creator
    const createdClubs = await prisma.club.findMany({
      where: { createdBy: userId },
      select: { clubId: true },
    });

    // Combine both sets of club IDs
    const memberClubIds = userClubs.map((uc) => uc.clubId);
    const createdClubIds = createdClubs.map((c) => c.clubId);
    const clubIds = [...new Set([...memberClubIds, ...createdClubIds])]; // Remove duplicates

    // Get upcoming and ongoing schedules for clubs the user is a member of or created
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
