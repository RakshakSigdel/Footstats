const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const MessageService = require("../services/messageService");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error("Authentication error: Invalid token"));
      }
      socket.user = decoded;
      next();
    });
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.userId}`);

    socket.on("joinClub", async (clubId) => {
      try {
        const membership = await prisma.userClub.findUnique({
          where: {
            userId_clubId: {
              userId: Number(socket.user.userId),
              clubId: Number(clubId),
            },
          },
        });

        if (!membership) {
          socket.emit("error", "You are not a member of this club");
          return;
        }

        const roomName = `club_${clubId}`;
        socket.join(`club_${clubId}`);
        console.log(`User ${socket.user.userId} joined club ${clubId}`);

        socket.emit("joinedClub", {
          clubId,
          message: "You have joined the club chat",
        });

        socket
          .to(roomName)
          .emit("userJoined", {
            userId: socket.user.userId,
            firstName: socket.user.firstName,
            message: "A new user has joined the club chat",
          });
      } catch (error) {
        socket.emit("error", "Error joining club chat");
      }
    });

    socket.on("leaveClub", (clubId) => {
      const roomName = `club_${clubId}`;
      socket.leave(roomName);
      console.log(`User ${socket.user.userId} left club ${clubId}`);

      socket.to(roomName).emit("userLeft", {
        userId: socket.user.userId,
        firstName: socket.user.firstName,
        message: "A user has left the club chat",
      });
    });

  socket.on("sendMessage", async ({ clubId, content }) => {
    try {
      const { clubId, content, messageType, attachment } = data;
      const message = await MessageService.createMessage(
        { clubId, userId: socket.user.userId },
        { content, messageType, attachment },
      );

      const roomName = `club_${clubId}`;
      io.to(roomName).emit("newMessage", message);
    } catch (error) {
      socket.emit("error", "Error sending message");
    }
  });

    socket.on("typing", (data) => {
      const { clubId } = data;
      const roomName = `club-${clubId}`;
      
      socket.to(roomName).emit("user-typing", {
        userId: socket.user.userId,
        firstName: socket.user.firstName,
        lastName: socket.user.lastName,
      });
    });

  socket.on("stopTyping", (data) => {
    const { clubId } = data;
    const roomName = `club_${clubId}`;
    socket.to(roomName).emit("userStoppedTyping", {
      userId: socket.user.userId,
    });
  });

  socket.on("deleteMessage", async (messageId) => {
    try {
      const { messageId, clubId } = data;

      await MessageService.deleteMessage(
        messageId,
        socket.user.userId,
        socket.user.role,
      );

      const roomName = `club_${clubId}`;
      io.to(roomName).emit("messageDeleted", { messageId });
    } catch (error) {
      socket.emit("error", "Error deleting message");
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.user.userId}`);
  });
    });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

module.exports = { initializeSocket, getIo };
