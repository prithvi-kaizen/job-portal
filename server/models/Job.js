const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  salary: { type: String, required: true },
  tags: [{ type: String }],
  employerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, { timestamps: true });

// Text index for search
jobSchema.index({ title: 'text', description: 'text', company: 'text', tags: 'text' });

module.exports = mongoose.model('Job', jobSchema);
