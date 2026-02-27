import React from 'react';
import { Home, Users, Megaphone, UserCircle, LogOut, Menu } from 'lucide-react';
import { Community, User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  community: Community | null;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user, 
  community, 
  currentPage, 
  onNavigate,
  onLogout 
}) => {
  if (!user || !community) return <>{children}</>;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'directory', label: 'Directory', icon: Users },
    { id: 'announcements', label: 'Board', icon: Megaphone },
    { id: 'profile', label: 'Profile', icon: UserCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-2xl font-bold text-brand-600 tracking-tight">CommuLink</h1>
          <p className="text-sm text-slate-500 mt-1">{community.name}</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === item.id 
                  ? 'bg-brand-50 text-brand-600 font-medium' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-20">
        <div>
           <h1 className="text-xl font-bold text-brand-600">CommuLink</h1>
           <p className="text-xs text-slate-500">{community.name}</p>
        </div>
        <button onClick={onLogout} className="p-2 text-slate-500">
          <LogOut size={20} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0 overflow-y-auto h-full">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-20 safe-area-pb">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              currentPage === item.id ? 'text-brand-600' : 'text-slate-400'
            }`}
          >
            <item.icon size={24} strokeWidth={currentPage === item.id ? 2.5 : 2} />
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;