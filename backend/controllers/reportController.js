const Project = require('../models/Project');
const Requirement = require('../models/Requirement');
const TestCase = require('../models/TestCase');
const TestExecution = require('../models/TestExecution');
const Bug = require('../models/Bug');

// @desc Get Dashboard statistics & metrics
// @route GET /api/reports/dashboard
const getDashboardStats = async (req, res) => {
  const totalProjects = await Project.countDocuments();
  const totalTestCases = await TestCase.countDocuments();
  
  // Recent Executions summary
  const passedExecutions = await TestExecution.countDocuments({ result: 'Pass' });
  const failedExecutions = await TestExecution.countDocuments({ result: 'Fail' });
  const blockedExecutions = await TestExecution.countDocuments({ result: 'Blocked' });
  
  // Defects summary
  const openDefects = await Bug.countDocuments({ status: { $in: ['New', 'Assigned', 'In Progress', 'Retest', 'Reopened'] } });
  const closedDefects = await Bug.countDocuments({ status: 'Closed' });
  const fixedDefects = await Bug.countDocuments({ status: 'Fixed' });

  // Defect distribution by Severity
  const severityDistribution = {
    Critical: await Bug.countDocuments({ severity: 'Critical' }),
    High: await Bug.countDocuments({ severity: 'High' }),
    Medium: await Bug.countDocuments({ severity: 'Medium' }),
    Low: await Bug.countDocuments({ severity: 'Low' }),
  };

  // Defect distribution by Status
  const statusDistribution = {
    New: await Bug.countDocuments({ status: 'New' }),
    Assigned: await Bug.countDocuments({ status: 'Assigned' }),
    InProgress: await Bug.countDocuments({ status: 'In Progress' }),
    Fixed: await Bug.countDocuments({ status: 'Fixed' }),
    Retest: await Bug.countDocuments({ status: 'Retest' }),
    Closed: await Bug.countDocuments({ status: 'Closed' }),
    Reopened: await Bug.countDocuments({ status: 'Reopened' }),
  };

  res.json({
    totalProjects,
    totalTestCases,
    passedExecutions,
    failedExecutions,
    blockedExecutions,
    openDefects,
    closedDefects,
    fixedDefects,
    severityDistribution,
    statusDistribution,
  });
};

// @desc Get Requirement Traceability Matrix (RTM)
// @route GET /api/reports/rtm
const getRTMData = async (req, res) => {
  const { projectId } = req.query;
  const filter = projectId ? { projectId } : {};

  const requirements = await Requirement.find(filter)
    .populate('projectId', 'projectName')
    .sort({ createdAt: -1 });

  const rtm = [];

  for (const reqItem of requirements) {
    const linkedTestCases = await TestCase.find({ requirementId: reqItem._id });
    
    if (linkedTestCases.length === 0) {
      rtm.push({
        requirement: reqItem,
        testCase: null,
        executions: [],
        defects: []
      });
    } else {
      for (const tc of linkedTestCases) {
        const executions = await TestExecution.find({ testCaseId: tc._id }).sort({ executionDate: -1 });
        const defects = await Bug.find({ testCaseId: tc._id });

        rtm.push({
          requirement: reqItem,
          testCase: tc,
          executions,
          defects
        });
      }
    }
  }

  res.json(rtm);
};

module.exports = { getDashboardStats, getRTMData };
