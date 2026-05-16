import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
  title?: string;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick, title }) => {
  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 text-slate-500 hover:text-slate-900 lg:hidden"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-xl font-bold text-slate-900">{title || 'Dashboard'}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
          <Search className="text-slate-400 w-4 h-4 mr-2" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent border-none focus:outline-none text-sm text-slate-900 w-40 lg:w-64"
          />
        </div>
        
        <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
