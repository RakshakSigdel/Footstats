const {PrismaClient} = require('@prisma/client');

const prisma = new PrismaClient();

class RequestService {
    static async createJoinRequest(data) {
        const newRequest = await prisma.request.create({
            data: {
                userId: data.userId,
                clubId: data.clubId,
                status: 'PENDING',
            },
        });
        return newRequest;
    }

    static async getClubRequests(clubId) {
        const requests = await prisma.request.findMany({
            where: {
                clubId: clubId,
            },
            include: {
                user: true,
                club: true,
            },
        });
        return requests;
    }

    static async approveJoinRequest(requestId) {
        const request = await prisma.request.findUnique({
            where: { requestId: Number(requestId) },
            include: { user: true, club: true },
        });

        if (!request) {
            throw new Error("Request not found");
        }

        const updatedRequest = await prisma.request.update({
            where: { requestId: Number(requestId) },
            data: {
                status: "APPROVED",
            },
    });
        return updatedRequest;
    }

    static async rejectJoinRequest(requestId) {
        const deletedrequest = await prisma.request.delete({
            where: { requestId: Number(requestId) },
        });
        return deletedrequest;
    }
}

module.exports = {RequestService};