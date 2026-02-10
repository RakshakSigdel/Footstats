import { Router } from "express";

const router = Router();

//Get All Schedule
router.get("/")
//Get Schedule By ID
router.get("/:id")
//Get Players Schedules
router.get("/me")
//Get Club Schedules
router.get("/club/:id")
//Create Schedule
router.post("/")
//Update Schedule
router.put("/")
//Delete Schedule
router.delete("/")

export default router;