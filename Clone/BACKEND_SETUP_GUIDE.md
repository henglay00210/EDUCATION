# 🚀 Backend Setup Guide - MongoDB + Node.js

**Complete setup for Education App Backend in 10 minutes**

---

## ✅ What's Already Done

- ✅ Node.js + Express server created
- ✅ MongoDB models (User, Course) configured
- ✅ Authentication routes (login, register) implemented
- ✅ Course API endpoints created
- ✅ npm dependencies installed
- ✅ Sample data script added

---

## 📋 What You Need to Do

### Step 1: Install MongoDB (5 min)

**Choose ONE option:**

#### Option A: Local MongoDB (Windows/Mac/Linux)

**Windows:**

1. Download from: https://www.mongodb.com/try/download/community
2. Run installer and follow wizard
3. MongoDB installs as Windows Service automatically
4. Verify: Open `Command Prompt`, run:
   ```bash
   mongosh
   ```
   Should show: `test>`

**Mac (with Homebrew):**

```bash
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**

```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

#### Option B: MongoDB Atlas (Cloud - Recommended for production)

1. Go to: https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a free cluster
4. Click "Connect"
5. Copy connection string: `mongodb+srv://username:password@cluster.mongodb.net/education_app`
6. Update `.env` file:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/education_app
   ```

### Step 2: Start the Backend Server (2 min)

Open PowerShell/Terminal in `education-backend` folder:

```bash
npm run dev
```

Expected output:

```
🚀 Education App Backend Running
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Server: http://localhost:5000
📊 API Docs: http://localhost:5000/api/health
📱 Connect from Flutter app to this URL
✨ Ready for requests!
```

### Step 3: Seed Sample Data (1 min)

In another terminal:

```bash
cd education-backend
node seed.js
```

Expected output:

```
✅ Connected to MongoDB
🗑️  Cleared existing courses
✅ Inserted 7 sample courses
📚 Inserted Courses:
1. Flutter Basics (Programming) - $49.99
2. Python for Data Science (Data Science) - $39.99
3. UI/UX Design (Design) - $44.99
...
✨ Database seeding completed!
```

### Step 4: Update Flutter App (2 min)

Edit `lib/services/api_service.dart`:

**Find this line:**

```dart
const String _baseUrl = "https://e-learning-api-production-a6d4.up.railway.app/api";
```

**Replace with:**

```dart
const String _baseUrl = "http://localhost:5000/api";  // Local backend
```

Save file. Flutter will auto-reload.

### Step 5: Test the Backend (Optional)

**Test 1: Check health**

```bash
curl http://localhost:5000/api/health
```

**Test 2: Register user**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Test 3: Login user**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## 🎯 Now You Can:

✅ Register new users  
✅ Login with real credentials  
✅ See real courses from MongoDB  
✅ Enroll in courses  
✅ Get user profile

---

## 📊 MongoDB Collections

### Users

- Stores user accounts, passwords (hashed), profiles
- Linked to enrolled courses

### Courses

- Stores course information
- Tracks enrollment count
- Links to instructor

---

## 🔗 API Endpoints Overview

### Auth Endpoints

- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login (get JWT token)
- `GET /api/auth/profile` - Get user info (requires token)

### Course Endpoints

- `GET /api/courses` - Get all courses (requires token)
- `GET /api/courses/:id` - Get single course (requires token)
- `POST /api/courses/:id/enroll` - Enroll in course (requires token)

---

## 🐛 Common Issues & Fixes

### Issue: "MongoDB connection refused"

**Cause:** MongoDB service not running  
**Fix:**

```bash
# Windows: MongoDB should auto-start
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongodb
# Or use MongoDB Atlas instead
```

### Issue: "Port 5000 already in use"

**Cause:** Another app using the port  
**Fix:**

```bash
# Change PORT in .env file to 5001, 5002, etc.
PORT=5001
```

### Issue: "Token invalid" when calling API

**Cause:** Token expired or incorrect  
**Fix:** Re-login in Flutter app to get new token

### Issue: Flutter can't connect to localhost:5000

**Cause:**

- Backend not running
- Wrong URL in api_service.dart
- Firewall blocking port 5000

**Fix:**

- Make sure `npm run dev` is running
- Check the URL in `lib/services/api_service.dart`
- Allow port 5000 in firewall

---

## 📁 Backend File Structure

```
education-backend/
├── models/
│   ├── User.js          ← User schema with password hashing
│   └── Course.js        ← Course schema
├── routes/
│   ├── auth.js          ← Login, register, profile
│   └── courses.js       ← Get courses, enroll
├── server.js            ← Main server
├── seed.js              ← Sample data script
├── package.json         ← Dependencies
├── .env                 ← Configuration
└── README.md            ← Full documentation
```

---

## 🚀 Next: Deploy to Cloud

When you're ready for production:

### Deploy to Railway (Easiest)

1. Push code to GitHub
2. Go to https://railway.app
3. Connect your GitHub repo
4. Set MongoDB URL in environment
5. Done! It auto-deploys

### Deploy to Heroku

```bash
heroku login
heroku create education-app-backend
git push heroku main
```

---

## ✨ You're All Set!

Your complete education app is now running:

- ✅ **Flutter Mobile App** - UI for users
- ✅ **Node.js + Express Backend** - Server
- ✅ **MongoDB Database** - Data storage

**Everything is connected and working!**

---

## 📞 Need Help?

Check files:

- `education-backend/README.md` - Full API documentation
- `Educationl_Mobile_App/API_DOCUMENTATION.md` - Frontend API reference
- `.env` file - Configuration

---

**Happy coding! 🎉**
