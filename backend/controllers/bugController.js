const Bug = require('../models/Bug');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');

// @desc Get bugs with search & filter
// @route GET /api/bugs
const getBugs = async (req, res) => {
  const { projectId, status, priority, severity, assignedTo } = req.query;
  const filter = {};

  if (projectId) filter.projectId = projectId;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (severity) filter.severity = severity;
  if (assignedTo) filter.assignedTo = assignedTo;

  const bugs = await Bug.find(filter)
    .populate('projectId', 'projectName')
    .populate('testCaseId', 'title')
    .populate('assignedTo', 'name email role')
    .populate('createdBy', 'name email role')
    .sort({ createdAt: -1 });

  res.json(bugs);
};

// @desc Get single bug details with comments
// @route GET /api/bugs/:id
const getBugById = async (req, res) => {
  const bug = await Bug.findById(req.params.id)
    .populate('projectId', 'projectName')
    .populate('testCaseId', 'title steps expectedResult')
    .populate('assignedTo', 'name email role')
    .populate('createdBy', 'name email role');

  if (!bug) {
    return res.status(404).json({ message: 'Bug not found' });
  }

  const comments = await Comment.find({ bugId: req.params.id })
    .populate('userId', 'name email role')
    .sort({ createdAt: 1 });

  res.json({ bug, comments });
};

// @desc Create new defect / bug
// @route POST /api/bugs
const createBug = async (req, res) => {
  const { 
    projectId, testCaseId, title, description, stepsToReproduce, 
    expectedResult, actualResult, severity, priority, assignedTo 
  } = req.body;

  if (!projectId || !title || !description) {
    return res.status(400).json({ message: 'Project, title, and description are required' });
  }

  let attachmentUrl = '';
  if (req.file) {
    attachmentUrl = `/uploads/${req.file.filename}`;
  }

  const initialStatus = assignedTo ? 'Assigned' : 'New';

  const bug = await Bug.create({
    projectId,
    testCaseId: testCaseId || null,
    title,
    description,
    stepsToReproduce: stepsToReproduce || '',
    expectedResult: expectedResult || '',
    actualResult: actualResult || '',
    severity: severity || 'Medium',
    priority: priority || 'Medium',
    status: initialStatus,
    assignedTo: assignedTo || null,
    createdBy: req.user._id,
    attachmentUrl,
  });

  // Trigger Notification to Developer if assigned
  if (assignedTo) {
    await Notification.create({
      userId: assignedTo,
      message: `Bug '${bug.title}' has been assigned to you.`,
      type: 'BUG_ASSIGNED',
      targetId: bug._id.toString()
    });
  }

  const populated = await Bug.findById(bug._id)
    .populate('projectId', 'projectName')
    .populate('testCaseId', 'title')
    .populate('assignedTo', 'name email role')
    .populate('createdBy', 'name email role');

  res.status(201).json(populated);
};

// @desc Update defect status & details
// @route PUT /api/bugs/:id
const updateBug = async (req, res) => {
  const bug = await Bug.findById(req.params.id);

  if (!bug) {
    return res.status(404).json({ message: 'Bug not found' });
  }

  const prevStatus = bug.status;
  const prevAssignedTo = bug.assignedTo ? bug.assignedTo.toString() : null;

  if (req.body.title) bug.title = req.body.title;
  if (req.body.description) bug.description = req.body.description;
  if (req.body.severity) bug.severity = req.body.severity;
  if (req.body.priority) bug.priority = req.body.priority;
  if (req.body.status) bug.status = req.body.status;
  if (req.body.resolutionNotes) bug.resolutionNotes = req.body.resolutionNotes;
  if (req.body.assignedTo !== undefined) bug.assignedTo = req.body.assignedTo || null;
  
  if (req.file) {
    bug.attachmentUrl = `/uploads/${req.file.filename}`;
  }

  bug.updatedAt = Date.now();
  const updatedBug = await bug.save();

  // Notify QA Engineer if Developer updated status
  if (req.body.status && req.body.status !== prevStatus) {
    await Notification.create({
      userId: bug.createdBy,
      message: `Status of bug '${bug.title}' was changed to '${bug.status}'.`,
      type: 'BUG_STATUS_UPDATED',
      targetId: bug._id.toString()
    });
  }

  // Notify Developer if newly assigned
  const newAssignedTo = bug.assignedTo ? bug.assignedTo.toString() : null;
  if (newAssignedTo && newAssignedTo !== prevAssignedTo) {
    await Notification.create({
      userId: bug.assignedTo,
      message: `Bug '${bug.title}' has been assigned to you.`,
      type: 'BUG_ASSIGNED',
      targetId: bug._id.toString()
    });
  }

  const populated = await Bug.findById(updatedBug._id)
    .populate('projectId', 'projectName')
    .populate('testCaseId', 'title')
    .populate('assignedTo', 'name email role')
    .populate('createdBy', 'name email role');

  res.json(populated);
};

// @desc Add comment to bug
// @route POST /api/bugs/:id/comments
const addComment = async (req, res) => {
  const { commentText } = req.body;

  if (!commentText) {
    return res.status(400).json({ message: 'Comment text is required' });
  }

  const comment = await Comment.create({
    bugId: req.params.id,
    userId: req.user._id,
    commentText,
  });

  const populated = await Comment.findById(comment._id).populate('userId', 'name email role');
  res.status(201).json(populated);
};

module.exports = { getBugs, getBugById, createBug, updateBug, addComment };
