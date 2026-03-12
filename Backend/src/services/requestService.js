import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class RequestService {
    static async createJoinRequest(data) {
        const newRequest = await prisma.clubRequest.create({
            data: {
                userId: data.userId,
                clubId: data.clubId,
                preferredPosition: data.preferredPosition,
                whyJoin: data.whyJoin || null,
                additionalMessage: data.additionalMessage || null,
                status: 'PENDING',
            },
        });
        return newRequest;
    }

    static async getClubRequests(clubId) {
        const requests = await prisma.clubRequest.findMany({
            where: {
                clubId: clubId,
                status: 'PENDING', // Only show pending requests
            },
            include: {
                user: true,
                club: true,
            },
        });
        console.log(`Found ${requests.length} pending requests for club ${clubId}`);
        return requests;
    }

    static async approveJoinRequest(requestId) {
        const request = await prisma.clubRequest.findUnique({
            where: { requestId: Number(requestId) },
            include: { user: true, club: true },
        });

        if (!request) {
            throw new Error("Request not found");
        }

        // Add user to club and update request status in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Check if user is already a member
            const existingMembership = await tx.userClub.findUnique({
                where: {
                    userId_clubId: {
                        userId: request.userId,
                        clubId: request.clubId,
                    },
                },
            });

            // Create UserClub entry only if not already a member
            if (!existingMembership) {
                await tx.userClub.create({
                    data: {
                        userId: request.userId,
                        clubId: request.clubId,
                        position: request.preferredPosition || null,
                    },
                });
            } else {
                // Update position even if already a member
                await tx.userClub.update({
                    where: { userId_clubId: { userId: request.userId, clubId: request.clubId } },
                    data: { position: request.preferredPosition || null },
                });
            }

            // Update request status
            const updatedRequest = await tx.clubRequest.update({
                where: { requestId: Number(requestId) },
                data: {
                    status: "APPROVED",
                },
            });

            return updatedRequest;
        });

        return result;
    }

    static async rejectJoinRequest(requestId) {
        const deletedrequest = await prisma.clubRequest.delete({
            where: { requestId: Number(requestId) },
        });
        return deletedrequest;
    }
}

export { RequestService };