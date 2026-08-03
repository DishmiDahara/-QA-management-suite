const Project = require('../models/Project');

// @desc Get all projects
// @route GET /api/projects
const getProjects = async (req, res) => {
  const projects = await Project.find({})
    .populate('members', 'name email role')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });
  res.json(projects);
};

// @desc Get single project details
// @route GET /api/projects/:id
const getProjectById = async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('members', 'name email role')
    .populate('createdBy', 'name email');

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  res.json(project);
};

// @desc Create new project
// @route POST /api/projects
const createProject = async (req, res) => {
  const { projectName, description, members, status } = req.body;

  if (!projectName || !description) {
    return res.status(400).json({ message: 'Project name and description are required' });
  }

  const project = await Project.create({
    projectName,
    description,
    members: members || [req.user._id],
    status: status || 'In Progress',
    createdBy: req.user._id,
  });

  const populatedProject = await Project.findById(project._id)
    .populate('members', 'name email role')
    .populate('createdBy', 'name email');

  res.status(201).json(populatedProject);
};

// @desc Update project details
// @route PUT /api/projects/:id
const updateProject = async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  project.projectName = req.body.projectName || project.projectName;
  project.description = req.body.description || project.description;
  project.status = req.body.status || project.status;
  if (req.body.members) {
    project.members = req.body.members;
  }

  const updatedProject = await project.save();
  const populated = await Project.findById(updatedProject._id)
    .populate('members', 'name email role')
    .populate('createdBy', 'name email');

  res.json(populated);
};

module.exports = { getProjects, getProjectById, createProject, updateProject };
