export const authorizeMatchModification = async (req, res, next) => {
  const loggedInUserId = req.user.userId;
  const matchId = parseInt(req.params.id);

  try {
    // Super Admin can do anything
    if (req.user.role === "SUPERADMIN") {
      return next();
    }

    const match = await prisma.match.findUnique({
      where: { matchId: matchId },
      include: {
        schedule: true,
      },
    });

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    const schedule = match.schedule;

    // Check if user is the schedule creator
    if (schedule.createdFromUser === loggedInUserId) {
      return next();
    }

    // Check if user is club admin
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

    // Check if user is tournament admin
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
      message: "Forbidden: You do not have permission to modify this match",
    });
  } catch (error) {
    console.error("Authorization error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};