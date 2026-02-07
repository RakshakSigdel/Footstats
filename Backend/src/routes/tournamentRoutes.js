const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const {authorizeTournamentOwnership} = require('../middleware/authorize');
const{ createTournament ,getAllTournaments,updateTournament,deleteTournament,getTournamentById, getMyTournaments} = require('../controllers/tournamentController');

router.get('/me', verifyToken, getMyTournaments);
router.get('/', getAllTournaments);
router.get('/:id', verifyToken, getTournamentById);
router.post('/', verifyToken, createTournament);
router.put('/:id', verifyToken, authorizeTournamentOwnership, updateTournament);
router.delete('/:id', verifyToken, authorizeTournamentOwnership, deleteTournament);  

module.exports = router;