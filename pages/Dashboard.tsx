import React, { useEffect, useState } from 'react';
import { User, Announcement, Community } from '../types';
import { mockService } from '../services/mockService';
import { Users, Bell, MapPin, Cake, Gift } from 'lucide-react';

interface DashboardProps {
  user: User;
  community: Community;
  onNavigate: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, community, onNavigate }) => {
  const [memberCount, setMemberCount] = useState(0);
  const [activeAnnouncements, setActiveAnnouncements] = useState<Announcement[]>([]);
  const [birthdayUsers, setBirthdayUsers] = useState<User[]>([]);

  useEffect(() => {
    mockService.getUsers(community.id).then(users => {
      setMemberCount(users.length);
      
      // Calculate birthdays
      const today = new Date();
      const birthdays = users.filter(u => {
        if (!u.dateOfBirth) return false;
        // Parse "YYYY-MM-DD"
        // Note: Creating date from string string assumes UTC usually, but browser local date parsing 
        // with - is safe enough for this demo or we can manually parse
        const [year, month, day] = u.dateOfBirth.split('-').map(Number);
        // month is 1-indexed in string, 0-indexed in JS Date
        return month === (today.getMonth() + 1) && day === today.getDate();
      });
      setBirthdayUsers(birthdays);
    });
    mockService.getAnnouncements(community.id).then(anns => setActiveAnnouncements(anns));
  }, [community.id]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Hello, {user.fullName.split(' ')[0]}!</h2>
          <p className="text-slate-500">Welcome back to {community.name}.</p>
        </div>
        <div className="inline-flex items-center px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-sm font-medium border border-brand-100">
          <MapPin size={14} className="mr-1" /> {community.type} Portal
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          onClick={() => onNavigate('directory')}
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 cursor-pointer hover:border-brand-200 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
              <Users size={24} />
            </div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Directory</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{memberCount}</p>
          <p className="text-slate-500 text-sm">Active Members</p>
        </div>

        <div 
          onClick={() => onNavigate('announcements')}
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 cursor-pointer hover:border-brand-200 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg group-hover:bg-orange-100 transition-colors">
              <Bell size={24} />
            </div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Alerts</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{activeAnnouncements.length}</p>
          <p className="text-slate-500 text-sm">Active Requests</p>
        </div>
      </div>

      {/* Birthday Section */}
      {birthdayUsers.length > 0 && (
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl shadow-sm text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Cake size={120} />
          </div>
          <div className="p-6 relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Gift size={24} className="text-white" />
              </div>
              <h3 className="font-bold text-lg">Today's Birthdays!</h3>
            </div>
            <p className="text-pink-50 text-sm mb-4">Don't forget to wish them a happy birthday.</p>
            
            <div className="flex flex-wrap gap-3">
              {birthdayUsers.map(u => (
                <div key={u.id} className="flex items-center bg-white/10 backdrop-blur-sm rounded-full pl-1 pr-4 py-1 border border-white/20">
                  <img src={u.avatarUrl} alt={u.fullName} className="w-8 h-8 rounded-full border-2 border-white mr-2" />
                  <span className="font-medium text-sm">{u.fullName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Recent Activity</h3>
          <button 
            onClick={() => onNavigate('announcements')}
            className="text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            View All
          </button>
        </div>
        <div className="divide-y divide-slate-100">
            {activeAnnouncements.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">No recent activity</div>
            ) : (
                activeAnnouncements.slice(0, 3).map(ann => (
                    <div key={ann.id} className="p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wide mb-1 ${
                                    ann.category === 'Request' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                }`}>
                                    {ann.category}
                                </span>
                                <h4 className="font-semibold text-slate-800 text-sm">{ann.title}</h4>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{ann.description}</p>
                            </div>
                            <span className="text-xs text-slate-400 whitespace-nowrap">
                                {new Date(ann.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;