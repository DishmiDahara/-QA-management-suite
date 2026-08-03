const TestExecution = require('../models/TestExecution');
const TestCase = require('../models/TestCase');

// @desc Execute test case (record Pass/Fail/Blocked result)
// @route POST /api/executions
const recordExecution = async (req, res) => {
  const { testCaseId, projectId, result, remarks } = req.body;

  if (!testCaseId || !projectId || !result) {
    return res.status(400).json({ message: 'TestCase ID, Project ID, and Result are required' });
  }

  const execution = await TestExecution.create({
    testCaseId,
    projectId,
    executedBy: req.user._id,
    result,
    remarks: remarks || '',
  });

  const populated = await TestExecution.findById(execution._id)
    .populate('testCaseId', 'title moduleName expectedResult')
    .populate('projectId', 'projectName')
    .populate('executedBy', 'name email');

  res.status(201).json(populated);
};

// @desc Get test execution history
// @route GET /api/executions
const getExecutionHistory = async (req, res) => {
  const { projectId, testCaseId } = req.query;
  const filter = {};

  if (projectId) filter.projectId = projectId;
  if (testCaseId) filter.testCaseId = testCaseId;

  const executions = await TestExecution.find(filter)
    .populate('testCaseId', 'title moduleName')
    .populate('projectId', 'projectName')
    .populate('executedBy', 'name email')
    .sort({ executionDate: -1 });

  res.json(executions);
};

module.exports = { recordExecution, getExecutionHistory };
