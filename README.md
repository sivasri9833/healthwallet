# Digital Health Wallet

A comprehensive full-stack web application for storing, tracking, and sharing medical reports and health vitals. Built with React.js, Node.js, Express.js, and SQLite.

## 🎯 Project Overview

The Digital Health Wallet allows users to:
- Upload and store medical reports (PDF/Image)
- Track health vitals over time with visual charts
- Search and filter reports by date, type, and vitals
- Share specific reports with doctors, family members, and friends
- View shared reports with read-only access

## 🛠️ Technology Stack

### Frontend
- **React.js 18.2** - UI framework
- **React Router DOM 6.20** - Client-side routing
- **Recharts 2.10** - Data visualization and charts
- **Axios 1.6** - HTTP client for API calls
- **React Icons 4.12** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js 4.18** - Web framework
- **SQLite3 5.1** - Database
- **JWT (jsonwebtoken 9.0)** - Authentication
- **Bcryptjs 2.4** - Password hashing
- **Multer 1.4** - File upload handling
- **Express Validator 7.0** - Input validation

### Database
- **SQLite** - Lightweight, file-based database

## 🏗️ System Architecture

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  Login   │  │ Dashboard│  │  Upload  │  │ Vitals  │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │         Context API (State Management)            │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │              API Service Layer (Axios)             │  │
│  └────────────────────────────────────────────────────┘  │
└───────────────────────┬───────────────────────────────────┘
                        │
                        │ REST API (JWT Authentication)
                        │
┌───────────────────────▼───────────────────────────────────┐
│              Node.js + Express Backend                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │   Auth   │  │  Reports │  │  Vitals  │  │  Share  │ │
│  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │         Authentication Middleware (JWT)             │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │         Business Logic (Controllers/Services)      │  │
│  └────────────────────────────────────────────────────┘  │
└───────────────────────┬───────────────────────────────────┘
                        │
                        │ SQL Queries
                        │
┌───────────────────────▼───────────────────────────────────┐
│                    SQLite Database                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  Users   │  │  Reports │  │  Vitals  │  │ Shared  │ │
│  │          │  │          │  │          │  │ Access  │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│              File Storage (Local /uploads)                │
│         Stores uploaded PDF and image files               │
└───────────────────────────────────────────────────────────┘
```

### Frontend Architecture

#### Component Structure
```
src/
├── components/
│   ├── Navbar.js          # Navigation component
│   └── PrivateRoute.js    # Protected route wrapper
├── context/
│   └── AuthContext.js     # Authentication state management
├── pages/
│   ├── Login.js           # Login page
│   ├── Register.js        # Registration page
│   ├── Dashboard.js       # Main dashboard
│   ├── UploadReport.js    # Report upload page
│   ├── Vitals.js          # Vitals tracking with charts
│   └── SharedReports.js   # Report sharing management
├── services/
│   └── api.js            # API service layer
├── App.js                # Main app component with routing
└── index.js              # Entry point
```

#### State Management
- **Context API** for global authentication state
- **Local component state** for form data and UI state
- **React Hooks** (useState, useEffect) for state management

### Backend Architecture

#### Project Structure
```
backend/
├── config/
│   └── database.js        # SQLite database connection & schema
├── middleware/
│   └── auth.js           # JWT authentication middleware
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── reports.js        # Report management routes
│   ├── vitals.js         # Vitals management routes
│   └── share.js          # Report sharing routes
├── uploads/              # File storage directory
├── server.js             # Express server setup
└── package.json          # Dependencies
```

#### API Design
- **RESTful API** design principles
- **JWT-based authentication** for secure access
- **Middleware** for authentication and validation
- **Error handling** with appropriate HTTP status codes

### Database Schema

#### Entity Relationship Diagram

```
Users
├── id (PK)
├── email (UNIQUE)
├── password (HASHED)
├── name
├── role
└── created_at

Reports
├── id (PK)
├── user_id (FK → Users)
├── file_name
├── file_path
├── file_type
├── report_type
├── date
└── created_at

Vitals
├── id (PK)
├── user_id (FK → Users)
├── vital_type
├── value
├── unit
├── date
└── created_at

Report_Vitals (Junction Table)
├── id (PK)
├── report_id (FK → Reports)
└── vital_id (FK → Vitals)

Shared_Access
├── id (PK)
├── report_id (FK → Reports)
├── owner_id (FK → Users)
├── shared_with_id (FK → Users)
├── access_type
└── created_at
```

#### Sample SQL Schema

```sql
-- Users Table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'owner',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Reports Table
CREATE TABLE reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    report_type TEXT NOT NULL,
    date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Vitals Table
