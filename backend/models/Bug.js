const mongoose = require('mongoose');

const BugSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  testCaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'TestCase', default: null },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  stepsToReproduce: { type: String, default: '' },
  expectedResult: { type: String, default: '' },
  actualResult: { type: String, default: '' },
  severity: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], 
    default: 'Medium' 
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High'], 
    default: 'Medium' 
  },
  status: { 
    type: String, 
    enum: ['New', 'Assigned', 'In Progress', 'Fixed', 'Retest', 'Closed', 'Reopened'], 
    default: 'New' 
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  attachmentUrl: { type: String, default: '' },
  resolutionNotes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bug', BugSchema);
