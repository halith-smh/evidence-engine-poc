import mongoose from 'mongoose';

const approverSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  x: {
    type: Number,
    required: true
  },
  y: {
    type: Number,
    required: true
  },
  pageNumber: {
    type: Number,
    default: 0
  },
  signed: {
    type: Boolean,
    default: false
  },
  signedAt: {
    type: Date
  }
}, { _id: false });

const historyEntrySchema = new mongoose.Schema({
  action: String,
  user: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  details: String
}, { _id: false });

const requestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalFilename: {
    type: String,
    required: true
  },
  initiator: {
    type: String,
    required: true
  },
  approvers: [approverSchema],
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  history: [historyEntrySchema],
  blockchainTx: {
    type: String,
    default: null
  },
  finalPdfHash: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

export default mongoose.model('Request', requestSchema);
