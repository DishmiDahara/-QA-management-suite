const mongoose = require('mongoose');

const StepSchema = new mongoose.Schema({
  stepNumber: { type: Number, required: true },
  action: { type: String, required: true },
  expected: { type: String, required: true }
});

const TestCaseSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  requirementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Requirement', default: null },
  title: { type: String, required: true, trim: true },
  moduleName: { type: String, required: true, default: 'General' },
  steps: [StepSchema],
  expectedResult: { type: String, required: true },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], 
    default: 'Medium' 
  },
  status: { 
    type: String, 
    enum: ['Draft', 'Ready', 'Deprecated'], 
    default: 'Ready' 
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TestCase', TestCaseSchema);
