import { Router } from 'express';
const router = Router();
import { verifyToken } from '../middleware/verifyToken';
import { authorizeTournamentOwnership } from '../middleware/authorize';
import { createTournament, getAllTournaments, updateTournament, deleteTournament, getTournamentById, getMyTournaments } from '../controllers/tournamentController';

router.get('/me', verifyToken, getMyTournaments);
router.get('/', getAllTournaments);
router.get('/:id', verifyToken, getTournamentById);
router.post('/', verifyToken, createTournament);
router.put('/:id', verifyToken, authorizeTournamentOwnership, updateTournament);
router.delete('/:id', verifyToken, authorizeTournamentOwnership, deleteTournament);  

export default router;