import React, { useEffect, useState } from 'react';
import { 
  FolderKanban, 
  CheckSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import api from '../api/client';
import { DashboardStats } from '../types';
import { useAuth } from '../context/AuthContext';
import { getStatusColor, getPriorityColor, formatDate } from '../lib/utils';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-white rounded-2xl border border-slate-100"></div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    { label: 'Total Projects', value: stats.totalProjects, icon: FolderKanban, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Tasks', value: stats.totalTasks, icon: CheckSquare, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'In Progress', value: stats.inProgressTasks, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Completed', value: stats.completedTasks, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Hello, {user?.name}! 👋</h2>
          <p className="text-slate-500">Here's what's happening with your projects today.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
            <TrendingUp size={18} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completion</div>
            <div className="text-lg font-bold text-slate-900">{Math.round(stats.completionPercentage)}%</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100/50 flex items-start justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-1">{card.label}</p>
              <h3 className="text-3xl font-bold text-slate-900">{card.value}</h3>
            </div>
            <div className={`p-3 ${card.bg} ${card.color} rounded-xl`}>
              <card.icon size={24} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Tasks */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Recent Tasks</h3>
            <Link to="/tasks" className="text-indigo-600 text-sm font-semibold hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase tracking-widest font-bold">
                  <tr>
                    <th className="px-6 py-4">Task</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4">Due Date</th>
                    <th className="px-6 py-4">Project</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {stats.recentTasks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No recent tasks found.</td>
                    </tr>
                  ) : (
                    stats.recentTasks.map((task) => (
                      <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{task.title}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(task.status)} uppercase tracking-wider`}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getPriorityColor(task.priority)} uppercase tracking-wider`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                          {formatDate(task.dueDate)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-indigo-600 bg-indigo-50/50 px-2 py-1 rounded">
                            {task.project?.title}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Alerts / Alerts Column */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Notifications</h3>
          <div className="space-y-3">
            {stats.overdueTasks > 0 && (
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex gap-4">
                <div className="h-10 w-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-rose-900">Overdue Tasks</h4>
                  <p className="text-xs text-rose-700 mt-1">
                    You have {stats.overdueTasks} {stats.overdueTasks === 1 ? 'task' : 'tasks'} that {stats.overdueTasks === 1 ? 'is' : 'are'} currently past due date.
                  </p>
                </div>
              </div>
            )}

            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex gap-4">
              <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-indigo-900">System Ready</h4>
                <p className="text-xs text-indigo-700 mt-1">
                  TeamSync is fully connected and ready for your collaborative workflow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
