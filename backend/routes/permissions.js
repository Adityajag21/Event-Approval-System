import express from 'express';
import {
  createRequest,
  getRequests,
  approveRequest,
  rejectRequest,
  getRequestById,
  getFormData
} from '../controllers/permissionsController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.route('/form-data')
  .get(getFormData);

router.route('/')
  .post(protect, authorize('Student'), upload.single('permissionLetter'), createRequest)
  .get(protect, getRequests);

router.route('/:id')
  .get(protect, getRequestById);

router.route('/:id/approve')
  .put(protect, authorize('Coordinator', 'HOD', 'Principal', 'Director'), approveRequest);

router.route('/:id/reject')
  .put(protect, authorize('Coordinator', 'HOD', 'Principal', 'Director'), rejectRequest);

export default router;
