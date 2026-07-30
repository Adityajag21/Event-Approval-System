import Club from '../models/Club.js';
import User from '../models/User.js';

// @desc    Get all clubs
// @route   GET /api/admin/clubs
// @access  Private/Admin
export const getClubs = async (req, res) => {
  try {
    const clubs = await Club.find({}).populate('coordinator', 'name email');
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new club
// @route   POST /api/admin/clubs
// @access  Private/Admin
export const createClub = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const clubExists = await Club.findOne({ name });
    if (clubExists) {
      return res.status(400).json({ message: 'Club already exists' });
    }

    const club = await Club.create({ name, description });
    res.status(201).json(club);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign coordinator to a club
// @route   PUT /api/admin/clubs/:id/assign
// @access  Private/Admin
export const assignCoordinator = async (req, res) => {
  try {
    const { coordinatorId } = req.body;
    
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Verify user is a coordinator
    if (coordinatorId) {
      const user = await User.findById(coordinatorId);
      if (!user || user.role !== 'Coordinator') {
        return res.status(400).json({ message: 'User is not a valid Coordinator' });
      }
    }

    club.coordinator = coordinatorId || null;
    await club.save();

    const updatedClub = await Club.findById(req.params.id).populate('coordinator', 'name email');
    res.json(updatedClub);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all coordinators
// @route   GET /api/admin/coordinators
// @access  Private/Admin
export const getCoordinators = async (req, res) => {
  try {
    const coordinators = await User.find({ role: 'Coordinator' }).select('name email');
    res.json(coordinators);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
