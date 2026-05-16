import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Calendar, 
  Filter, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  ArrowLeft,
  Users,
  Search
} from 'lucide-react';
import api from '../api/client';
import { Project, Task, TaskStatus, Priority } from '../types';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { getStatusColor, getPriorityColor, formatDate, cn } from '../lib/utils';

const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    status: 'TODO', 
    priority: 'MEDIUM', 
    dueDate: '', 
    assignedToId: '' 
  });

  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      setProject(response.data);
    } catch (error) {
      console.error('Failed to fetch project', error);
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { ...newTask, projectId: id });
      setIsTaskModalOpen(false);
      setNewTask({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '', assignedToId: '' });
      fetchProject();
    } catch (error) {
      console.error('Failed to create task', error);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      fetchProject();
    } catch (error) {
      console.error('Failed to update task', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchProject();
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!project) return null;

  return (
    <div className="space-y-6">
      <button 
        onClick={() => navigate('/projects')}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-semibold mb-2"
      >
        <ArrowLeft size={16} /> Back to Projects
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-8">
          {/* Project Header */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 uppercase tracking-tight">{project.title}</h2>
                <div className="flex items-center gap-4 mt-2">
                  <div className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <Calendar size={14} /> Created {formatDate(project.createdAt)}
                  </div>
                  <div className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <Users size={14} /> {project.members?.length} Members
                  </div>
                </div>
              </div>
              {user?.role === 'ADMIN' && (
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-indigo-100 transition-all"
                >
                  <Plus size={20} />
                  Add Task
                </button>
              )}
            </div>
            <p className="text-slate-600 leading-relaxed max-w-3xl">
              {project.description || 'No project description available.'}
            </p>
          </div>

          {/* Tasks List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Project Tasks</h3>
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                  <Search size={18} />
                </button>
                <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                  <Filter size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {project.tasks?.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center gap-4 transition-all hover:border-indigo-100"
                >
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <button 
                        onClick={() => handleUpdateTaskStatus(task.id, task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED')}
                        className={cn(
                          "mt-1 p-0.5 rounded-md border-2 transition-all",
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
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{task.description}</p>
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

                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <Clock size={14} className="text-slate-300" />
                      {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
                    </div>

                    <div className="flex items-center gap-2">
                       <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-600 bg-indigo-50 border border-indigo-100" title={task.assignedTo?.name}>
                        {task.assignedTo?.name?.charAt(0) || '?'}
                       </div>
                    </div>

                    {user?.role === 'ADMIN' && (
                      <button 
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}

              {project.tasks?.length === 0 && (
                <div className="py-12 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
                  <p className="text-slate-500 font-medium">No tasks added to this project yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Project Sidebar / Team members column */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-50 pb-3 flex items-center gap-2 text-indigo-700">
              <Users size={20} className="" /> Team Members
            </h3>
            <div className="space-y-3">
              {project.members?.map((m) => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-700 font-bold rounded-xl flex items-center justify-center">
                    {m.user.name.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900">{m.user.name}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{m.user.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-8"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-6 uppercase tracking-tight">Create New Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 leading-none mb-1.5">Task Title</label>
                <input
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  placeholder="e.g. Design Login Page"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Assign To</label>
                <select
                  required
                  value={newTask.assignedToId}
                  onChange={(e) => setNewTask({ ...newTask, assignedToId: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                >
                  <option value="">Select teammate...</option>
                  {project.members?.map((m) => (
                    <option key={m.userId} value={m.userId}>{m.user.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-h-[100px] font-medium"
                  placeholder="Task details..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="flex-1 px-4 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                >
                  Save Task
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailsPage;
