import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const memberPassword = await bcrypt.hash('member123', 10);

  // Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  const member1 = await prisma.user.upsert({
    where: { email: 'member@example.com' },
    update: {},
    create: {
      email: 'member@example.com',
      password: memberPassword,
      name: 'John Member',
      role: 'MEMBER',
    },
  });

  const member2 = await prisma.user.upsert({
    where: { email: 'sarah@example.com' },
    update: {},
    create: {
      email: 'sarah@example.com',
      password: memberPassword,
      name: 'Sarah Smith',
      role: 'MEMBER',
    },
  });

  // Projects
  const project1 = await prisma.project.create({
    data: {
      title: 'App Overhaul 2024',
      description: 'Major redesign and feature update for our main application.',
      creatorId: admin.id,
      members: {
        create: [
          { userId: admin.id, role: 'ADMIN' },
          { userId: member1.id, role: 'MEMBER' },
        ],
      },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      title: 'Marketing Campaign',
      description: 'Q4 marketing and outreach strategy.',
      creatorId: admin.id,
      members: {
        create: [
          { userId: admin.id, role: 'ADMIN' },
          { userId: member2.id, role: 'MEMBER' },
        ],
      },
    },
  });

  // Tasks
  await prisma.task.create({
    data: {
      title: 'Design UI Mockups',
      description: 'Create high-fidelity designs for the new dashboard.',
      status: 'COMPLETED',
      priority: 'HIGH',
      dueDate: new Date(),
      projectId: project1.id,
      assignedToId: member1.id,
      createdById: admin.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Implement Auth Service',
      description: 'Set up JWT and role-based access control.',
      status: 'IN_PROGRESS',
      priority: 'CRITICAL',
      dueDate: new Date(Date.now() + 86400000 * 3), // 3 days from now
      projectId: project1.id,
      assignedToId: member1.id,
      createdById: admin.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Landing Page Copy',
      description: 'Write copy for the new marketing campaign.',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: new Date(Date.now() - 86400000), // Yesterday (overdue)
      projectId: project2.id,
      assignedToId: member2.id,
      createdById: admin.id,
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
