const { PrismaClient } = require("@prisma/client");
const { RequestService } = require("../services/requestService");

const prisma = new PrismaClient();

const createJoinRequest = async (req, res) => {
  const userId = req.user.userId;
  const { clubId } = req.body;

  try {
    const club = await prisma.club.findUnique({
      where: { clubId },
      select: { createdBy: true },
    });

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    if (club.createdBy === userId) {
      return res
        .status(403)
        .json({ message: "Club creator cannot request to join this club" });
    }

    const existingRequest = await prisma.request.findUnique({
      where: {
        userId_clubId: {
          userId,
          clubId,
        },
      },
    });

    if (existingRequest) {
      return res
        .status(409)
        .json({ message: "You already requested to join this club" });
    }

    const newRequest = await RequestService.createJoinRequest({
      userId,
      clubId,
    });
    res
      .status(201)
      .json({
        message: "Join request created successfully",
        request: newRequest,
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating join request", error: error.message });
  }
};

const getClubRequests = async (req, res) => {
  const clubId = Number(req.params.clubId);
  try {
    const requests = await RequestService.getClubRequests(clubId);
    res.status(200).json({ requests });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching club requests", error: error.message });
  }
};

const approveJoinRequest = async (req, res) => {
  const { requestId } = req.params;
  try {
    const approveRequest = await RequestService.approveJoinRequest(requestId);
    res
      .status(200)
      .json({
        message: "Join request approved successfully",
        request: approveRequest,
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error approving join request", error: error.message });
  }
};

const rejectJoinRequest = async (req, res) => {
  const { requestId } = req.params;
  try {
    const rejectRequest = await RequestService.rejectJoinRequest(requestId);
    res
      .status(200)
      .json({
        message: "Join request rejected successfully",
        request: rejectRequest,
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error rejecting join request", error: error.message });
  }
};

module.exports = {
  createJoinRequest,
  getClubRequests,
  approveJoinRequest,
  rejectJoinRequest,
};
