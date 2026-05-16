export enum Role {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  creatorId: string;
  creator: { name: string };
  createdAt: string;
  updatedAt: string;
  progress: number;
  _count?: {
    tasks: number;
    members: number;
  };
  members?: ProjectMember[];
  tasks?: Task[];
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: string;
  user: User;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string | null;
  projectId: string;
  project?: { title: string };
  assignedToId: string | null;
  assignedTo?: { name: string };
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  overdueTasks: number;
  completionPercentage: number;
  recentTasks: Task[];
}
