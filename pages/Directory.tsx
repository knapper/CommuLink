import React, { useEffect, useState } from 'react';
import { User, Community } from '../types';
import { mockService } from '../services/mockService';
import { Search, MapPin, Phone, Briefcase, Activity } from 'lucide-react';

interface DirectoryProps {
  community: Community;
}

const Directory: React.FC<DirectoryProps> = ({ community }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    mockService.getUsers(community.id).then(data => {
      setUsers(data);
      setLoading(false);
    });
  }, [community.id]);

  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.profession.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Community Directory</h2>
          <p className="text-slate-500">Connect with members of {community.name}</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search name or profession..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none w-full md:w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {[1,2,3].map(i => (
                <div key={i} className="bg-slate-200 h-48 rounded-xl"></div>
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map(member => (
            <div key={member.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <img 
                    src={member.avatarUrl} 
                    alt={member.fullName} 
                    className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                  <div>
                    <h3 className="font-bold text-slate-800">{member.fullName}</h3>
                    <div className="flex items-center text-sm text-slate-500 mt-0.5">
                      <Briefcase size={14} className="mr-1" />
                      {member.profession || 'Not listed'}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  {member.allowContact ? (
                    <div className="flex items-start text-slate-600">
                      <Phone size={16} className="mr-2 mt-0.5 text-slate-400" />
                      <span>{member.phone}</span>
                    </div>
                  ) : (
                    <div className="flex items-start text-slate-400 italic">
                      <Phone size={16} className="mr-2 mt-0.5" />
                      <span>Contact hidden</span>
                    </div>
                  )}
                  
                  <div className="flex items-start text-slate-600">
                    <MapPin size={16} className="mr-2 mt-0.5 text-slate-400" />
                    <span className="line-clamp-1">{member.address || 'Address not listed'}</span>
                  </div>

                  <div className="flex items-center text-slate-600">
                    <Activity size={16} className="mr-2 text-red-400" />
                    <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs font-bold rounded">
                      Blood: {member.bloodType}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Directory;