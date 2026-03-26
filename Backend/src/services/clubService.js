import { hasValidCoordinates, parseCoordinate } from "../utils/geo.js";
import prisma from "../utils/prisma.js";

const buildVerifiedLocationData = (data) => {
  const latitude = parseCoordinate(data.locationLatitude);
  const longitude = parseCoordinate(data.locationLongitude);
  const locationPlaceId = String(data.locationPlaceId || "").trim();

  if (!hasValidCoordinates(latitude, longitude) || !locationPlaceId) {
    throw new Error("Please choose a valid location from the suggestions");
  }

  return {
    locationLatitude: latitude,
    locationLongitude: longitude,
    locationPlaceId,
  };
};

class ClubService {
  static async createClub(data, userId) {
    const verifiedLocation = buildVerifiedLocationData(data);
    const newClub = await prisma.club.create({
      data: {
        name: data.name,
        description: data.description,
        logo: data.logo,
        location: String(data.location || "").trim(),
        ...verifiedLocation,
        foundedDate: data.foundedDate,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return newClub;
  }

  static async getAllClubs() {
    const clubs = await prisma.club.findMany({
      include: {
        creator: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    return clubs;
  }

  static async getClubById(clubId) {
    const club = await prisma.club.findUnique({
      where: { clubId: Number(clubId) },
    });
    return club;
  }

  static async getClubsByUserId(userId) {
    // Get clubs where user is the creator
    const createdClubs = await prisma.club.findMany({
      where: { createdBy: userId },
    });

    // Get clubs where user is a member (via UserClub)
    const userClubMemberships = await prisma.userClub.findMany({
      where: { userId: userId },
      include: { club: true },
    });

    // Build result: created clubs tagged as OWNER
    const createdClubIds = new Set(createdClubs.map((c) => c.clubId));
    const results = createdClubs.map((club) => ({ ...club, userRole: "OWNER" }));

    // Add member clubs (skip if user is also creator to avoid duplicates)
    userClubMemberships.forEach((m) => {
      if (!createdClubIds.has(m.club.clubId)) {
        results.push({ ...m.club, userRole: m.role ?? "MEMBER" });
      }
    });

    return results;
  }

  static async updateClub(clubId, data, userId) {
    const existingClub = await prisma.club.findUnique({
      where: { clubId: Number(clubId) },
      select: {
        location: true,
        locationLatitude: true,
        locationLongitude: true,
        locationPlaceId: true,
      },
    });

    if (!existingClub) {
      throw new Error("Club not found");
    }

    const nextLocation =
      data.location !== undefined ? String(data.location || "").trim() : undefined;
    const locationChanged =
      nextLocation !== undefined && nextLocation !== String(existingClub.location || "").trim();

    const hasIncomingCoordinates =
      data.locationLatitude !== undefined ||
      data.locationLongitude !== undefined ||
      data.locationPlaceId !== undefined;

    const verifiedLocation =
      locationChanged || hasIncomingCoordinates
        ? buildVerifiedLocationData(data)
        : {
            locationLatitude: existingClub.locationLatitude,
            locationLongitude: existingClub.locationLongitude,
            locationPlaceId: existingClub.locationPlaceId,
          };

    const updatedClub = await prisma.club.update({
      where: { clubId: Number(clubId) },
      data: {
        name: data.name,
        description: data.description,
        ...(nextLocation !== undefined && { location: nextLocation }),
        ...verifiedLocation,
        logo: data.logo,
        foundedDate: data.foundedDate,
        updatedAt: new Date(),
      },
    });
    return updatedClub;
  }

  static async deleteClub(clubId) {
    const deletedClub = await prisma.club.delete({
      where: { clubId: Number(clubId) },
    });
    return deletedClub;
  }

  // Get all members of a club (including creator)
  static async getClubMembers(clubId) {
    const clubIdNum = Number(clubId);
    
    // Get the club with creator info
    const club = await prisma.club.findUnique({
      where: { clubId: clubIdNum },
      select: {
        clubId: true,
        createdBy: true,
        creator: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePhoto: true,
          },
        },
      },
    });

    if (!club) {
      throw new Error("Club not found");
    }

    // Get all UserClub memberships for this club
    const memberships = await prisma.userClub.findMany({
      where: { clubId: clubIdNum },
      include: {
        user: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePhoto: true,
          },
        },
      },
    });

    // Build members list with roles
    const members = [];
    
    // Add creator as admin
    if (club.creator) {
      members.push({
        user: club.creator,
        role: "ADMIN",
        isCreator: true,
      });
    }

    // Add other members
    memberships.forEach((m) => {
      // Avoid duplicate if creator is also in UserClub
      if (m.user.userId !== club.createdBy) {
        members.push({
          user: { ...m.user, position: m.position },
          role: m.role || "MEMBER",
          isCreator: false,
          joinedAt: m.joinedAt,
        });
      } else {
        // Update creator role if they have a UserClub entry
        const existingCreator = members.find(mem => mem.user?.userId === club.createdBy);
        if (existingCreator && m.role) {
          existingCreator.role = m.role;
        }
      }
    });

    return members;
  }

  // Add a member to a club
  static async addMember(clubId, userId, role = "member") {
    const membership = await prisma.userClub.create({
      data: {
        clubId: Number(clubId),
        userId: Number(userId),
        role: role,
        joinedAt: new Date(),
      },
      include: {
        user: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
    return membership;
  }

  // Remove a member from a club
  static async removeMember(clubId, userId) {
    const deleted = await prisma.userClub.deleteMany({
      where: {
        clubId: Number(clubId),
        userId: Number(userId),
      },
    });
    return deleted;
  }

  // Allow a member to leave a club themselves (cannot be the creator)
  static async leaveClub(clubId, userId) {
    // Verify they are actually a member (not just creator)
    const membership = await prisma.userClub.findUnique({
      where: { userId_clubId: { userId: Number(userId), clubId: Number(clubId) } },
    });
    if (!membership) throw { status: 400, message: "You are not a member of this club" };
    return prisma.userClub.delete({
      where: { userId_clubId: { userId: Number(userId), clubId: Number(clubId) } },
    });
  }

  // Update member role and/or position
  static async updateMember(clubId, userId, { role, position }) {
    const data = {};
    if (role !== undefined) data.role = role;
    if (position !== undefined) data.position = position;
    const updated = await prisma.userClub.updateMany({
      where: {
        clubId: Number(clubId),
        userId: Number(userId),
      },
      data,
    });
    return updated;
  }

  // Get clubs where user is creator or has ADMIN role
  static async getAdminClubs(userId) {
    const createdClubs = await prisma.club.findMany({
      where: { createdBy: userId },
    });

    const adminMemberships = await prisma.userClub.findMany({
      where: { userId, role: "ADMIN" },
      include: { club: true },
    });

    const memberAdminClubs = adminMemberships.map((m) => m.club);
    const createdIds = new Set(createdClubs.map((c) => c.clubId));
    const all = [...createdClubs];
    memberAdminClubs.forEach((c) => { if (!createdIds.has(c.clubId)) all.push(c); });
    return all;
  }

  // Search clubs by name (top 10)
  static async searchClubs(query) {
    return prisma.club.findMany({
      where: {
        name: { contains: query, mode: "insensitive" },
      },
      select: { clubId: true, name: true, location: true },
      orderBy: { name: "asc" },
      take: 10,
    });
  }
}
export default ClubService;
