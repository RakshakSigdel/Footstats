const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/verifyToken");
const { authorizeClubOwnership } = require("../middleware/authorize");
const {createClub, getMyClubs, getAllClubs, getClubById, updateClub, deleteClub} = require("../controllers/clubController");

router.post("/", verifyToken, createClub);
router.get("/me", verifyToken, getMyClubs);
router.get("/", getAllClubs);
router.get("/:id", verifyToken, getClubById);
router.put("/:id", verifyToken, authorizeClubOwnership, updateClub);
router.delete("/:id", verifyToken, authorizeClubOwnership, deleteClub);

module.exports = router;