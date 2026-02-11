import { Router } from "express";
import { createSchedule,getAllSchedules,getScheduleById,getMySchedules,getClubSchedules,UpdateSchedule,deleteSchedule } from "../controllers/scheduleController";

const router = Router();

//Get All Schedule
router.get("/",getAllSchedules);
//Get Schedule By ID
router.get("/:id",getScheduleById);
//Get Players Schedules
router.get("/me",getMySchedules);
//Get Club Schedules
router.get("/club/:id",getClubSchedules);
//Create Schedule
router.post("/",createSchedule);
//Update Schedule
router.put("/",UpdateSchedule);
//Delete Schedule
router.delete("/",deleteSchedule);

export default router;