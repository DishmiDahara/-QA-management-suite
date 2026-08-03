const TestCase = require('../models/TestCase');

// @desc Get test cases with filters (projectId, requirementId, moduleName)
// @route GET /api/testcases
const getTestCases = async (req, res) => {
  const { projectId, requirementId, moduleName } = req.query;
  const filter = {};

  if (projectId) filter.projectId = projectId;
  if (requirementId) filter.requirementId = requirementId;
  if (moduleName) filter.moduleName = moduleName;

  const testCases = await TestCase.find(filter)
    .populate('projectId', 'projectName')
    .populate('requirementId', 'title')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  res.json(testCases);
};

// @desc Create test case
// @route POST /api/testcases
const createTestCase = async (req, res) => {
  const { projectId, requirementId, title, moduleName, steps, expectedResult, priority, status } = req.body;

  if (!projectId || !title || !expectedResult) {
    return res.status(400).json({ message: 'Project, title, and expected result are required' });
  }

  const testCase = await TestCase.create({
    projectId,
    requirementId: requirementId || null,
    title,
    moduleName: moduleName || 'General',
    steps: steps || [],
    expectedResult,
    priority: priority || 'Medium',
    status: status || 'Ready',
    createdBy: req.user._id,
  });

  const populated = await TestCase.findById(testCase._id)
    .populate('projectId', 'projectName')
    .populate('requirementId', 'title')
    .populate('createdBy', 'name email');

  res.status(201).json(populated);
};

// @desc Update test case
// @route PUT /api/testcases/:id
const updateTestCase = async (req, res) => {
  const testCase = await TestCase.findById(req.params.id);

  if (!testCase) {
    return res.status(404).json({ message: 'TestCase not found' });
  }

  testCase.title = req.body.title || testCase.title;
  testCase.moduleName = req.body.moduleName || testCase.moduleName;
  testCase.requirementId = req.body.requirementId !== undefined ? req.body.requirementId : testCase.requirementId;
  testCase.steps = req.body.steps || testCase.steps;
  testCase.expectedResult = req.body.expectedResult || testCase.expectedResult;
  testCase.priority = req.body.priority || testCase.priority;
  testCase.status = req.body.status || testCase.status;

  const updated = await testCase.save();
  const populated = await TestCase.findById(updated._id)
    .populate('projectId', 'projectName')
    .populate('requirementId', 'title')
    .populate('createdBy', 'name email');

  res.json(populated);
};

// @desc Delete test case
// @route DELETE /api/testcases/:id
const deleteTestCase = async (req, res) => {
  const testCase = await TestCase.findById(req.params.id);

  if (!testCase) {
    return res.status(404).json({ message: 'TestCase not found' });
  }

  await TestCase.deleteOne({ _id: req.params.id });
  res.json({ message: 'Test case deleted successfully' });
};

module.exports = { getTestCases, createTestCase, updateTestCase, deleteTestCase };
