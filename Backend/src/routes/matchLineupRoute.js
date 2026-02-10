import {express} from "express"
const router = express.router();

//Get All Match Lineup
router.get("/")
//Get Match lineup by match
router.get("/matchId")
//Create match lineup
router.post("/")
//Update Match lineup
router.put("/:id")
//Delete Match Lineup
router.delete("/:id")

export default router;