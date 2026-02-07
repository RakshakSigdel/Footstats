const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const { authorizeOwnership } = require('../middleware/authorize');
const { getAllPlayers, getPlayerById,updatePlayerById, deletePlayerById,getMyProfile } = require('../controllers/playerController');

//GET api/players/
router.get('/players',getAllPlayers);
router.get('/players/:id', verifyToken, getPlayerById);
router.get('/palyers/me', verifyToken, getMyProfile);
router.put('/players/:id', verifyToken, authorizeOwnership, updatePlayerById);
router.delete('/players/:id', verifyToken, authorizeOwnership, deletePlayerById);

module.exports = router;