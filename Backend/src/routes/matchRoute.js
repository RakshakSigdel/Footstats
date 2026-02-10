import {express} from "express"
const router = express.Router();

//Get All Matches
router.get("/")
//Get match by schedule
router.get("/:scheduleID")
//create match
router.post("/")
//update match
router.put("/")
//delete match
router.delete("/")

export default router;