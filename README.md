# TeamSync Pro

TeamSync Pro is a full-stack, production-ready web application designed for collaborative team task and project management. It features a robust role-based access control (RBAC) system, detailed project tracking, and a comprehensive analytics dashboard.

## 🚀 Live Demo
- **Live URL:** [Insert Railway URL here]
- **Admin Login:** `admin@example.com` / `admin123`
- **Member Login:** `member@example.com` / `member123`

## ✨ Features

### 👤 Authentication & RBAC
- Secure signup and login with JWT and bcrypt password hashing.
- **Admin Role:** Full system control (CRUD on all projects/tasks, team management).
- **Member Role:** Assigned access (View assigned projects, update own task status).

### 📁 Project Management
- Interactive project list with completion progress bars.
- Detailed project views showing team members and associated tasks.
- Admin-only project creation and deletion.

### 📝 Task Management
- Specialized task tracking with Status (TODO, IN_PROGRESS, COMPLETED) and Priority (LOW to CRITICAL).
- Automatic overdue highlighting for past-due tasks.
- Context-aware updates: Members can only update the status of their assigned tasks.

### 📊 Dashboard Analytics
- Real-time statistics: Total Projects, Tasks, Completion Rate.
- "Recent Tasks" activity feed.
- "Action Required" notifications for overdue tasks.

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Axios.
- **Backend:** Node.js, Express, JWT, Zod.
- **Database:** Prisma ORM, SQLite (Dev) / PostgreSQL (Prod).
- **Deployment:** Ready for Railway with single-command build.

## 📁 Folder Structure
```bash
/prisma          # Prisma schema and seed script
/src             # Frontend source code
  /api           # Axios client
  /components    # UI components
  /context       # Auth state management
  /layouts       # Page layouts
  /pages         # App pages
  /types.ts      # TypeScript interfaces
server.ts        # Express backend entry point
vite.config.ts   # Build configuration
```

## ⚙️ Local Setup

1. **Clone and Install:**
   ```bash
   npm install
   ```

2. **Environment Setup:**
   Create a `.env` file from `.env.example`:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your_secret_key"
   ```

3. **Database Initialization:**
   ```bash
   npm run prisma:generate
   npm run prisma:push
   npm run prisma:seed
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```

## 🚂 Railway Deployment Steps

1. **Create Project:** New project on Railway.
2. **Add Database:** Provision a PostgreSQL database.
3. **Set Variables:**
   - `DATABASE_URL`: Copy the private connection string from Railway Postgres.
   - `JWT_SECRET`: A long random string.
   - `NODE_ENV`: `production`.
4. **Deploy:** Connect your GitHub repo and deploy.
5. **Post-Deploy:**
   - Use the Railway CLI to run `npx prisma db push` to initialize the production DB.
   - Run `npx tsx prisma/seed.ts` if you want initial demo data.

## 📺 Demo Video Script (2-5 Min)
1. **Introduction:** Briefly explain TeamSync Pro goal - "Unified team productivity".
2. **Admin Walkthrough:** Login as admin, create a project, assign 2-3 members, create a task.
3. **Dashboard:** Show the analytics update in real-time.
4. **Member Experience:** Logout, login as a member, show restricted view, update a task to "Completed".
5. **Mobile Design:** Resize browser to show responsive layout.
6. **Closing:** Mention the clean Tech Stack and production readiness.

## 📝 Future Improvements
- [ ] Real-time notifications via WebSockets.
- [ ] File attachments for tasks.
- [ ] Calendar view for deadlines.
- [ ] Team chat integration.
