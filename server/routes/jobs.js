const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const User = require('../models/User');
const { protect, authorize } = require('../middlewares/auth');

// @route   GET /api/jobs
// @desc    Get all jobs (with search/filter)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, location } = req.query;
    let query = {};

    if (search) {
      query.$text = { $search: search };
    }
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const jobs = await Job.find(query).populate('employerId', 'name').sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/jobs/:id
// @desc    Get job by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('employerId', 'name');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/jobs
// @desc    Create a job
// @access  Private/Employer
router.post('/', protect, authorize('employer', 'admin'), async (req, res) => {
  try {
    const job = new Job({ ...req.body, employerId: req.user._id });
    const createdJob = await job.save();
    res.status(201).json(createdJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update a job
// @access  Private/Employer
router.put('/:id', protect, authorize('employer', 'admin'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    // Make sure user owns job or is admin
    if (job.employerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to edit this job' });
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete a job
// @access  Private/Employer
router.delete('/:id', protect, authorize('employer', 'admin'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.employerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this job' });
    }

    await job.deleteOne();
    res.json({ message: 'Job removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/jobs/:id/bookmark
// @desc    Bookmark a job
// @access  Private/Candidate
router.post('/:id/bookmark', protect, authorize('candidate'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const jobId = req.params.id;

    if (user.bookmarkedJobs.includes(jobId)) {
      user.bookmarkedJobs = user.bookmarkedJobs.filter(id => id.toString() !== jobId);
    } else {
      user.bookmarkedJobs.push(jobId);
    }
    
    await user.save();
    res.json(user.bookmarkedJobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
