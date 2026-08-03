const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const connectDB = require('../config/db');

const User = require('../models/User');
const Project = require('../models/Project');
const Requirement = require('../models/Requirement');
const TestCase = require('../models/TestCase');
const TestExecution = require('../models/TestExecution');
const Bug = require('../models/Bug');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');

dotenv.config({ path: '../.env' });

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Project.deleteMany({});
    await Requirement.deleteMany({});
    await TestCase.deleteMany({});
    await TestExecution.deleteMany({});
    await Bug.deleteMany({});
    await Comment.deleteMany({});
    await Notification.deleteMany({});

    console.log('Seeding Users...');
    const salt = await bcrypt.genSalt(10);
    
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@qasuite.com',
      password: await bcrypt.hash('admin123', salt),
      role: 'Admin',
      isActive: true
    });

    const qaUser = await User.create({
      name: 'Sarah QA',
      email: 'qa@qasuite.com',
      password: await bcrypt.hash('qa123', salt),
      role: 'QA Engineer',
      isActive: true
    });

    const devUser = await User.create({
      name: 'Alex Developer',
      email: 'dev@qasuite.com',
      password: await bcrypt.hash('dev123', salt),
      role: 'Developer',
      isActive: true
    });

    console.log('Seeding Sample Project...');
    const project = await Project.create({
      projectName: 'E-Commerce Platform Redesign',
      description: 'Full stack overhaul of customer checkout, authentication, and inventory modules.',
      status: 'In Progress',
      members: [adminUser._id, qaUser._id, devUser._id],
      createdBy: adminUser._id
    });

    console.log('Seeding Requirements...');
    const req1 = await Requirement.create({
      projectId: project._id,
      title: 'Secure User Authentication',
      description: 'System shall support JWT-based login with password encryption and RBAC.',
      priority: 'High',
      status: 'Approved',
      createdBy: qaUser._id
    });

    const req2 = await Requirement.create({
      projectId: project._id,
      title: 'Shopping Cart Checkout Flow',
      description: 'User shall be able to add items to cart and proceed through multi-step payment.',
      priority: 'Critical',
      status: 'Approved',
      createdBy: qaUser._id
    });

    console.log('Seeding Test Cases...');
    const tc1 = await TestCase.create({
      projectId: project._id,
      requirementId: req1._id,
      title: 'TC_LOGIN_001: Login with valid credentials',
      moduleName: 'Authentication',
      steps: [
        { stepNumber: 1, action: 'Navigate to /login page', expected: 'Login screen rendered' },
        { stepNumber: 2, action: 'Enter admin@qasuite.com and admin123', expected: 'Fields populated' },
        { stepNumber: 3, action: 'Click Login button', expected: 'JWT issued and redirected to Dashboard' }
      ],
      expectedResult: 'User logged in successfully with Dashboard access',
      priority: 'High',
      status: 'Ready',
      createdBy: qaUser._id
    });

    const tc2 = await TestCase.create({
      projectId: project._id,
      requirementId: req2._id,
      title: 'TC_CART_002: Add item to cart and verify total',
      moduleName: 'Checkout',
      steps: [
        { stepNumber: 1, action: 'Select product item', expected: 'Product details opened' },
        { stepNumber: 2, action: 'Click Add to Cart', expected: 'Cart badge incremented' }
      ],
      expectedResult: 'Cart drawer opens showing accurate total sum',
      priority: 'Critical',
      status: 'Ready',
      createdBy: qaUser._id
    });

    console.log('Seeding Test Executions...');
    await TestExecution.create({
      testCaseId: tc1._id,
      projectId: project._id,
      executedBy: qaUser._id,
      result: 'Pass',
      remarks: 'Token successfully generated and saved in local storage.'
    });

    const execFailed = await TestExecution.create({
      testCaseId: tc2._id,
      projectId: project._id,
      executedBy: qaUser._id,
      result: 'Fail',
      remarks: 'Cart total does not calculate discount code automatically.'
    });

    console.log('Seeding Defects / Bugs...');
    const bug = await Bug.create({
      projectId: project._id,
      testCaseId: tc2._id,
      title: 'BUG_CART_101: Discount coupon calculation fails on cart summary',
      description: 'Applying valid coupon CODE20 returns 500 error instead of applying 20% discount.',
      stepsToReproduce: '1. Add item to cart.\n2. Open Checkout.\n3. Type promo CODE20 and click Apply.',
      expectedResult: 'Price reduced by 20%.',
      actualResult: 'Internal Server Error banner displayed.',
      severity: 'High',
      priority: 'High',
      status: 'Assigned',
      assignedTo: devUser._id,
      createdBy: qaUser._id,
      resolutionNotes: ''
    });

    console.log('Seeding Comments...');
    await Comment.create({
      bugId: bug._id,
      userId: devUser._id,
      commentText: 'Investigating backend coupon validation endpoint handler.'
    });

    await Comment.create({
      bugId: bug._id,
      userId: qaUser._id,
      commentText: 'Thanks! Let me know when ready for retesting.'
    });

    console.log('Seeding Notifications...');
    await Notification.create({
      userId: devUser._id,
      message: `Bug '${bug.title}' has been assigned to you.`,
      type: 'BUG_ASSIGNED',
      targetId: bug._id.toString()
    });

    console.log('Database Seeding Complete!');
    return { adminUser, qaUser, devUser, project };
  } catch (err) {
    console.error('Seeding error:', err);
  }
};

if (require.main === module) {
  seedDatabase().then(() => process.exit());
}

module.exports = seedDatabase;
