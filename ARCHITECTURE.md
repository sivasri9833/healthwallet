# System Architecture - Digital Health Wallet

## Overview

This document provides a detailed explanation of the system architecture for the Digital Health Wallet application.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
│                    (React.js Frontend)                       │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │   Pages    │  │ Components │  │  Services  │           │
│  └────────────┘  └────────────┘  └────────────┘           │
│         │              │              │                     │
│         └──────────────┼──────────────┘                     │
│                        │                                    │
│              ┌─────────▼─────────┐                          │
│              │  Context API      │                          │
│              │  (State Mgmt)     │                          │
│              └─────────┬─────────┘                          │
└────────────────────────┼────────────────────────────────────┘
                         │
                         │ HTTP/REST API
                         │ (JWT Authentication)
                         │
┌────────────────────────▼────────────────────────────────────┐
│                      API LAYER                                │
│                 (Node.js + Express)                          │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │   Routes   │  │ Middleware │  │ Controllers│           │
│  └────────────┘  └────────────┘  └────────────┘           │
│         │              │              │                     │
│         └──────────────┼──────────────┘                     │
│                        │                                    │
│              ┌─────────▼─────────┐                          │
│              │  Business Logic   │                          │
│              └─────────┬─────────┘                          │
└────────────────────────┼────────────────────────────────────┘
                         │
                         │ SQL Queries
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    DATA LAYER                                 │
│                    (SQLite DB)                               │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Users   │  │ Reports  │  │  Vitals  │  │  Shared  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  STORAGE LAYER                               │
│              (Local File System)                             │
│                                                              │
│              backend/uploads/                                │
│              - PDF files                                     │
│              - Image files                                   │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### Frontend Architecture

#### 1. Component Hierarchy
```
App
├── Router
│   ├── AuthProvider (Context)
│   │   ├── Login
│   │   ├── Register
│   │   └── PrivateRoute
│   │       ├── Navbar
│   │       ├── Dashboard
│   │       ├── UploadReport
│   │       ├── Vitals
│   │       └── SharedReports
```

#### 2. State Management
- **Global State**: Authentication state via Context API
- **Local State**: Component-specific state using useState hook
- **API State**: Managed through Axios interceptors

#### 3. Routing
- Public routes: `/login`, `/register`
- Protected routes: `/dashboard`, `/upload`, `/vitals`, `/shared`
- Automatic redirect to login if not authenticated

### Backend Architecture

#### 1. Request Flow
```
Client Request
    ↓
Express Server
    ↓
CORS Middleware
    ↓
Body Parser
    ↓
Route Handler
    ↓
Auth Middleware (if protected)
    ↓
Controller/Handler
    ↓
Database Query
    ↓
Response
```

#### 2. Middleware Stack
1. **CORS**: Enables cross-origin requests
2. **Body Parser**: Parses JSON and URL-encoded data
3. **Static Files**: Serves uploaded files
4. **Authentication**: Validates JWT tokens
5. **Validation**: Validates request data

#### 3. Route Organization
- `/api/auth/*` - Authentication endpoints
- `/api/reports/*` - Report management
- `/api/vitals/*` - Vitals management
- `/api/share/*` - Sharing functionality

### Database Architecture

#### 1. Entity Relationships
- **Users** → **Reports** (One-to-Many)
- **Users** → **Vitals** (One-to-Many)
- **Reports** ↔ **Vitals** (Many-to-Many via junction table)
- **Users** → **Shared_Access** (Many-to-Many for sharing)

#### 2. Data Flow
```
User Registration
    ↓
Create User Record
    ↓
Generate JWT Token
    ↓
Return Token to Client

Report Upload
    ↓
Save File to Disk
    ↓
Create Report Record
    ↓
Link Vitals (if provided)
    ↓
Return Report Info

Vital Addition
    ↓
Create Vital Record
    ↓
Link to Report (if applicable)
    ↓
Return Vital Info

Report Sharing
    ↓
Verify Ownership
    ↓
Find Target User
    ↓
Create Shared_Access Record
    ↓
Return Success
```

## Security Architecture

### Authentication Flow
```
1. User submits credentials
2. Server validates credentials
3. Server generates JWT token
4. Token stored in localStorage (client)
5. Token sent in Authorization header (subsequent requests)
6. Middleware validates token on each request
7. Token expires after configured time
```

### Authorization Flow
```
1. Request arrives with JWT token
2. Middleware extracts and validates token
3. User ID extracted from token
4. Business logic checks ownership/permissions
5. Access granted or denied
```

### File Upload Security
```
1. Client selects file
2. File validated (type, size)
3. File saved with unique name
4. File path stored in database
5. File served via static middleware
6. Access controlled by authentication
```

## Scalability Considerations

### Current Implementation
- **Single-threaded Node.js**: Suitable for small to medium scale
- **SQLite**: File-based, no separate server needed
- **Local file storage**: Simple but limited scalability

### Future Scalability Options

#### Database
- Migrate to PostgreSQL or MySQL for better concurrency
- Implement connection pooling
- Add database replication for high availability

#### File Storage
- Move to cloud storage (AWS S3, Google Cloud Storage)
- Implement CDN for faster file delivery
- Add file compression and optimization

#### Backend
- Implement microservices architecture
- Add load balancing
- Use Redis for session management
- Implement caching layer

#### Frontend
- Code splitting for better performance
- Lazy loading of components
- Service worker for offline support
- Progressive Web App (PWA) features

## API Design Principles

### RESTful Design
- Use HTTP methods appropriately (GET, POST, PUT, DELETE)
- Resource-based URLs
- Stateless communication
- JSON request/response format

### Error Handling
- Consistent error response format
- Appropriate HTTP status codes
- No sensitive information in errors
- Client-friendly error messages

### Response Format
```json
{
  "success": true/false,
  "data": {...},
  "message": "...",
  "error": "..."
}
```

## Deployment Architecture

### Development
```
Frontend (React Dev Server) → Backend (Node.js) → SQLite (Local)
```

### Production (Recommended)
```
Frontend (Static Build) → CDN
    ↓
Backend (Node.js) → Load Balancer
    ↓
Database (PostgreSQL/MySQL)
    ↓
File Storage (Cloud Storage)
```

## Performance Optimizations

### Frontend
- Component memoization
- Lazy loading routes
- Image optimization
- Code splitting

### Backend
- Database query optimization
- Indexing on frequently queried fields
- Response caching
- File streaming for large files

### Database
- Indexes on foreign keys
- Indexes on frequently filtered columns (date, type)
- Query optimization

## Monitoring & Logging

### Recommended Additions
- Error logging service (e.g., Sentry)
- Application performance monitoring
- Database query logging
- File upload/download metrics
- User activity tracking

## Conclusion

This architecture provides a solid foundation for a health wallet application with room for future enhancements and scalability improvements.

