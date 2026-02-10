import { Router } from 'express';
const router = Router();

//Get Match Event
router.get("/");
//Get Match Event By ID
router.get("/:id");
//Crete a new Match Event
router.post("/");
//Update Existing Match Event
router.put("/:id");
//Delete Match Event
router.delete("/:id");

export default router;