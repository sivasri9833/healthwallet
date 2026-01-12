# Quick Start Guide - Digital Health Wallet

## 🚀 Quick Setup (5 minutes)

### Step 1: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
echo "PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development" > .env

# Start backend server
npm start
```

Backend will run on: `http://localhost:5000`

### Step 2: Frontend Setup

Open a **new terminal window**:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start frontend (optional: create .env file)
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# Start React app
npm start
```

Frontend will run on: `http://localhost:3000`

### Step 3: Access the Application

1. Open browser: `http://localhost:3000`
2. Click "Register" to create an account
3. Login with your credentials
4. Start uploading reports and tracking vitals!

## 📋 First Steps After Login

1. **Upload a Report**
   - Click "Upload Report" in navigation
   - Select a PDF or image file
   - Fill in report details
   - Add associated vitals (optional)

2. **Add Vitals**
   - Go to "Vitals" page
   - Click "Add Vital"
   - Enter vital information
   - View trends in charts

3. **Share Reports**
   - Go to "Shared Reports" page
   - Select a report to share
   - Enter email of person to share with
   - They can now view your report (read-only)

## 🧪 Test Accounts

Create multiple accounts to test sharing:
1. Create account 1: `user1@test.com`
2. Create account 2: `user2@test.com`
3. Login as user1, upload a report
4. Share report with `user2@test.com`
5. Login as user2, view shared reports

## ⚠️ Troubleshooting

### Backend won't start
- Check if port 5000 is already in use
- Ensure Node.js is installed: `node --version`
- Check if all dependencies are installed: `npm list`

### Frontend won't connect to backend
- Ensure backend is running on port 5000
- Check `.env` file has correct API URL
- Check browser console for CORS errors

### Database errors
- Delete `healthwallet.db` and restart (database will be recreated)
- Check file permissions in backend directory

### File upload fails
- Check file size (max 10MB)
- Ensure file is PDF or image format
- Check `backend/uploads/` directory exists and is writable

## 📚 Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [ARCHITECTURE.md](ARCHITECTURE.md) for system design details
- Review API documentation in README for integration

## 🎯 Key Features to Try

1. ✅ Upload multiple reports
2. ✅ Add vitals and view charts
3. ✅ Filter reports by date and type
4. ✅ Share reports with other users
5. ✅ View shared reports
6. ✅ Track vitals over time

Happy coding! 🎉

