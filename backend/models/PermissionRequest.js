import mongoose from 'mongoose';

const HistorySchema = new mongoose.Schema({
  role: { type: String, required: true },
  action: { type: String, enum: ['Created', 'Approved', 'Rejected'], required: true },
  reason: { type: String }, // Provided if rejected
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now }
});

const PermissionRequestSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  fileUrl: {
    type: String, // PDF link/path
    required: true
  },
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },
  targetCoordinator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetHOD: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  skipHOD: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currentStage: {
    type: String,
    enum: ['Coordinator', 'HOD', 'Principal', 'Director', 'Completed'],
    default: 'Coordinator'
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  rejectedBy: {
    type: String
  },
  rejectionReason: {
    type: String
  },
  history: [HistorySchema]
}, { timestamps: true });

export default mongoose.model('PermissionRequest', PermissionRequestSchema);