CREATE TABLE vitals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    vital_type TEXT NOT NULL,
    value TEXT NOT NULL,
    unit TEXT,
    date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Report_Vitals Junction Table
CREATE TABLE report_vitals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    vital_id INTEGER NOT NULL,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY (vital_id) REFERENCES vitals(id) ON DELETE CASCADE
);

-- Shared_Access Table
CREATE TABLE shared_access (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    owner_id INTEGER NOT NULL,
    shared_with_id INTEGER NOT NULL,
    access_type TEXT DEFAULT 'read',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (shared_with_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(report_id, shared_with_id)
);
```

## 🔐 Security Considerations

### Password Security
- **Bcrypt hashing** with salt rounds (10) for password storage
- Passwords are never stored in plain text
- Minimum password length requirement (6 characters)

### Authentication & Authorization
- **JWT (JSON Web Tokens)** for stateless authentication
- Tokens expire after 7 days (configurable)
- Protected routes require valid JWT token
- Middleware validates token on each protected request

### Access Control
- **Role-based access control** (Owner, Viewer)
- Owners have full access to their reports
- Shared users have read-only access
- Users can only access reports they own or have been shared with
- Ownership verification before delete/update operations

### File Upload Security
- **File type validation** - Only PDF and image files allowed
- **File size limit** - Maximum 10MB per file
- **Secure file storage** - Files stored in server-controlled directory
- **Filename sanitization** - Unique filenames prevent conflicts

### Data Protection
- **SQL injection prevention** - Parameterized queries
- **Input validation** - Express-validator for request validation
- **CORS configuration** - Controlled cross-origin requests
- **Error handling** - No sensitive information in error messages

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

4. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional, defaults to localhost:5000):
```bash
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

All protected routes require JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Endpoints

#### Authentication Routes

##### Register User
```
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "role": "owner"
  }
}
```

##### Login
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "role": "owner"
  }
}
```

#### Report Routes

##### Upload Report
```
POST /reports/upload
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: File (PDF or Image)
- `report_type`: String (e.g., "Blood Test", "X-Ray")
- `date`: Date (YYYY-MM-DD)
- `vitals`: JSON string (optional array of vitals)

**Response:**
```json
{
  "message": "Report uploaded successfully",
  "report": {
    "id": 1,
    "file_name": "report.pdf",
    "report_type": "Blood Test",
    "date": "2024-01-15"
  }
}
```

##### Get All Reports
```
GET /reports
```

**Query Parameters (optional):**
- `date`: Filter by date
- `report_type`: Filter by report type
- `vital_type`: Filter by vital type

**Response:**
```json
{
  "myReports": [
    {
      "id": 1,
      "file_name": "report.pdf",
      "file_url": "/uploads/file-1234567890.pdf",
      "report_type": "Blood Test",
      "date": "2024-01-15",
      "vitals": [
        {"type": "Sugar", "value": "120"}
      ]
    }
  ],
  "sharedReports": []
}
```

##### Get Single Report
```
GET /reports/:id
```

**Response:**
```json
{
  "id": 1,
  "file_name": "report.pdf",
  "file_url": "/uploads/file-1234567890.pdf",
  "report_type": "Blood Test",
  "date": "2024-01-15",
  "vitals": [
    {
      "id": 1,
      "vital_type": "Sugar",
      "value": "120",
      "unit": "mg/dL",
      "date": "2024-01-15"
    }
  ]
}
```

##### Delete Report
```
DELETE /reports/:id
```

**Response:**
```json
{
  "message": "Report deleted successfully"
}
```

#### Vitals Routes

##### Add Vital
```
POST /vitals
```

**Request Body:**
```json
{
  "vital_type": "Blood Pressure",
  "value": "120/80",
  "unit": "mmHg",
  "date": "2024-01-15"
}
```

**Response:**
```json
{
  "message": "Vital added successfully",
  "vital": {
    "id": 1,
    "vital_type": "Blood Pressure",
    "value": "120/80",
    "unit": "mmHg",
    "date": "2024-01-15"
  }
}
```

##### Get All Vitals
```
GET /vitals
```

**Query Parameters (optional):**
- `vital_type`: Filter by vital type
- `start_date`: Filter from date
- `end_date`: Filter to date

**Response:**
```json
[
  {
    "id": 1,
    "vital_type": "Blood Pressure",
    "value": "120/80",
    "unit": "mmHg",
    "date": "2024-01-15"
  }
]
```

##### Get Vitals Trends (for charts)
```
GET /vitals/trends
```

**Query Parameters (optional):**
- `start_date`: Filter from date
- `end_date`: Filter to date

