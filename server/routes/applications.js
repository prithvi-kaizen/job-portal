const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const upload = require('../middlewares/upload');
const { protect, authorize } = require('../middlewares/auth');

// @route   POST /api/applications
// @desc    Apply for a job
// @access  Private/Candidate
router.post('/', protect, authorize('candidate'), upload.single('resume'), async (req, res) => {
  try {
    const { jobId } = req.body;
    
    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Check if already applied
    const existingApp = await Application.findOne({ userId: req.user._id, jobId });
    if (existingApp) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a resume (PDF)' });
    }

    const application = new Application({
      userId: req.user._id,
      jobId,
      resumeURL: `/uploads/${req.file.filename}`
    });

    const createdApp = await application.save();
    res.status(201).json(createdApp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/applications/job/:jobId
// @desc    Get applications for a specific job
// @access  Private/Employer
router.get('/job/:jobId', protect, authorize('employer', 'admin'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Ensure it's the employer's job
    if (job.employerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const applications = await Application.find({ jobId: req.params.jobId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
      
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/applications/me
// @desc    Get current user's applications
// @access  Private/Candidate
router.get('/me', protect, authorize('candidate'), async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user._id })
      .populate({
        path: 'jobId',
        select: 'title company location'
      })
      .sort({ createdAt: -1 });
      
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/applications/:id/status
// @desc    Update application status
// @access  Private/Employer
router.put('/:id/status', protect, authorize('employer', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    
    // Ensure valid status
    if (!['applied', 'interviewing', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await Application.findById(req.params.id).populate('jobId');
    if (!application) return res.status(404).json({ message: 'Application not found' });

    // Check ownership
    if (application.jobId.employerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    application.status = status;
    const updatedApp = await application.save();
    
    res.json(updatedApp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
