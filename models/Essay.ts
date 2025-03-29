import mongoose from 'mongoose';

const EssaySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: false, // Can start as empty
  },
  topic: {
    type: String,
    required: [true, 'Please provide an essay topic'],
    trim: true
  },
  thesis: {
    type: String,
    required: false,
    trim: true
  },
  arguments: [{
    type: String,
    trim: true
  }],
  citations: [{
    type: String,
    trim: true
  }], // Simple string array for citations
  status: {
    type: String,
    enum: ['draft', 'in-progress', 'complete'],
    default: 'draft'
  },
  aiModel: {
    type: String,
    default: 'sonar', // Perplexity Sonar model
    enum: ['sonar', 'claude', 'gpt4']
  },
  wordCount: {
    type: Number,
    default: 0
  }
}, {
  // Use created_at and updated_at field names instead of createdAt/updatedAt
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
});

// Add index for faster queries by user
EssaySchema.index({ user: 1, created_at: -1 });

// Virtual for formatted created date - Fixed TypeScript error
interface EssayDocument extends mongoose.Document {
  created_at: Date;
}

EssaySchema.virtual('formattedDate').get(function(this: EssayDocument) {
  return this.created_at.toLocaleDateString('en-US', {
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  });
});

const Essay = mongoose.models.Essay || mongoose.model('Essay', EssaySchema);

export default Essay;