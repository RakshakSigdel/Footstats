import prisma from "../utils/prisma.js";

class NotificationService {
  static async createNotification(userId, payload) {
    if (!userId || !payload?.title || !payload?.message || !payload?.type) {
      return null;
    }

    return prisma.notification.create({
      data: {
        userId: Number(userId),
        type: payload.type,
        title: payload.title,
        message: payload.message,
        link: payload.link || null,
        data: payload.data || null,
      },
    });
  }

  static async createBulkNotifications(userIds, payload) {
    const uniqueIds = [...new Set((userIds || []).map(Number).filter(Boolean))];
    if (!uniqueIds.length) return [];

    const rows = uniqueIds.map((id) => ({
      userId: id,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      link: payload.link || null,
      data: payload.data || null,
    }));

    await prisma.notification.createMany({ data: rows });

    return rows;
  }

  static async getMyNotifications(userId, options = {}) {
    const limit = Number(options.limit) > 0 ? Math.min(Number(options.limit), 100) : 30;
    const unreadOnly = String(options.unreadOnly || "false").toLowerCase() === "true";

    return prisma.notification.findMany({
      where: {
        userId: Number(userId),
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  static async getUnreadCount(userId) {
    const count = await prisma.notification.count({
      where: {
        userId: Number(userId),
        isRead: false,
      },
    });
    return count;
  }

  static async markAsRead(notificationId, userId) {
    return prisma.notification.updateMany({
      where: {
        notificationId: Number(notificationId),
        userId: Number(userId),
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  static async markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: {
        userId: Number(userId),
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  static async getClubAdminUserIds(clubId) {
    const club = await prisma.club.findUnique({
      where: { clubId: Number(clubId) },
      select: {
        createdBy: true,
        userClubs: {
          where: { role: "ADMIN" },
          select: { userId: true },
        },
      },
    });

    if (!club) return [];

    return [
      club.createdBy,
      ...club.userClubs.map((member) => member.userId),
    ];
  }

  static async getClubMemberUserIds(clubId, includeCreator = true) {
    const club = await prisma.club.findUnique({
      where: { clubId: Number(clubId) },
      select: {
        createdBy: true,
        userClubs: {
          select: { userId: true },
        },
      },
    });

    if (!club) return [];

    const ids = club.userClubs.map((member) => member.userId);
    if (includeCreator) ids.push(club.createdBy);
    return ids;
  }

  static async getTournamentAdminUserIds(tournamentId) {
    const tournament = await prisma.tournament.findUnique({
      where: { tournamentId: Number(tournamentId) },
      select: {
        createdBy: true,
        admins: {
          select: { userId: true },
        },
      },
    });

    if (!tournament) return [];

    return [
      tournament.createdBy,
      ...tournament.admins.map((admin) => admin.userId),
    ];
  }
}

export default NotificationService;
