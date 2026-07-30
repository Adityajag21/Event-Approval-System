import express from 'express';
import { getClubs, createClub, assignCoordinator, getCoordinators } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('Admin'));

router.get('/clubs', getClubs);
router.post('/clubs', createClub);
router.put('/clubs/:id/assign', assignCoordinator);
router.get('/coordinators', getCoordinators);

export default router;
