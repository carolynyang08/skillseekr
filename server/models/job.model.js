import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  // Unique identifier (greenhouse-{company}-{jobId})
  sourceId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },

  // Basic job info
  title: {
    type: String,
    required: true,
    index: true,
  },
  company: {
    type: String,
    required: true,
    index: true,
  },
  location: String,
  url: String,

  // Job description (full text)
  description: String,

  // Extracted skills (populated by skill extractor)
  skills: [{
    type: String,
    lowercase: true,
  }],

  // Job metadata
  department: String,
  employmentType: String, // full-time, part-time, contract, intern
  isRemote: Boolean,
  experienceLevel: {
    type: String,
    enum: ['intern', 'entry', 'mid', 'senior', 'lead', 'manager', 'unknown'],
    default: 'unknown',
  },

  // Source info
  source: {
    type: String,
    default: 'greenhouse',
  },

  // Timestamps
  postedAt: Date,
  fetchedAt: {
    type: Date,
    default: Date.now,
  },

  // For tracking if job is still active
  isActive: {
    type: Boolean,
    default: true,
  },
  lastSeenAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true, // adds createdAt and updatedAt
});

// Index for common queries
jobSchema.index({ company: 1, title: 1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ experienceLevel: 1 });
jobSchema.index({ postedAt: -1 });

// Static method to upsert a job (insert or update)
jobSchema.statics.upsertJob = async function(jobData) {
  return this.findOneAndUpdate(
    { sourceId: jobData.sourceId },
    {
      ...jobData,
      lastSeenAt: new Date(),
      isActive: true,
    },
    { upsert: true, new: true }
  );
};

const Job = mongoose.model('Job', jobSchema);

export default Job;
