import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();  

export const authorizeScheduleCreation = async (req, res, next) => {
    const loggedInUserId = req.user.userId;
    const { createdFromClub, createdFromTournament } = req.body;

    try {
        if (req.user.role === "SUPERADMIN") {
            return next();
        }

        if (!createdFromClub && !createdFromTournament) {
            return res.status(400).json({
                message: "Schedule must be created from either club or tournament",
            });
        }

        // CLUB CHECK
        if (createdFromClub) {
            const clubId = parseInt(createdFromClub);

            const club = await prisma.club.findUnique({
                where: { clubId },
            });

            if (!club) {
                return res.status(404).json({ message: "Club Not Found" });
            }

            if (club.createdBy === loggedInUserId) {
                return next();
            }

            const isClubAdmin = await prisma.userClub.findFirst({
                where: {
                    clubId,
                    userId: loggedInUserId,
                    role: "ADMIN",
                },
            });

            if (!isClubAdmin) {
                return res.status(403).json({
                    message: "Forbidden: Only club admins can create club schedules",
                });
            }

            return next();
        }

        // TOURNAMENT CHECK
        if (createdFromTournament) {
            const tournamentId = parseInt(createdFromTournament);

            const tournament = await prisma.tournament.findUnique({
                where: { tournamentId },
            });

            if (!tournament) {
                return res.status(404).json({ message: "Tournament not found" });
            }

            if (tournament.createdBy === loggedInUserId) {
                return next();
            }

            const isTournamentAdmin = await prisma.tournamentAdmin.findFirst({
                where: {
                    tournamentId,
                    userId: loggedInUserId,
                },
            });

            if (!isTournamentAdmin) {
                return res.status(403).json({
                    message: "Forbidden: Only tournament admins can create tournament schedules",
                });
            }

            return next();
        }

    } catch (error) {
        console.error("Authorization error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
