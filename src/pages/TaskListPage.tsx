import React, { useEffect, useState } from 'react';
import { 
  CheckSquare, 
  Search, 
  Filter, 
  Trash2, 
  CheckCircle2, 
  Clock,
  ArrowRight,
  Folder
} from 'lucide-react';
import api from '../api/client';
import { Task } from '../types';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { getStatusColor, getPriorityColor, formatDate, cn } from '../lib/utils';
import { Link } from 'react-router-dom';

const TaskListPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const { user } = useAuth();

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleUpdateStatus = async (taskId: string, status: string) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      fetchTasks();
    } catch (error) {
      console.error('Failed to update task', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks();
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'OVERDUE') return t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED';
    if (filter === 'COMPLETED') return t.status === 'COMPLETED';
    if (filter === 'PENDING') return t.status !== 'COMPLETED';
    return true;
  });

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Your Tasks</h2>
          <p className="text-slate-500">Track and update your assigned tasks across all projects.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'PENDING', 'COMPLETED', 'OVERDUE'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border",
                filter === f 
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100" 
                  : "bg-white text-slate-500 border-slate-100 hover:border-slate-200"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredTasks.map((task, i) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center gap-4 transition-all hover:border-indigo-100"
          >
            <div className="flex-1 flex items-start gap-4">
              <button 
                onClick={() => handleUpdateStatus(task.id, task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED')}
                className={cn(
                  "mt-1 p-0.5 rounded-md border-2 transition-all shrink-0",
                  task.status === 'COMPLETED' 
                    ? "bg-emerald-500 border-emerald-500 text-white" 
                    : "bg-white border-slate-200 text-transparent hover:border-indigo-400"
                )}
              >
                <CheckCircle2 size={16} />
              </button>
              <div>
                <h4 className={cn("font-bold text-slate-900 leading-tight", task.status === 'COMPLETED' && "line-through text-slate-400")}>
                  {task.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <Link to={`/projects/${task.projectId}`} className="text-xs font-bold text-indigo-500 hover:underline flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded">
                    <Folder size={10} /> {task.project?.title}
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
               <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider", getPriorityColor(task.priority))}>
                {task.priority}
              </span>
              <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider", getStatusColor(task.status))}>
                {task.status.replace('_', ' ')}
              </span>

              <div className="hidden md:block w-px h-6 bg-slate-100 mx-1" />

              <div className={cn(
                "flex items-center gap-2 text-xs font-bold",
                task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' ? "text-rose-500" : "text-slate-400"
              )}>
                <Clock size={14} className="opacity-60" />
                {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
              </div>

              {user?.role === 'ADMIN' && (
                <button 
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              )}
              
              <Link to={`/projects/${task.projectId}`} className="p-1.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <CheckSquare size={48} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-lg font-bold text-slate-900">No tasks matched your filter</h3>
            <p className="text-slate-500">Try changing the filter or assigning some tasks.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskListPage;
