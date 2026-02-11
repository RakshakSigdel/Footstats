import { Prisma } from "@prisma/client";

//User Must be either club admin or tournament admin to create the schedule
export const authorizeScheduleCreation = async (req, res, next) => {
    const loggedInUderID = req.user.userId;
    const {createdFromClub,createdFromTournament} = req.body;

    try{
        if(req.user.role == "SUPERADMIN"){
            return next();
        }

        if(!createdFromClub && !createdFromTournament){
            return res.status(400).json({
                message:"Schedule must be vreted from either club or tournament",
            })
        }

        //Check if user is club admin
        if(createdFromClub){
            const club = await Prisma.club.findUnique({
                where:{clubId:parseInt(createdFromClub)},
            });
            if(!club){
                return res.status(404).json({message:"Club Not Found"})
            }

            if(club.createdBy === loggedInUderID){
                return next();
            }

            const isClubAdmin = await Prisma.UserClubScalarFieldEnum.findFirst({
                where:{
                    clubId:parseInt(createdFromClub),
                    userId:loggedInUserId,
                    role:"ADMIN"
                },
            });
            if(!isClubAdmin){
                return res.status(403).json({
                    message:"Forbidden: Only Club admins can create club schedules",
                });
            }
            return next();
        }
        //Check if schedule is coming from tournament host
        if(createdFromTournament){
            const tournament = await Prisma.tournament.findUnique({
                where:{tournamentId:parseInt(createdFromTournament)},
            });
            if(!tournament){
                return res.status(404).json({message:"Tournament not found"});
            }
            if(tournament.createdBy === loggedInUserId){
                return next();
            }
            const isTournamentAdmin = await Prisma.tournamentAdmin.findFirst({
                where:{
                    tournamentid:parseInt(createdFromTournament),
                    userId:loggedInUserId,
                }
            });
            if(!isTournamentAdmin){
                return res.status(403).json({
                    message:"Forbidden: Only tournament admins can create tournament schedules",
                })
            }
            return next();
        }
    }
    catch(error){
        console.error("Authorization error:",error);
        return res.status(500).json({message:"Internal server error"});
    }
};