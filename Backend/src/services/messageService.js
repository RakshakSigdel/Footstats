import prisma from "../utils/prisma.js";

class MessageService {
  static async hasClubChatAccess(clubId, userId) {
    const [club, membership] = await Promise.all([
      prisma.club.findUnique({
        where: { clubId: Number(clubId) },
        select: { createdBy: true },
      }),
      prisma.userClub.findUnique({
        where: {
          userId_clubId: {
            userId: Number(userId),
            clubId: Number(clubId),
          },
        },
        select: { role: true },
      }),
    ]);

    if (!club) {
      throw { status: 404, message: "Club not found" };
    }

    if (club.createdBy === Number(userId)) {
      return true;
    }

    if (membership) {
      return true;
    }

    return false;
  }

  static async createMessage({ clubId, userId, content, messageType = "TEXT", attachment = null }) {
    try {
      const canChat = await MessageService.hasClubChatAccess(clubId, userId);
      if (!canChat) {
        throw { status: 403, message: "You are not allowed to chat in this club" };
      }

      const message = await prisma.message.create({
        data: {
          clubId: Number(clubId),
          userId: Number(userId),
          content,
          messageType,
          attachment,
        },
        include: {
          user: {
            select: {
              userId: true,
              firstName: true,
              lastName: true,
              profilePhoto: true,
            },
          },
        },
      });

      return message;
    } catch (error) {
      if (error?.status) throw error;
      throw { status: 500, message: "Error creating message" };
    }
  }

  static async getClubMessages(clubId, userId) {
    try {
      const canChat = await MessageService.hasClubChatAccess(clubId, userId);
      if (!canChat) {
        throw { status: 403, message: "You are not allowed to chat in this club" };
      }

      const messages = await prisma.message.findMany({
        where: { clubId: Number(clubId) },
        include: {
          user: {
            select: {
              userId: true,
              firstName: true,
              lastName: true,
              profilePhoto: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      return messages;
    } catch (error) {
      if (error?.status) throw error;
      throw { status: 500, message: "Error fetching club messages" };
    }
  }

  static async deleteMessage(messageId, userId, userRole) {
    try {
      const message = await prisma.message.findUnique({
        where: { messageId: Number(messageId) },
      });

      if (!message) {
        throw { status: 404, message: "Message not found" };
      }

      if (message.userId !== Number(userId) && userRole !== "SUPERADMIN") {
        throw { status: 403, message: "You can only delete your own messages" };
      }

      const deletedMessage = await prisma.message.delete({
        where: { messageId: Number(messageId) },
      });

      return { deletedId: deletedMessage.messageId };
    } catch (error) {
      if (error?.status) throw error;
      throw { status: 500, message: "Error deleting message" };
    }
  }
}

export default MessageService;
