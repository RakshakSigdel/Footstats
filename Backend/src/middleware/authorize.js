const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const authorizeOwnership = (req, res, next) => {
  const loggedInUserId = req.user.userId; // decoded token: { userId, email, role }
  const loggedInRole = req.user.role;
  const resourceOwnerId = parseInt(req.params.id);

  // Super Admin can do anything
  if (loggedInRole === "SUPERADMIN") return next();

  // Player can only update/delete their own account
  if (loggedInRole === "PLAYER" && loggedInUserId === resourceOwnerId) {
    return next();
  }
  return res.status(403).json({
    message: "Forbidden: You do not have permission to access this resource",
  });
};

const authorizeTournamentOwnership = async (req, res, next) => {
  const loggedInUserId = req.user.userId;
  const tournamentId = parseInt(req.params.id);

  console.log("Logged in user ID:", loggedInUserId);
  console.log("Tournament ID:", tournamentId);

  try {
    const tournament = await prisma.tournament.findUnique({
      where: { tournamentId: tournamentId},
    });

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    if (req.user.role === "SUPERADMIN") {
      console.log("User is SUPERADMIN  " + req.user.role);
      return next();
    }

    // Tournament creator can update/delete their own tournament
    if (tournament.createdBy === loggedInUserId) {
      return next();
    }

    return res.status(403).json({
      message: "Forbidden: You do not have permission to access this resource",
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const authorizeClubOwnership = async (req, res, next) => {
  const loggedInUserId = req.user.userId;
  const clubId = parseInt(req.params.id);

  console.log("Logged in user ID:", loggedInUserId);
  console.log("Club ID:", clubId);

  try {
    const club = await prisma.club.findUnique({
      where: { clubId: clubId },
    });

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    if (req.user.role === "SUPERADMIN") {
      console.log("User is SUPERADMIN  " + req.user.role);
      return next();
    }

    // Club creator can update/delete their own club
    if (club.createdBy === loggedInUserId) {
      return next();
    }

    return res.status(403).json({
      message: "Forbidden: You do not have permission to access this resource",
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = { authorizeOwnership, authorizeTournamentOwnership, authorizeClubOwnership };
