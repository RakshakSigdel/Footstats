import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const authorizeScheduleModification = async (req, res, next) => {
  const loggedInUserId = req.user.userId;
  const scheduleId = parseInt(req.params.id);

  try {
    // Super Admin can do anything
    if (req.user.role === "SUPERADMIN") {
      return next();
    }

    const schedule = await prisma.schedule.findUnique({
      where: { scheduleId: scheduleId },
    });

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    // Check if user is the creator
    if (schedule.createdFromUser === loggedInUserId) {
      return next();
    }

    // Check if user is club admin (if schedule is from a club)
    if (schedule.createdFromClub) {
      const club = await prisma.club.findUnique({
        where: { clubId: schedule.createdFromClub },
      });

      if (club && club.createdBy === loggedInUserId) {
        return next();
      }

      const isClubAdmin = await prisma.userClub.findFirst({
        where: {
          clubId: schedule.createdFromClub,
          userId: loggedInUserId,
          role: "ADMIN",
        },
      });

      if (isClubAdmin) {
        return next();
      }
    }

    // Check if user is tournament admin (if schedule is from a tournament)
    if (schedule.createdFromTournament) {
      const tournament = await prisma.tournament.findUnique({
        where: { tournamentId: schedule.createdFromTournament },
      });

      if (tournament && tournament.createdBy === loggedInUserId) {
        return next();
      }

      const isTournamentAdmin = await prisma.tournamentAdmin.findFirst({
        where: {
          tournamentId: schedule.createdFromTournament,
          userId: loggedInUserId,
        },
      });

      if (isTournamentAdmin) {
        return next();
      }
    }

    return res.status(403).json({
      message: "Forbidden: You do not have permission to modify this schedule",
    });
  } catch (error) {
    console.error("Authorization error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
