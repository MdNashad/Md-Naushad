import React, { useEffect, useState } from 'react';
import { Plus, Users, Calendar, MoreVertical, Trash2, FolderKanban } from 'lucide-react';
import api from '../api/client';
import { Project, User as UserType } from '../types';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { formatDate } from '../lib/utils';

const ProjectListPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [newProject, setNewProject] = useState({ title: '', description: '', teamMemberIds: [] as string[] });
  const { user } = useAuth();

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (user?.role === 'ADMIN') {
      try {
        const response = await api.get('/users');
        setAllUsers(response.data.filter((u: UserType) => u.id !== user.id));
      } catch (error) {
        console.error('Failed to fetch users', error);
      }
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/projects', newProject);
      setIsModalOpen(false);
      setNewProject({ title: '', description: '', teamMemberIds: [] });
      fetchProjects();
    } catch (error) {
      console.error('Failed to create project', error);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project? All associated tasks will be removed.')) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch (error) {
      console.error('Failed to delete project', error);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 bg-white rounded-2xl border border-slate-100"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Projects</h2>
          <p className="text-slate-500">Manage your team's workspace and goals.</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold transition-all"
          >
            <Plus size={20} />
            New Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all p-6 flex flex-col"
          >
            <div className="flex items-start justify-between mb-4">
              <Link to={`/projects/${project.id}`} className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight truncate">
                  {project.title}
                </h3>
              </Link>
              {user?.role === 'ADMIN' && (
                <button 
                  onClick={() => handleDeleteProject(project.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <p className="text-slate-500 text-sm line-clamp-2 mb-6 flex-1">
              {project.description || 'No description provided.'}
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-400 uppercase tracking-wider">Progress</span>
                  <span className="text-slate-900">{project.progress}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                    <FolderKanban size={14} className="text-indigo-500" />
                    {project._count?.tasks || 0} Tasks
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                    <Users size={14} className="text-blue-500" />
                    {project._count?.members || 0} Members
                  </div>
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {formatDate(project.createdAt)}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {projects.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <FolderKanban size={48} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-lg font-bold text-slate-900">No projects found</h3>
            <p className="text-slate-500">Get started by creating your first team project.</p>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-8"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-6">Create New Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Project Title</label>
                <input
                  required
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Q4 Website Redesign"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                  placeholder="What is this project about?"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Team Members</label>
                <div className="max-h-40 overflow-y-auto space-y-2 border border-slate-100 p-2 rounded-xl">
                  {allUsers.map((u) => (
                    <label key={u.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={newProject.teamMemberIds.includes(u.id)}
                        onChange={(e) => {
                          const ids = e.target.checked 
                            ? [...newProject.teamMemberIds, u.id]
                            : newProject.teamMemberIds.filter(id => id !== u.id);
                          setNewProject({ ...newProject, teamMemberIds: ids });
                        }}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{u.name}</span>
                        <span className="text-xs text-slate-500">{u.email}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                >
                  Create Project
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProjectListPage;
