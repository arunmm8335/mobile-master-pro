# MobileMaster Pro - MongoDB Setup Guide

This project now uses **MongoDB** for database storage instead of localStorage.

## Prerequisites

- Node.js (v18 or higher recommended)
- MongoDB installed locally OR MongoDB Atlas account

## Setup Options

### Option 1: Local MongoDB

1. **Install MongoDB**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mongodb
   
   # macOS (using Homebrew)
   brew install mongodb-community
   
   # Windows - Download from https://www.mongodb.com/try/download/community
   ```

2. **Start MongoDB Service**
   ```bash
   # Ubuntu/Debian
   sudo systemctl start mongodb
   
   # macOS
   brew services start mongodb-community
   
   # Windows - MongoDB runs as a service automatically
   ```

3. **Verify MongoDB is running**
   ```bash
   mongosh
   # Should connect to mongodb://localhost:27017
   ```

### Option 2: MongoDB Atlas (Cloud)

1. **Create a free account** at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. **Create a cluster** (Free tier available)
3. **Get your connection string**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
4. **Update `.env` file** with your connection string:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/mobilemaster
   ```

## Installation & Running

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Update `MONGODB_URI` if using MongoDB Atlas
   ```bash
   cp .env.example .env
   ```

3. **Seed the database** (first time only)
   ```bash
   npm run seed
   ```
   This creates:
   - Sample products
   - Admin user (email: `admin@example.com`, password: `admin123`)

4. **Run the application**
   ```bash
   npm run dev
   ```
   This starts:
   - Frontend (Vite): http://localhost:5173
   - Backend (Express): http://localhost:3001

## Project Structure

```
mobilemaster-pro/
├── server/
│   ├── index.ts           # Express server
│   ├── db.ts              # MongoDB connection
│   ├── seed.ts            # Database seeder
│   ├── models/
│   │   └── types.ts       # MongoDB types
│   └── routes/
│       ├── auth.ts        # Authentication routes
│       ├── products.ts    # Product CRUD routes
│       └── users.ts       # User management routes
├── services/
│   └── db.ts              # Frontend API client
├── .env                   # Environment variables (not in git)
└── .env.example           # Example environment variables
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register new user
- `POST /api/auth/logout` - Logout

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Users
- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get single user
- `DELETE /api/users/:id` - Delete user (admin)

### Health Check
- `GET /api/health` - Server health status

## Environment Variables

```env
# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/mobilemaster

# Server port
PORT=3001

# JWT secret (for future authentication)
JWT_SECRET=your-secret-key-change-this-in-production
```

## Development Scripts

- `npm run dev` - Run both frontend and backend
- `npm run dev:frontend` - Run only frontend (Vite)
- `npm run dev:backend` - Run only backend (Express)
- `npm run seed` - Seed database with sample data
- `npm run build` - Build for production

## Default Credentials

After seeding the database:
- **Email:** `admin@example.com`
- **Password:** `admin123`

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongosh

# Check MongoDB logs
# Linux: /var/log/mongodb/mongod.log
# macOS: /usr/local/var/log/mongodb/mongod.log
```

### Port Already in Use
If port 3001 or 5173 is already in use:
- Change `PORT` in `.env` for backend
- Change port in `vite.config.ts` for frontend

### CORS Issues
If you see CORS errors, ensure:
- Backend is running on `http://localhost:3001`
- Frontend is running on `http://localhost:5173`
- Both are running simultaneously with `npm run dev`

## Production Deployment

For production deployment:

1. **Set strong secrets** in `.env`
2. **Use MongoDB Atlas** for cloud database
3. **Enable authentication** (implement JWT tokens)
4. **Hash passwords** (use bcrypt)
5. **Add input validation** (use express-validator)
6. **Enable HTTPS**
7. **Set up proper error handling**

## Features

- ✅ MongoDB database integration
- ✅ RESTful API with Express
- ✅ User authentication (login/register)
- ✅ Product management (CRUD)
- ✅ Google AI integration (Gemini)
- ✅ Role-based access (admin/user)
- ✅ Responsive UI with React

## Tech Stack

**Frontend:**
- React 19
- TypeScript
- Vite
- Lucide Icons
- Google Generative AI

**Backend:**
- Node.js
- Express
- MongoDB
- TypeScript
- Dotenv

## Security Notes

⚠️ **This is a development setup. For production:**
- Hash passwords with bcrypt
- Implement JWT authentication
- Add rate limiting
- Enable HTTPS
- Validate and sanitize inputs
- Use environment-specific configurations

## Support

For issues or questions:
1. Check MongoDB connection
2. Verify all dependencies are installed
3. Ensure both frontend and backend are running
4. Check browser console and terminal for errors
