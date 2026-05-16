import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

const app = express();
const PORT = 3000;

app.use(express.json());

// --- MIDDLEWARE ---

const authMiddleware = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// --- ROUTES ---

// Auth
app.post('/api/auth/signup', async (req, res) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
      name: z.string().min(2),
      role: z.enum(['ADMIN', 'MEMBER']).optional(),
    });
    const { email, password, name, role } = schema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role: role || 'MEMBER' },
    });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/auth/me', authMiddleware, async (req: any, res) => {
  const { id, email, name, role } = req.user;
  res.json({ id, email, name, role });
});

// Users (for assignment)
app.get('/api/users', authMiddleware, isAdmin, async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true },
  });
  res.json(users);
});

// Dashboard Stats
app.get('/api/dashboard/stats', authMiddleware, async (req: any, res) => {
  const userId = req.user.id;
  const role = req.user.role;

  let projectFilter = {};
  let taskFilter = {};

  if (role === 'MEMBER') {
    projectFilter = { members: { some: { userId } } };
    taskFilter = { assignedToId: userId };
  }

  const [totalProjects, totalTasks, completedTasks, inProgressTasks, todoTasks, overdueTasks] = await Promise.all([
    prisma.project.count({ where: projectFilter }),
    prisma.task.count({ where: taskFilter }),
    prisma.task.count({ where: { ...taskFilter, status: 'COMPLETED' } }),
    prisma.task.count({ where: { ...taskFilter, status: 'IN_PROGRESS' } }),
    prisma.task.count({ where: { ...taskFilter, status: 'TODO' } }),
    prisma.task.count({
      where: {
        ...taskFilter,
        status: { not: 'COMPLETED' },
        dueDate: { lt: new Date() },
      },
    }),
  ]);

  const recentTasks = await prisma.task.findMany({
    where: taskFilter,
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { project: { select: { title: true } }, assignedTo: { select: { name: true } } },
  });

  res.json({
    totalProjects,
    totalTasks,
    completedTasks,
    inProgressTasks,
    todoTasks,
    overdueTasks,
    completionPercentage: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
    recentTasks,
  });
});

// Projects
app.get('/api/projects', authMiddleware, async (req: any, res) => {
  const userId = req.user.id;
  const role = req.user.role;

  const projects = await prisma.project.findMany({
    where: role === 'ADMIN' ? {} : { members: { some: { userId } } },
    include: {
      creator: { select: { name: true } },
      _count: { select: { tasks: true, members: true } },
      tasks: { select: { status: true } },
    },
  });

  // Calculate progress for each project
  const projectsWithProgress = projects.map(p => {
    const total = p.tasks.length;
    const completed = p.tasks.filter(t => t.status === 'COMPLETED').length;
    return {
      ...p,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
      tasks: undefined // hide raw tasks from list
    };
  });

  res.json(projectsWithProgress);
});

app.post('/api/projects', authMiddleware, isAdmin, async (req: any, res) => {
  const { title, description, teamMemberIds } = req.body;
  const project = await prisma.project.create({
    data: {
      title,
      description,
      creatorId: req.user.id,
      members: {
        create: [
          { userId: req.user.id, role: 'ADMIN' },
          ...(teamMemberIds || []).map((id: string) => ({ userId: id, role: 'MEMBER' })),
        ],
      },
    },
  });
  res.status(201).json(project);
});

app.get('/api/projects/:id', authMiddleware, async (req: any, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      creator: { select: { name: true } },
      members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
      tasks: { include: { assignedTo: { select: { name: true } } } },
    },
  });

  if (!project) return res.status(404).json({ error: 'Project not found' });
  
  if (req.user.role !== 'ADMIN') {
    const isMember = project.members.some(m => m.userId === userId);
    if (!isMember) return res.status(403).json({ error: 'Access denied' });
  }

  res.json(project);
});

app.delete('/api/projects/:id', authMiddleware, isAdmin, async (req, res) => {
  await prisma.project.delete({ where: { id: req.params.id } });
  res.json({ message: 'Project deleted' });
});

// Tasks
app.get('/api/tasks', authMiddleware, async (req: any, res) => {
  const userId = req.user.id;
  const role = req.user.role;

  const tasks = await prisma.task.findMany({
    where: role === 'ADMIN' ? {} : { assignedToId: userId },
    include: {
      project: { select: { title: true } },
      assignedTo: { select: { name: true } },
    },
    orderBy: { dueDate: 'asc' },
  });
  res.json(tasks);
});

app.post('/api/tasks', authMiddleware, isAdmin, async (req: any, res) => {
  const { title, description, status, priority, dueDate, projectId, assignedToId } = req.body;
  const task = await prisma.task.create({
    data: {
      title,
      description,
      status: status || 'TODO',
      priority: priority || 'MEDIUM',
      dueDate: dueDate ? new Date(dueDate) : null,
      projectId,
      assignedToId,
      createdById: req.user.id,
    },
  });
  res.status(201).json(task);
});

app.put('/api/tasks/:id', authMiddleware, async (req: any, res) => {
  const { id } = req.params;
  const { title, description, status, priority, dueDate, assignedToId } = req.body;

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return res.status(404).json({ error: 'Task not found' });

  if (req.user.role !== 'ADMIN') {
    // Member can only update status of their own assigned tasks
    if (task.assignedToId !== req.user.id) return res.status(403).json({ error: 'Access denied' });
    
    // Only allow status update for members
    const updated = await prisma.task.update({
      where: { id },
      data: { status },
    });
    return res.json(updated);
  }

  // Admin can update everything
  const updated = await prisma.task.update({
    where: { id },
    data: { title, description, status, priority, dueDate: dueDate ? new Date(dueDate) : null, assignedToId },
  });
  res.json(updated);
});

app.delete('/api/tasks/:id', authMiddleware, isAdmin, async (req, res) => {
  await prisma.task.delete({ where: { id: req.params.id } });
  res.json({ message: 'Task deleted' });
});

// --- VITE MIDDLEWARE ---

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
