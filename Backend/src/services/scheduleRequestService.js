import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class ScheduleRequestService {
  // Create a pending schedule + schedule request atomically
  static async createScheduleRequest(data, requestingUserId) {
    return prisma.$transaction(async (tx) => {
      const schedule = await tx.schedule.create({
        data: {
          teamOneId: data.teamOneId,
          teamTwoId: data.teamTwoId,
          scheduleStatus: "PENDING",
          date: new Date(data.date),
          scheduleType: data.scheduleType,
          location: data.location,
          matchSize: data.matchSize ? Number(data.matchSize) : 11,
          createdFromClub: data.createdFromClub || null,
          createdFromTournament: data.createdFromTournament || null,
          createdFromUser: requestingUserId,
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
    return prisma.$transaction(async (tx) => {
      const req = await tx.scheduleRequest.findUnique({ where: { requestId: Number(requestId) } });
      if (!req) throw new Error("Request not found");

      await tx.scheduleRequest.update({
        where: { requestId: Number(requestId) },
        data: { status: "APPROVED", reviewedAt: new Date() },
      });

      await tx.schedule.update({
        where: { scheduleId: req.scheduleId },
        data: { scheduleStatus: "UPCOMING" },
      });

      return { success: true };
    });
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
