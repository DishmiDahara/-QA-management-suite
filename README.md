# QA Management Suite ⚡
> **Web-Based Software Testing and Defect Management System**

![React](https://img.shields.io/badge/Frontend-React.js-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Framework-Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/Security-JWT_Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Postman](https://img.shields.io/badge/Testing-Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)
![Selenium](https://img.shields.io/badge/Automation-Selenium-43B02A?style=for-the-badge&logo=selenium&logoColor=white)

---

## 📌 Project Overview

The **QA Management Suite** is a full-stack web-based software testing and defect tracking platform designed to support the complete Software Testing Life Cycle (STLC). It bridges communication gaps between Quality Assurance Engineers, Developers, and System Administrators by centralizing project management, requirement tracking, test case execution, defect lifecycle management, and Requirement Traceability Matrix (RTM) reporting.

---

## ✨ Key Features & User Roles

### 1. 🛡️ System Administrator
- **User Management**: Create, edit, and manage user accounts with custom roles (`Admin`, `QA Engineer`, `Developer`).
- **Access Control**: Activate or deactivate user accounts and manage access permissions.
- **Project Oversight**: Create software projects, assign team members, and monitor overall system metrics.

### 2. 🧪 QA Engineer
- **Requirement Management**: Add, update, and prioritize project requirements.
- **Test Case Management**: Design step-by-step test scenarios, organize by project module, and map to requirements.
- **Test Execution Suite**: Interactive runner to record `Pass`, `Fail`, or `Blocked` execution results with execution logs.
- **Automated Defect Filing**: One-click defect generation pre-filled with test step details upon test failure.
- **Defect Retesting & RTM Reports**: Retest resolved bugs and generate Requirement Traceability Matrix reports.

### 3. 💻 Developer
- **Defect Dashboard**: View assigned bugs filtered by priority and severity.
- **Defect Lifecycle Management**: Update bug status (`New` → `Assigned` → `In Progress` → `Fixed` → `Retest` → `Closed` / `Reopened`).
- **Discussion Thread & Fix Details**: Add comments, upload resolution attachments/screenshots, and collaborate with QA engineers.

---

## 🏗️ System Architecture

The application is built using a modern **Three-Tier Client-Server Architecture**:

```
 ┌─────────────────────────────────────────────────────────┐
 │                   Presentation Layer                    │
 │               React.js Frontend SPA (Vite)              │
 └────────────────────────────┬────────────────────────────┘
                              │ REST API (JSON)
 ┌────────────────────────────▼────────────────────────────┐
 │                    Application Layer                    │
 │              Node.js + Express.js Backend               │
 └────────────────────────────┬────────────────────────────┘
                              │ Mongoose ODM
 ┌────────────────────────────▼────────────────────────────┐
 │                       Data Layer                        │
 │         MongoDB Database (In-Memory Fallback)           │
 └─────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
QA Management Suite/
├── backend/                  # Express REST API Server
│   ├── config/               # Database connection & MongoMemoryServer fallback
│   ├── controllers/          # Business logic controllers (MVC)
│   ├── middleware/           # JWT protection, RBAC, Multer upload, Error handler
│   ├── models/               # Mongoose MongoDB schemas
│   ├── routes/               # REST API endpoints routing
│   ├── seed/                 # Pre-seeded demo dataset script
│   └── server.js             # Express application entry point
├── frontend/                 # React.js SPA Client (Vite)
│   ├── src/
│   │   ├── components/       # Reusable UI components (Navbar, Sidebar, StatCard, NotificationDrawer)
│   │   ├── context/          # AuthContext & demo role switcher
│   │   ├── pages/            # View modules (Dashboard, Projects, Requirements, TestCases, Executions, Defects, Reports, UserManagement)
│   │   ├── services/         # Axios API service layer
│   │   └── index.css         # Glassmorphism design system
├── testing/                  # Verification & Testing Deliverables
│   ├── postman_collection.json # Postman REST API test collection
│   └── selenium_tests.py     # Python Selenium WebDriver E2E automation script
└── README.md
```

---

## 🚀 Quick Start & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/)
- [Python 3.x](https://www.python.org/) *(For Selenium automation script)*

### 1. Clone the Repository
```bash
git clone https://github.com/DishmiDahara/-QA-management-suite.git
cd -QA-management-suite
```

### 2. Setup & Start Backend Server
```bash
cd backend
npm install
npm start
```
*The REST API backend server will run on `http://localhost:5000` (auto-seeds database on first launch).*

### 3. Setup & Start Frontend Application
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*The React web application will run on `http://localhost:3000`.*

---

## 🔑 Demo Account Credentials

The system includes pre-seeded demo accounts for instant evaluation:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@qasuite.com` | `admin123` | Full administrative control & user management |
| **QA Engineer** | `qa@qasuite.com` | `qa123` | Requirements, Test Cases, Executions, Bugs, RTM |
| **Developer** | `dev@qasuite.com` | `dev123` | Assigned Defects, Bug Status updates, Comments |

> *Tip: Use the **Quick Role Bar** at the top of the app header to switch roles seamlessly in one click!*

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description | Role Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user & get JWT token | Public |
| `GET` | `/api/auth/me` | Fetch current profile | All Authenticated |
| `GET` | `/api/projects` | List all software projects | All Authenticated |
| `POST` | `/api/projects` | Create a new project | Admin, QA Engineer |
| `GET` | `/api/requirements` | Fetch project requirements | All Authenticated |
| `POST` | `/api/testcases` | Create step-by-step test case | Admin, QA Engineer |
| `POST` | `/api/executions` | Record Pass/Fail/Blocked result | Admin, QA Engineer |
| `GET` | `/api/bugs` | List defects with filter parameters | All Authenticated |
| `POST` | `/api/bugs` | Create bug report with attachment | All Authenticated |
| `PUT` | `/api/bugs/:id` | Update bug lifecycle status | All Authenticated |
| `GET` | `/api/reports/dashboard` | Fetch dashboard KPI statistics | All Authenticated |
| `GET` | `/api/reports/rtm` | Generate Requirement Traceability Matrix | All Authenticated |
| `GET` | `/api/users` | Admin user account management | Admin |

---

## 🧪 Testing & Automation

### 1. API Testing with Postman
Import the file [`testing/postman_collection.json`](testing/postman_collection.json) into Postman to run automated API endpoint validation tests.

### 2. UI Automation with Selenium
To run the E2E Selenium WebDriver test script:
```bash
pip install selenium webdriver-manager
python testing/selenium_tests.py
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