**Response:**
```json
{
  "Blood Pressure": [
    {
      "date": "2024-01-15",
      "value": 120,
      "unit": "mmHg"
    }
  ],
  "Sugar": [
    {
      "date": "2024-01-15",
      "value": 120,
      "unit": "mg/dL"
    }
  ]
}
```

##### Update Vital
```
PUT /vitals/:id
```

**Request Body:**
```json
{
  "vital_type": "Blood Pressure",
  "value": "125/85",
  "unit": "mmHg",
  "date": "2024-01-15"
}
```

##### Delete Vital
```
DELETE /vitals/:id
```

#### Sharing Routes

##### Share Report
```
POST /share/report/:reportId
```

**Request Body:**
```json
{
  "shared_with_email": "doctor@example.com"
}
```

**Response:**
```json
{
  "message": "Report shared successfully",
  "sharedWith": {
    "id": 2,
    "name": "Dr. Smith",
    "email": "doctor@example.com"
  }
}
```

##### Get Shared Access List
```
GET /share/report/:reportId
```

**Response:**
```json
[
  {
    "id": 1,
    "report_id": 1,
    "shared_with_id": 2,
    "access_type": "read",
    "name": "Dr. Smith",
    "email": "doctor@example.com"
  }
]
```

##### Revoke Access
```
DELETE /share/report/:reportId/user/:userId
```

**Response:**
```json
{
  "message": "Access revoked successfully"
}
```

## 🚀 Running the Application

### Development Mode

1. **Start Backend:**
```bash
cd backend
npm install
npm run dev
```

2. **Start Frontend (in a new terminal):**
```bash
cd frontend
npm install
npm start
```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

### Production Build

1. **Build Frontend:**
```bash
cd frontend
npm run build
```

2. **Start Backend:**
```bash
cd backend
npm start
```

## 📁 File Storage Strategy

- **Local Storage**: Files are stored in `backend/uploads/` directory
- **File Naming**: Unique filenames using timestamp and random number
- **File Types**: PDF and image files (JPEG, PNG)
- **Size Limit**: 10MB per file
- **Access**: Files served via Express static middleware at `/uploads` route

### Future Scalability Options
- **Cloud Storage**: Can be migrated to AWS S3, Google Cloud Storage, or Azure Blob Storage
- **CDN Integration**: For faster file delivery
- **File Compression**: Compress images before storage

## 🎨 Features

### User Management
- ✅ User registration with email validation
- ✅ Secure login with JWT authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access (Owner, Viewer)

### Health Reports
- ✅ Upload PDF and image files
- ✅ Store report metadata (type, date)
- ✅ Link reports with vitals
- ✅ View and download reports
- ✅ Delete reports (owner only)

### Vitals Tracking
- ✅ Add, update, and delete vitals
- ✅ Track multiple vital types
- ✅ Visual charts using Recharts
- ✅ Filter vitals by type and date range
- ✅ Trend analysis over time

### Report Retrieval
- ✅ Search reports by date
- ✅ Filter by report type
- ✅ Filter by vital type
- ✅ View all reports in dashboard

### Access Control
- ✅ Share reports with other users via email
- ✅ Read-only access for shared users
- ✅ View shared reports
- ✅ Revoke access anytime
- ✅ Manage sharing permissions

## 🧪 Testing the Application

1. **Register a new user:**
   - Go to http://localhost:3000/register
   - Create an account

2. **Upload a report:**
   - Navigate to Upload Report
   - Select a PDF or image file
   - Fill in report details
   - Optionally add associated vitals

3. **View vitals:**
   - Go to Vitals page
   - Add new vitals manually
   - View trends in charts

4. **Share reports:**
   - Go to Shared Reports page
   - Select a report to share
   - Enter email of user to share with
   - The shared user can view the report (read-only)

## 📝 Notes

- The database file (`healthwallet.db`) is created automatically on first run
- Upload directory (`backend/uploads/`) is created automatically
- JWT tokens expire after 7 days (configurable in `.env`)
- All file uploads are validated for type and size
- CORS is enabled for development (configure for production)

## 🔄 Future Enhancements

- [ ] WhatsApp integration for report uploads
- [ ] Email notifications for shared reports
- [ ] Report categorization and tags
- [ ] Advanced search with multiple filters
- [ ] Export reports as PDF
- [ ] Mobile app version
- [ ] Cloud storage integration
- [ ] Two-factor authentication
- [ ] Report reminders and notifications
- [ ] Analytics and insights dashboard

## 📄 License

This project is created for educational purposes.

## 👤 Author

Digital Health Wallet - Full Stack Application

---

**Note**: Remember to change the JWT_SECRET in production and never commit sensitive information to version control.

