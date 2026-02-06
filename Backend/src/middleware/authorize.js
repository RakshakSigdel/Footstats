import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authorizeOwnership = (req, res, next) => {
  const loggedInUser = req.user.role; // decoded token: { id, role }
  const loggedInUserId = req.params.id;
  const resourceOwnerId = req.params.id;

  // Super Admin can do anything
  if (loggedInUser.role === "SUPERADMIN") return next();

  // Player can only update/delete their own account
  if (loggedInUser === "PLAYER" && loggedInUserId === resourceOwnerId) {
    return next();
  }
  return res.status(403).json({
    message: "Forbidden: You do not have permission to access this resource",
  });
};

export const authorizeTournamentOwnership = async (req, res, next) => {
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
