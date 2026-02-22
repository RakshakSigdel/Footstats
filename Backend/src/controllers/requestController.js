import { PrismaClient } from "@prisma/client";
import { RequestService } from "../services/requestService.js";

const prisma = new PrismaClient();

export const createJoinRequest = async (req, res) => {
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

    // Check if user is already a member
    const existingMembership = await prisma.userClub.findUnique({
      where: {
        userId_clubId: {
          userId,
          clubId,
        },
      },
    });

    if (existingMembership) {
      return res
        .status(409)
        .json({ message: "You are already a member of this club" });
    }

    const existingRequest = await prisma.clubRequest.findUnique({
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

export const getClubRequests = async (req, res) => {
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

export const approveJoinRequest = async (req, res) => {
  const { requestId } = req.params;
  console.log('Approving request:', requestId, 'by user:', req.user.userId);
  try {
    const approveRequest = await RequestService.approveJoinRequest(requestId);
    console.log('Request approved successfully:', approveRequest);
    res
      .status(200)
      .json({
        message: "Join request approved successfully",
        request: approveRequest,
      });
  } catch (error) {
    console.error('Error approving request:', error);
    res
      .status(500)
      .json({ message: "Error approving join request", error: error.message });
  }
};

export const rejectJoinRequest = async (req, res) => {
  const { requestId } = req.params;
  console.log('Rejecting request:', requestId, 'by user:', req.user.userId);
  try {
    const rejectRequest = await RequestService.rejectJoinRequest(requestId);
    console.log('Request rejected successfully:', rejectRequest);
    res
      .status(200)
      .json({
        message: "Join request rejected successfully",
        request: rejectRequest,
      });
  } catch (error) {
    console.error('Error rejecting request:', error);
    res
      .status(500)
      .json({ message: "Error rejecting join request", error: error.message });
  }
};


