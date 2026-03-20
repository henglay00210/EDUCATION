# Education App Backend

**Node.js + Express + PostgreSQL Backend for Education Mobile App**

---

## 🐘 PostgreSQL + pgAdmin (Docker)

Use this project with PostgreSQL and pgAdmin:

1. Start containers

```bash
cd education-backend
docker compose up -d
```

2. Open pgAdmin

- URL: `http://localhost:5050`
- Email: `admin@admin.com`
- Password: `admin`

3. Backend `.env` connection (already set)

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/education_app
```

4. Seed demo data

```bash
node seed.js
```

---

## 🚀 Quick Start (5 minutes)

### 1. Install Dependencies

```bash
cd education-backend
npm install
```

### 2. Setup MongoDB

**Option A: Local MongoDB (Recommended for development)**

```bash
# Install MongoDB Community Edition
# Windows: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/
# macOS: brew install mongodb-community
# Linux: https://docs.mongodb.com/manual/administration/install-on-linux/

# Start MongoDB
mongod
```

**Option B: MongoDB Atlas (Cloud - Free tier)**

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster
4. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/education_app`
5. Update `.env` MONGODB_URI with your connection string

**Option C: MongoDB with Docker (Recommended if MongoDB is not installed locally)**

```bash
cd education-backend
docker compose up -d
```

This starts:

- MongoDB on `mongodb://localhost:27017`
- Mongo Express UI on `http://localhost:8081`

Use this in `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/education_app
```

To stop Docker MongoDB:

```bash
docker compose down
```

### 3. Configure Environment

Edit `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/education_app
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key_change_in_production
```

### 4. Start Server

```bash
# Development mode (auto-reload on file changes)
npm run dev

# Production mode
npm start
```

✅ Server running on: `http://localhost:5000`

---

## 📱 Connect Flutter App

Update `lib/services/api_service.dart`:

```dart
const String _baseUrl = "http://localhost:5000/api";  // Local development
// OR for production:
// const String _baseUrl = "https://your-deployed-api.com/api";
```

Then restart Flutter app:

```bash
flutter run
```

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint             | Description                       |
| ------ | -------------------- | --------------------------------- |
| POST   | `/api/auth/register` | Register new user                 |
| POST   | `/api/auth/login`    | Login user                        |
| GET    | `/api/auth/profile`  | Get user profile (requires token) |

### Courses

| Method | Endpoint                  | Description                         |
| ------ | ------------------------- | ----------------------------------- |
| GET    | `/api/courses`            | Get all courses (requires token)    |
| GET    | `/api/courses/:id`        | Get course details (requires token) |
| POST   | `/api/courses/:id/enroll` | Enroll in course (requires token)   |

---

## 📝 API Usage Examples

### 1. Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response:**

```json
{
  "message": "Registration successful",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### 2. Login User

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "student",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://ui-avatars.com/api/?name=John+Doe..."
  }
}
```

### 3. Get Courses

```bash
curl -X GET "http://localhost:5000/api/courses?page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 📁 Project Structure

```
education-backend/
├── models/
│   ├── User.js              # User schema & methods
│   └── Course.js            # Course schema
├── routes/
│   ├── auth.js              # Authentication routes
│   └── courses.js           # Course routes
├── server.js                # Main server file
├── package.json             # Dependencies
├── .env                     # Environment variables
└── README.md               # This file
```

---

## 🔐 JWT Authentication

All course endpoints require JWT token in header:

```
Authorization: Bearer <token>
```

The token is automatically included in Flutter app via Dio interceptor.

---

## 🗄️ MongoDB Collections

### Users Collection

```json
{
  "_id": ObjectId,
  "name": "John Doe",
  "email": "john@example.com",
  "password": "hashed_password",
  "avatar": "https://...",
  "bio": "User bio",
  "phone": "+855 12 345 678",
  "role": "student",
  "enrolledCourses": [ObjectId, ObjectId],
  "createdAt": Date
}
```

### Courses Collection

```json
{
  "_id": ObjectId,
  "title": "Flutter Basics",
  "slug": "flutter-basics",
  "description": "...",
  "category": "Programming",
  "level": "Beginner",
  "price": 49.99,
  "thumbnail": "https://...",
  "instructor": ObjectId,
  "enrolledStudents": 150,
  "rating": 4.5,
  "createdAt": Date
}
```

---

## 🧪 Testing with Postman

1. Install Postman: https://www.postman.com/downloads/
2. Import endpoints from this README
3. Set `Authorization` header: `Bearer <token>`
4. Test endpoints

---

## 🚀 Deployment

### Deploy to Railway (Recommended)

1. Push code to GitHub
2. Go to https://railway.app
3. Connect GitHub repo
4. Add MongoDB connection string in environment variables
5. Deploy automatically

### Deploy to Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create education-app-backend

# Set environment variables
heroku config:set MONGODB_URI=mongodb+srv://...
heroku config:set JWT_SECRET=your_secret

# Deploy
git push heroku main
```

---

## 📊 Monitoring

Check backend health:

```bash
curl http://localhost:5000/api/health
```

Response:

```json
{
  "status": "Backend is running!",
  "timestamp": "2024-03-19T10:30:00.000Z"
}
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error

**Problem:** `connection refused`

**Solution:**

- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in `.env`
- For Atlas, add your IP to whitelist

### Token Invalid Error

**Problem:** `Invalid token`

**Solution:**

- Make sure JWT_SECRET matches in server
- Token may have expired (24 hour expiry)
- Re-login to get new token

### Port Already in Use

**Problem:** `Port 5000 is already in use`

**Solution:**

```bash
# Change port in .env
PORT=5001

# Or kill process on port 5000
# Windows: netstat -ano | findstr :5000
# Mac/Linux: lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill
```

---

## 📚 Resources

- [Express.js Docs](https://expressjs.com/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [JWT Docs](https://jwt.io/)
- [Mongoose Docs](https://mongoosejs.com/)

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/new-feature`
2. Commit changes: `git commit -m "Add new feature"`
3. Push: `git push origin feature/new-feature`
4. Create Pull Request

---

## 📝 License

MIT License - feel free to use for any purpose

---

## ✨ Next Steps

1. ✅ Backend setup complete
2. 🎯 Update Flutter app to use local backend
3. 🧪 Test all endpoints
4. 🚀 Deploy to production (Railway/Heroku)
5. 📱 Publish mobile app

Happy coding! 🚀
