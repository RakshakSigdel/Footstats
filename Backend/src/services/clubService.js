import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class ClubService {
  static async createClub(data, userId) {
    const newClub = await prisma.club.create({
      data: {
        name: data.name,
        description: data.description,
        logo: data.logo,
        location: data.location,
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

    // Get clubs where user is a member
    const userClubMemberships = await prisma.userClub.findMany({
      where: { userId: userId },
      include: {
        club: true,
      },
    });

    const memberClubs = userClubMemberships.map((uc) => uc.club);

    // Combine and remove duplicates (in case user is both creator and member)
    const allClubs = [...createdClubs];
    const createdClubIds = new Set(createdClubs.map((c) => c.clubId));

    memberClubs.forEach((club) => {
      if (!createdClubIds.has(club.clubId)) {
        allClubs.push(club);
      }
    });

    return allClubs;
  }

  static async updateClub(clubId, data, userId) {
    const updatedClub = await prisma.club.update({
      where: { clubId: Number(clubId), createdBy: userId },
      data: {
        name: data.name,
        description: data.description,
        location: data.location,
        logo: data.logo,
        foundedDate: data.foundedDate,
        createdBy: userId,
        createdAt: data.createdAt,
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
            position: true,
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
            position: true,
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
        ...club.creator,
        role: "admin",
        isCreator: true,
      });
    }

    // Add other members
    memberships.forEach((m) => {
      // Avoid duplicate if creator is also in UserClub
      if (m.user.userId !== club.createdBy) {
        members.push({
          ...m.user,
          role: m.role || "member",
          isCreator: false,
          joinedAt: m.joinedAt,
        });
      } else {
        // Update creator role if they have a UserClub entry
        const existingCreator = members.find(mem => mem.userId === club.createdBy);
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

  // Update member role
  static async updateMemberRole(clubId, userId, role) {
    const updated = await prisma.userClub.updateMany({
      where: {
        clubId: Number(clubId),
        userId: Number(userId),
      },
      data: {
        role: role,
      },
    });
    return updated;
  }
}
export default ClubService;
