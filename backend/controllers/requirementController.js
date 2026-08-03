const Requirement = require('../models/Requirement');
const TestCase = require('../models/TestCase');

// @desc Get requirements (optional filter by projectId)
// @route GET /api/requirements
const getRequirements = async (req, res) => {
  const { projectId } = req.query;
  const filter = projectId ? { projectId } : {};

  const requirements = await Requirement.find(filter)
    .populate('projectId', 'projectName')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  res.json(requirements);
};

// @desc Create requirement
// @route POST /api/requirements
const createRequirement = async (req, res) => {
  const { projectId, title, description, priority, status } = req.body;

  if (!projectId || !title || !description) {
    return res.status(400).json({ message: 'Project, title, and description are required' });
  }

  const requirement = await Requirement.create({
    projectId,
    title,
    description,
    priority: priority || 'Medium',
    status: status || 'Approved',
    createdBy: req.user._id,
  });

  const populated = await Requirement.findById(requirement._id)
    .populate('projectId', 'projectName')
    .populate('createdBy', 'name email');

  res.status(201).json(populated);
};

// @desc Update requirement
// @route PUT /api/requirements/:id
const updateRequirement = async (req, res) => {
  const requirement = await Requirement.findById(req.params.id);

  if (!requirement) {
    return res.status(404).json({ message: 'Requirement not found' });
  }

  requirement.title = req.body.title || requirement.title;
  requirement.description = req.body.description || requirement.description;
  requirement.priority = req.body.priority || requirement.priority;
  requirement.status = req.body.status || requirement.status;

  const updated = await requirement.save();
  const populated = await Requirement.findById(updated._id)
    .populate('projectId', 'projectName')
    .populate('createdBy', 'name email');

  res.json(populated);
};

// @desc Delete requirement
// @route DELETE /api/requirements/:id
const deleteRequirement = async (req, res) => {
  const requirement = await Requirement.findById(req.params.id);

  if (!requirement) {
    return res.status(404).json({ message: 'Requirement not found' });
  }

  await Requirement.deleteOne({ _id: req.params.id });
  res.json({ message: 'Requirement deleted successfully' });
};

module.exports = { getRequirements, createRequirement, updateRequirement, deleteRequirement };
