const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const {authorizeTournamentOwnership} = require('../middleware/authorize');
const{ createTournament ,getAllTournaments,updateTournament,deleteTournament,getTournamentById, getMyTournaments} = require('../controllers/tournamentController');

router.post('/createTournament', verifyToken, createTournament);
router.get('/getMyTournaments', verifyToken, getMyTournaments);
router.get('/getAllTournaments', getAllTournaments);
router.get('/getTournamentById/:id', verifyToken, getTournamentById);
router.put('/updateTournamentById/:id', verifyToken, authorizeTournamentOwnership, updateTournament);
router.delete('/deleteTournamentById/:id', verifyToken, authorizeTournamentOwnership, deleteTournament);  

module.exports = router;