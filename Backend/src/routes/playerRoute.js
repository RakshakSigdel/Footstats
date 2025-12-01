const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const { authorizeOwnership } = require('../middleware/authorize');
const { getAllPlayers, getPlayerById,updatePlayerById, deletePlayerById } = require('../controllers/playerController');

//GET api/players/
router.get('/getAllPlayers',getAllPlayers);
router.get('/getPlayerById/:id', verifyToken, getPlayerById);
router.put('/updatePlayerById/:id', verifyToken, authorizeOwnership, updatePlayerById);
router.delete('/deletePlayerById/:id', verifyToken, authorizeOwnership, deletePlayerById);

module.exports = router;