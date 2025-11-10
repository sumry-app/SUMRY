# 🚀 SUMRY Quick Setup Guide

This guide will get you up and running with SUMRY in minutes.

## Prerequisites Check

Before starting, ensure you have:

- ✅ Node.js 18+ installed (`node --version`)
- ✅ PostgreSQL 14+ installed (`psql --version`)
- ✅ npm installed (`npm --version`)
- ✅ OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

---

## ⚡ Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Step 2: Configure Database

```bash
# Create PostgreSQL database
createdb sumry_db

# If that fails, try:
sudo -u postgres createdb sumry_db
```

### Step 3: Configure Environment Variables

#### Frontend (.env) - Already configured!
```env
VITE_API_URL=http://localhost:5000/api
```

#### Backend (server/.env) - Edit this file:

```bash
# Open in your editor
nano server/.env
# or
code server/.env
```

**Required changes:**
1. **DB_PASSWORD**: Set your PostgreSQL password
2. **OPENAI_API_KEY**: Add your OpenAI API key
3. **JWT_SECRET**: Change to a secure random string (optional for dev)

**Example:**
```env
DB_USER=postgres
DB_PASSWORD=mypassword123         # ← CHANGE THIS
OPENAI_API_KEY=sk-abc123...        # ← CHANGE THIS
JWT_SECRET=my-super-secret-key     # ← CHANGE THIS (production)
```

### Step 4: Run Database Migrations

```bash
cd server
npm run migrate
```

You should see:
```
✅ Database migration completed successfully!
📊 Tables created: users, students, goals, progress_logs, ...
```

### Step 5: Start the Application

Open **two terminals**:

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

You should see:
```
🚀 SUMRY API Server - Enterprise IEP Management System
🌐 Server running on: http://localhost:5000
🤖 AI Features: ENABLED ✅
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

You should see:
```
VITE ready in 234 ms
➜  Local:   http://localhost:5173/
```

### Step 6: Open the App

Visit **http://localhost:5173** in your browser!

---

## 🎉 First Steps

1. **Register an account** - Create a teacher/admin account
2. **Add a student** - Try adding a test student
3. **Generate an AI goal** - Use the AI Assistant to create an IEP goal
4. **Log progress** - Record some progress data
5. **View analytics** - Check out the dashboard

---

## 🐛 Troubleshooting

### Database Connection Error

**Error**: `connection refused` or `authentication failed`

**Solution**:
1. Verify PostgreSQL is running: `pg_isready`
2. Check your password in `server/.env`
3. Try connecting manually: `psql -U postgres sumry_db`

### OpenAI API Error

**Error**: `invalid_api_key` or AI features not working

**Solution**:
1. Verify your API key is correct in `server/.env`
2. Check you have credits: https://platform.openai.com/account/usage
3. The app will use fallback templates if AI is unavailable

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::5000`

**Solution**:
```bash
# Find and kill the process
lsof -ti:5000 | xargs kill -9

# Or change the port in server/.env
PORT=5001
```

### Module Not Found

**Error**: `Cannot find module 'xyz'`

**Solution**:
```bash
# Reinstall dependencies
npm install
cd server && npm install
```

---

## ✅ Verify Installation

Run these commands to verify everything is working:

```bash
# Check database
psql sumry_db -c "SELECT COUNT(*) FROM users;"

# Check backend health
curl http://localhost:5000/health

# Check frontend build
npm run build
```

---

## 🔧 Development Commands

```bash
# Frontend
npm run dev          # Start dev server
npm test             # Run tests
npm run build        # Production build
npm run lint         # Lint code

# Backend
cd server
npm run dev          # Start dev server (nodemon)
npm test             # Run tests
npm run migrate      # Run database migrations
```

---

## 📚 Next Steps

- Read the [README.md](./README.md) for complete documentation
- Check out the [API Documentation](./README.md#-api-documentation)
- Explore the database schema in `server/src/config/schema.sql`
- Set up testing with `npm test`

---

## 💬 Need Help?

- 📖 Documentation: [README.md](./README.md)
- 🐛 Report issues: [GitHub Issues](https://github.com/yourusername/SUMRY/issues)
- ✉️ Email: support@sumry.app

---

**You're all set! Enjoy using SUMRY! 🎓**
