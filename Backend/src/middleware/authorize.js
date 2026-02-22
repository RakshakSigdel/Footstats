import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const authorizeOwnership = (req, res, next) => {
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

export const authorizeClubOwnership = async (req, res, next) => {
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

// Authorize club admin for viewing/managing requests
export const authorizeClubAdmin = async (req, res, next) => {
  const loggedInUserId = req.user.userId;
  const clubId = parseInt(req.params.clubId);

  try {
    const club = await prisma.club.findUnique({
      where: { clubId: clubId },
    });

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    if (req.user.role === "SUPERADMIN") {
      return next();
    }

    // Club creator can manage requests
    if (club.createdBy === loggedInUserId) {
      return next();
    }

    return res.status(403).json({
      message: "Forbidden: Only club admins can access requests",
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Authorize club admin for approving/rejecting specific requests
export const authorizeRequestAction = async (req, res, next) => {
  const loggedInUserId = req.user.userId;
  const requestId = parseInt(req.params.requestId);

  console.log('Authorizing request action - User:', loggedInUserId, 'Request:', requestId);

  try {
    const request = await prisma.clubRequest.findUnique({
      where: { requestId: requestId },
      include: { club: true },
    });

    if (!request) {
      console.log('Request not found:', requestId);
      return res.status(404).json({ message: "Request not found" });
    }

    console.log('Request found:', request.requestId, 'Club creator:', request.club.createdBy);

    if (req.user.role === "SUPERADMIN") {
      console.log('User is SUPERADMIN, allowing access');
      return next();
    }

    // Club creator can approve/reject requests
    if (request.club.createdBy === loggedInUserId) {
      console.log('User is club creator, allowing access');
      return next();
    }

    console.log('Authorization failed - User is not club creator');
    return res.status(403).json({
      message: "Forbidden: Only club admins can manage requests",
    });
  } catch (error) {
    console.error('Error in authorizeRequestAction:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


