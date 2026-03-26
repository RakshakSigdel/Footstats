import NotificationService from "./notificationService.js";
import EmailService from "./emailService.js";
import prisma from "../utils/prisma.js";

class ScheduleRequestService {
  // Create a pending schedule + schedule request atomically
  static async createScheduleRequest(data, requestingUserId) {
    const matchSize = data.matchSize ? Number(data.matchSize) : 11;
    if (!Number.isInteger(matchSize) || matchSize < 5 || matchSize > 11) {
      throw new Error("Match size must be between 5 and 11");
    }

    const result = await prisma.$transaction(async (tx) => {
      const schedule = await tx.schedule.create({
        data: {
          teamOneId: data.teamOneId,
          teamTwoId: data.teamTwoId,
          scheduleStatus: "PENDING",
          date: new Date(data.date),
          scheduleType: data.scheduleType,
          location: data.location,
          matchSize,
          createdFromClub: data.createdFromClub || null,
          createdFromTournament: data.createdFromTournament || null,
          createdFromUser: requestingUserId,
        },
        include: {
          teamOne: {
            select: {
              clubId: true,
              name: true,
            },
          },
          teamTwo: {
            select: {
              clubId: true,
              name: true,
            },
          },
        },
      });

      const request = await tx.scheduleRequest.create({
        data: {
          scheduleId: schedule.scheduleId,
          teamTwoId: data.teamTwoId,
          status: "PENDING",
        },
      });

      return { schedule, request };
    });

    const targetAdminIds = [
      ...new Set(await NotificationService.getClubAdminUserIds(result.schedule.teamTwoId)),
    ];

    if (targetAdminIds.length > 0) {
      const adminRecipients = await prisma.user.findMany({
        where: {
          userId: { in: targetAdminIds },
          emailVerified: true,
        },
        select: {
          email: true,
          firstName: true,
        },
      });

      try {
        await Promise.all(
          adminRecipients.map((recipient) =>
            EmailService.sendScheduleChallengeEmail({
              to: recipient.email,
              recipientName: recipient.firstName,
              challengerClubName: result.schedule.teamOne?.name || "Club 1",
              challengedClubName: result.schedule.teamTwo?.name || "Club 2",
              date: result.schedule.date,
              location: result.schedule.location,
              scheduleType: result.schedule.scheduleType,
            }),
          ),
        );
      } catch (emailError) {
        console.warn("Failed to send one or more schedule challenge emails:", emailError.message);
      }
    }

    return result;
  }

  // Get all pending requests where userId is admin of team2
  static async getPendingRequestsForAdmin(userId) {
    const adminClubs = await prisma.userClub.findMany({
      where: { userId, role: "ADMIN" },
      select: { clubId: true },
    });
    const createdClubs = await prisma.club.findMany({
      where: { createdBy: userId },
      select: { clubId: true },
    });
    const adminClubIds = [
      ...new Set([
        ...adminClubs.map((c) => c.clubId),
        ...createdClubs.map((c) => c.clubId),
      ]),
    ];

    if (adminClubIds.length === 0) return [];

    return prisma.scheduleRequest.findMany({
      where: {
        teamTwoId: { in: adminClubIds },
        status: "PENDING",
      },
      include: {
        schedule: {
          include: {
            teamOne: { select: { clubId: true, name: true, location: true } },
            teamTwo: { select: { clubId: true, name: true, location: true } },
            creatorFromClub: { select: { clubId: true, name: true } },
            creationFromUser: { select: { userId: true, firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { requestedAt: "desc" },
    });
  }

  // Approve — set schedule to UPCOMING, request to APPROVED
  static async approveRequest(requestId) {
    const approvedSchedule = await prisma.$transaction(async (tx) => {
      const req = await tx.scheduleRequest.findUnique({ where: { requestId: Number(requestId) } });
      if (!req) throw new Error("Request not found");

      await tx.scheduleRequest.update({
        where: { requestId: Number(requestId) },
        data: { status: "APPROVED", reviewedAt: new Date() },
      });

      const updatedSchedule = await tx.schedule.update({
        where: { scheduleId: req.scheduleId },
        data: { scheduleStatus: "UPCOMING" },
        include: {
          teamOne: {
            select: {
              clubId: true,
              name: true,
            },
          },
          teamTwo: {
            select: {
              clubId: true,
              name: true,
            },
          },
        },
      });

      return updatedSchedule;
    });

    const involvedClubIds = [
      approvedSchedule.teamOneId,
      approvedSchedule.teamTwoId,
      approvedSchedule.createdFromClub ? Number(approvedSchedule.createdFromClub) : null,
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

    const recipientUserIds = [...new Set(clubRecipientGroups.flat())];

    await NotificationService.createBulkNotifications(recipientUserIds, {
      type: "SCHEDULE_CREATED",
      title: "New schedule created",
      message: `${approvedSchedule.teamOne?.name || "Team 1"} vs ${approvedSchedule.teamTwo?.name || "Team 2"} has been scheduled.`,
      link: `/schedule/${approvedSchedule.scheduleId}`,
      data: {
        scheduleId: approvedSchedule.scheduleId,
        teamOneId: approvedSchedule.teamOneId,
        teamTwoId: approvedSchedule.teamTwoId,
        createdFromTournament: approvedSchedule.createdFromTournament,
      },
    });

    const recipients = await prisma.user.findMany({
      where: {
        userId: { in: recipientUserIds },
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
            teamOneName: approvedSchedule.teamOne?.name || "Team 1",
            teamTwoName: approvedSchedule.teamTwo?.name || "Team 2",
            date: approvedSchedule.date,
            location: approvedSchedule.location,
            scheduleType: approvedSchedule.scheduleType,
          }),
        ),
      );
    } catch (emailError) {
      console.warn("Failed to send one or more schedule emails:", emailError.message);
    }

    return { success: true };
  }

  // Reject — mark REJECTED then delete the schedule (cascades to request)
  static async rejectRequest(requestId) {
    return prisma.$transaction(async (tx) => {
      const req = await tx.scheduleRequest.findUnique({ where: { requestId: Number(requestId) } });
      if (!req) throw new Error("Request not found");

      await tx.scheduleRequest.update({
        where: { requestId: Number(requestId) },
        data: { status: "REJECTED", reviewedAt: new Date() },
      });

      // Delete the schedule entirely — the cascade removes the request row
      await tx.schedule.delete({ where: { scheduleId: req.scheduleId } });

      return { success: true };
    });
  }
}

export default ScheduleRequestService;