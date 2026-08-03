const mongoose = require('mongoose');

const TestExecutionSchema = new mongoose.Schema({
  testCaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'TestCase', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  executedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  result: { 
    type: String, 
    enum: ['Pass', 'Fail', 'Blocked'], 
    required: true 
  },
  remarks: { type: String, default: '' },
  executionDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TestExecution', TestExecutionSchema);
