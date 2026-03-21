import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import {
  getLocationRecommendations,
  searchPlaces,
} from "../controllers/locationController.js";

const router = Router();

router.get("/search", searchPlaces);
router.get("/recommendations", verifyToken, getLocationRecommendations);

export default router;
