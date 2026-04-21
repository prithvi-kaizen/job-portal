const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  jobId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job', 
    required: true 
  },
  resumeURL: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['applied', 'interviewing', 'rejected'], 
    default: 'applied' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
