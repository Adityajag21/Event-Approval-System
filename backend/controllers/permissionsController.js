import PermissionRequest from '../models/PermissionRequest.js';
import User from '../models/User.js';
import Club from '../models/Club.js';
import { sendEmail } from '../utils/email.js';

export const getFormData = async (req, res) => {
  try {
    const clubs = await Club.find().populate('coordinator', 'name email');
    const hods = await User.find({ role: 'HOD' }).select('name email department');
    res.json({ clubs, hods });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const STAGES = ['Coordinator', 'HOD', 'Principal', 'Director', 'Completed'];

// Helper to notify the next authority
const notifyNextAuthority = async (stage, requestDetails) => {
  if (stage === 'Completed') return;
  
  let emails = '';

  if (stage === 'HOD' && requestDetails.targetHOD) {
    const hod = await User.findById(requestDetails.targetHOD);
    if (hod) emails = hod.email;
  } else if (stage === 'Coordinator' && requestDetails.targetCoordinator) {
    // Should typically not be called for Coordinator from approveRequest, but covering bases
    const coordinator = await User.findById(requestDetails.targetCoordinator);
    if (coordinator) emails = coordinator.email;
  } else {
    const nextAuthorityUsers = await User.find({ role: stage });
    emails = nextAuthorityUsers.map(u => u.email).join(',');
  }

  if (emails) {
    await sendEmail({
      to: emails,
      subject: `New Permission Request: ${requestDetails.eventName}`,
      html: `
        <h3>A new permission request requires your approval.</h3>
        <p><strong>Event:</strong> ${requestDetails.eventName}</p>
        <p><strong>Description:</strong> ${requestDetails.description}</p>
        <p><strong>Date:</strong> ${new Date(requestDetails.date).toDateString()}</p>
        <p>Please log in to your dashboard to review it.</p>
        <a href="${process.env.FRONTEND_URL}/login">Login to Dashboard</a>
      `
    });
  }
};

// Helper to notify student and lower authorities on rejection
const notifyRejection = async (request, actor) => {
  const student = await User.findById(request.createdBy);
  const emailsToNotify = [student.email];
  
  // Find lower authorities that previously approved
  const previousApproversList = request.history.filter(h => h.action === 'Approved').map(h => h.role);
  const lowerAuthDbUsers = await User.find({ role: { $in: previousApproversList } });
  lowerAuthDbUsers.forEach(u => {
    if (!emailsToNotify.includes(u.email)) {
      emailsToNotify.push(u.email);
    }
  });

  const emails = emailsToNotify.join(',');

  if (emails) {
    await sendEmail({
      to: emails,
      subject: `⚠️ Permission Request Rejected: ${request.eventName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #d32f2f; text-align: center;">Request Rejected</h2>
          <p>Your permission request for <strong>${request.eventName}</strong> has been <strong>rejected</strong>.</p>
          
          <div style="background-color: #ffebee; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d32f2f;">
            <p><strong>Rejected By:</strong> ${actor.name} (${actor.role})</p>
            <p><strong>Reason Provided:</strong> ${request.rejectionReason}</p>
          </div>
          
          <p>If you have any questions or need to submit a revised request, please log in to your dashboard.</p>
          <br>
          <a href="${process.env.FRONTEND_URL}/login" style="background-color: #d32f2f; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">View Dashboard</a>
        </div>
      `
    });
  }
};

export const createRequest = async (req, res) => {
  try {
    const { eventName, description, date, clubId, targetHOD } = req.body;
    
    // File path
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
    
    if (!fileUrl) {
      return res.status(400).json({ message: 'Permission letter is required' });
    }

    if (!clubId) {
      return res.status(400).json({ message: 'Club selection is required' });
    }

    const club = await Club.findById(clubId);
    if (!club || !club.coordinator) {
      return res.status(400).json({ message: 'Selected club has no assigned coordinator' });
    }

    const skipHOD = !targetHOD;

    const request = await PermissionRequest.create({
      eventName,
      description,
      date,
      fileUrl,
      club: clubId,
      targetCoordinator: club.coordinator,
      targetHOD: targetHOD || null,
      skipHOD,
      createdBy: req.user._id,
      history: [{
        role: req.user.role,
        action: 'Created',
        actor: req.user._id,
      }]
    });

    // Notify the specific coordinator initially
    const coordinatorUser = await User.findById(club.coordinator);
    if (coordinatorUser && coordinatorUser.email) {
      await sendEmail({
        to: coordinatorUser.email,
        subject: `New Permission Request: ${eventName}`,
        html: `
          <h3>A new permission request requires your approval as Coordinator.</h3>
          <p><strong>Event:</strong> ${eventName}</p>
          <p><strong>Description:</strong> ${description}</p>
          <p>Please log in to your dashboard to review it.</p>
          <a href="${process.env.FRONTEND_URL}/login">Login to Dashboard</a>
        `
      });
    }

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRequests = async (req, res) => {
  try {
    const { role, _id } = req.user;
    let requests;

    if (role === 'Student') {
      requests = await PermissionRequest.find({ createdBy: _id }).populate('history.actor', 'name role').populate('createdBy', 'name email').populate('club');
    } else {
      let queryOr = [
        { 'history.role': role },
        { status: 'Approved' },
        { status: 'Rejected' }
      ];

      if (role === 'Coordinator') {
        queryOr.push({ currentStage: 'Coordinator', status: 'Pending', targetCoordinator: _id });
      } else if (role === 'HOD') {
        queryOr.push({ currentStage: 'HOD', status: 'Pending', targetHOD: _id });
      } else {
        queryOr.push({ currentStage: role, status: 'Pending' });
      }

      requests = await PermissionRequest.find({
        $or: queryOr
      }).populate('history.actor', 'name role').populate('createdBy', 'name email').populate('club').sort({ createdAt: -1 });
    }

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await PermissionRequest.findById(id);

    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'Pending') return res.status(400).json({ message: 'Request is not pending' });
    if (request.currentStage !== req.user.role) return res.status(403).json({ message: 'Not authorized for this stage' });

    let currentStageIndex = STAGES.indexOf(request.currentStage);
    let nextStage = STAGES[currentStageIndex + 1];

    if (request.currentStage === 'Coordinator' && request.skipHOD) {
      nextStage = 'Principal';
    }

    request.currentStage = nextStage;
    if (nextStage === 'Completed') {
      request.status = 'Approved';
    }

    request.history.push({
      role: req.user.role,
      action: 'Approved',
      actor: req.user._id,
    });

    await request.save();

    const student = await User.findById(request.createdBy);

    if (nextStage === 'Completed') {
      await sendEmail({
        to: student.email,
        subject: `🎉 FINAL APPROVAL: Permission Granted for ${request.eventName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #2e7d32; text-align: center;">Permission Officially Granted!</h2>
            <p>We are pleased to inform you that your event permission request has received final approval from the Director and is now <strong>fully authorized</strong>.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
              <h3 style="margin-top: 0; color: #333;">Event Details:</h3>
              <p style="margin: 4px 0;"><strong>Event Name:</strong> ${request.eventName}</p>
              <p style="margin: 4px 0;"><strong>Date:</strong> ${new Date(request.date).toDateString()}</p>
              <p style="margin: 4px 0;"><strong>Status:</strong> <span style="background-color: #4caf50; color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.85em;">Final Approval</span></p>
            </div>
            
            <p>You may now proceed with your event preparations.</p>
            <br>
            <p>Best Regards,<br><strong>Campus Administration</strong></p>
          </div>
        `
      });
    } else {
      // Notify the next authority in line
      await notifyNextAuthority(nextStage, request);
      
      // Notify the student that their request passed an intermediate stage
      await sendEmail({
        to: student.email,
        subject: `Update: Request Approved by ${req.user.role} (${request.eventName})`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h3 style="color: #1976d2; margin-top:0;">Progress Update: ${request.eventName}</h3>
            <p>We want to let you know that your permission request has been <strong>approved</strong> by the <strong>${req.user.role}</strong>.</p>
            <p>It is now pending review at the next stage (${nextStage}).</p>
            <br>
            <a href="${process.env.FRONTEND_URL}/login" style="background-color: #1976d2; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">View Progress on Dashboard</a>
          </div>
        `
      });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    if (!reason) return res.status(400).json({ message: 'Rejection reason is required' });

    const request = await PermissionRequest.findById(id);

    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'Pending') return res.status(400).json({ message: 'Request is not pending' });
    if (request.currentStage !== req.user.role) return res.status(403).json({ message: 'Not authorized for this stage' });

    request.status = 'Rejected';
    request.rejectedBy = req.user.role;
    request.rejectionReason = reason;

    request.history.push({
      role: req.user.role,
      action: 'Rejected',
      reason: reason,
      actor: req.user._id,
    });

    await request.save();

    await notifyRejection(request, req.user);

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRequestById = async (req, res) => {
  try {
    const request = await PermissionRequest.findById(req.params.id)
      .populate('history.actor', 'name role')
      .populate('createdBy', 'name email')
      .populate('club')
      .populate('targetCoordinator', 'name')
      .populate('targetHOD', 'name department');
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
