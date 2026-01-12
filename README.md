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



### Database
- **SQLite** - Lightweight, file-based database

## 🏗️ System Architecture



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


   
 

## 🔐 Security Considerations

### Password Security

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

  }
}
```

##### Login
```
POST /auth/login
```


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

### Health Reports
- ✅ Upload PDF and image files
- ✅ Store report metadata (type, date)
- ✅ Link reports with vitals

### Vitals Tracking
- ✅ Add, update, and delete vitals
- ✅ Track multiple vital types
- ✅ Visual charts using Recharts


### Report Retrieval
- ✅ Search reports by date
- ✅ Filter by report type


### Access Control
- ✅ Share reports with other users via email
- ✅ Read-only access for shared users


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


## 🔄 Future Enhancements

- [ ] Email notifications for shared reports
- [ ] Report categorization and tags
- [ ] Report reminders and notifications
- [ ] Analytics and insights dashboard


## 👤 Author
N.S.M.Sri Chinni

Digital Health Wallet - Full Stack Application

---

**Note**: Remember to change the JWT_SECRET in production and never commit sensitive information to version control.

