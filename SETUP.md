# How to Run Frontend and Backend

## Prerequisites

- Node.js installed (v14 or higher)
- npm (comes with Node.js)

Check if installed:
```bash
node --version
npm --version
```

## Step-by-Step Setup

### 1. Install Backend Dependencies

Open a terminal/command prompt and navigate to the backend folder:

```bash
cd backend
npm install
```

This will install all required packages (express, sqlite3, bcryptjs, etc.)

### 2. Create Backend Environment File

Create a `.env` file in the `backend` folder:

**Windows (PowerShell):**
```powershell
cd backend
@"
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
"@ | Out-File -FilePath .env -Encoding utf8
```

**Windows (CMD):**
```cmd
cd backend
echo PORT=5000 > .env
echo JWT_SECRET=your_super_secret_jwt_key_change_in_production >> .env
echo JWT_EXPIRES_IN=7d >> .env
echo NODE_ENV=development >> .env
```

**Mac/Linux:**
```bash
cd backend
cat > .env << EOF
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
EOF
```

Or manually create `backend/.env` file with:
```
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 3. Start Backend Server

In the backend directory, run:

```bash
npm start
```

**OR for development with auto-reload:**

```bash
npm run dev
```

You should see:
```
Server running on port 5000
Connected to SQLite database
Database tables initialized
```

✅ **Backend is now running on http://localhost:5000**

**Keep this terminal window open!**

---

### 4. Install Frontend Dependencies

Open a **NEW terminal/command prompt** window and navigate to the frontend folder:

```bash
cd frontend
npm install
```

This will install React and all frontend dependencies.

### 5. (Optional) Create Frontend Environment File

The frontend will work without this, but you can create `frontend/.env`:

**Windows (PowerShell):**
```powershell
cd frontend
"REACT_APP_API_URL=http://localhost:5000/api" | Out-File -FilePath .env -Encoding utf8
```

**Windows (CMD):**
```cmd
cd frontend
echo REACT_APP_API_URL=http://localhost:5000/api > .env
```

**Mac/Linux:**
```bash
cd frontend
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
```

### 6. Start Frontend Development Server

In the frontend directory, run:

```bash
npm start
```

The React app will:
- Start on http://localhost:3000
- Automatically open in your browser
- Hot-reload when you make changes

✅ **Frontend is now running on http://localhost:3000**

---

## Running Both Together

You need **TWO terminal windows**:

### Terminal 1 (Backend):
```bash
cd backend
npm install          # Only needed first time
npm start            # or npm run dev
```

### Terminal 2 (Frontend):
```bash
cd frontend
npm install          # Only needed first time
npm start
```

## Access the Application

1. Open your browser
2. Go to: **http://localhost:3000**
3. You should see the login page
4. Click "Register" to create an account
5. Start using the Health Wallet!

## Verify Everything is Working

### Backend Check:
- Visit: http://localhost:5000/api/health
- Should return: `{"status":"OK","message":"Health Wallet API is running"}`

### Frontend Check:
- Visit: http://localhost:3000
- Should show the login/register page

## Common Issues & Solutions

### Issue: Port 5000 already in use
**Solution:** Change PORT in `backend/.env` to another port (e.g., 5001), and update frontend `.env` accordingly.

### Issue: Port 3000 already in use
**Solution:** React will ask if you want to use another port. Type 'Y' and press Enter.

### Issue: Cannot connect to backend
**Solution:** 
- Make sure backend is running
- Check `frontend/.env` has correct API URL
- Check browser console for errors

### Issue: npm install fails
**Solution:**
- Make sure Node.js is installed: `node --version`
- Try clearing npm cache: `npm cache clean --force`
- Delete `node_modules` folder and `package-lock.json`, then run `npm install` again

### Issue: Database errors
**Solution:**
- Delete `backend/healthwallet.db` file
- Restart backend server (database will be recreated automatically)

### Issue: File upload fails
**Solution:**
- Make sure `backend/uploads/` folder exists (created automatically)
- Check file size (max 10MB)
- Ensure file is PDF or image format

## Development vs Production

### Development Mode (Current Setup):
- Backend: `npm start` or `npm run dev` (with nodemon for auto-reload)
- Frontend: `npm start` (development server with hot-reload)

### Production Mode:
- Backend: `npm start` (no auto-reload)
- Frontend: `npm run build` (creates optimized build in `build/` folder)

## Stopping the Servers

- **Backend:** Press `Ctrl + C` in the backend terminal
- **Frontend:** Press `Ctrl + C` in the frontend terminal

## Quick Reference

| Service | Port | URL | Command |
|---------|------|-----|---------|
| Backend API | 5000 | http://localhost:5000 | `cd backend && npm start` |
| Frontend | 3000 | http://localhost:3000 | `cd frontend && npm start` |

---

**Need Help?** Check the main [README.md](README.md) for detailed documentation.

