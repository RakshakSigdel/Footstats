import {PrismaClient} from "@prisma/client";
const prisma = new PrismaClient();

class ClubService {
    static async createClub (data, userId){
        const newClub = await prisma.club.create({
            data:{
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
        const clubs = await prisma.club.findMany({
          where: { createdBy: userId },
        });
        return clubs;
      }
    
    
    static async updateClub(clubId, data, userId) {
        const updatedClub = await prisma.club.update({
          where: { clubId:Number(clubId) , createdBy: userId },
            data: {
            name: data.name,
            description: data.description,
            location: data.location,
            logo: data.logo,
            foundedDate: data.foundedDate,
            createdBy: userId,
            createdAt:data.createdAt,
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
    
    }
export default ClubService;