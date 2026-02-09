const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const { authorizeOwnership } = require('../middleware/authorize');
const { getAllPlayers, getPlayerById,updatePlayerById, deletePlayerById,getMyProfile } = require('../controllers/playerController');

//GET api/players/
router.get('/',getAllPlayers);
router.get('/me', verifyToken, getMyProfile); 
router.get('/:id', verifyToken, getPlayerById);
router.put('/:id', verifyToken, authorizeOwnership, updatePlayerById);
router.delete('/:id', verifyToken, authorizeOwnership, deletePlayerById);

module.exports = router;