import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Users, 
  Settings, 
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

interface SidebarProps {
  onClose?: () => void;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose, className }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Projects', icon: FolderKanban, path: '/projects' },
    { name: 'Tasks', icon: CheckSquare, path: '/tasks' },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ name: 'Team Members', icon: Users, path: '/members' });
  }

  return (
    <aside className={cn("flex flex-col h-full bg-white border-r border-slate-200 w-64", className)}>
      <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <CheckSquare className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-slate-900 text-lg">TeamSync</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-2 text-slate-500 hover:text-slate-900">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive 
                ? "bg-indigo-50 text-indigo-700" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-200">
        <div className="flex items-center gap-3 px-3 py-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
            {user?.name.charAt(0)}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold text-slate-900 truncate">{user?.name}</span>
            <span className="text-xs text-slate-500 font-medium tracking-wide uppercase">{user?.role}</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
