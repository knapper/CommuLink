import React, { useEffect, useState } from 'react';
import { User, Announcement, Community } from '../types';
import { mockService } from '../services/mockService';
import { Plus, Clock, User as UserIcon, X } from 'lucide-react';

interface AnnouncementsProps {
  user: User;
  community: Community;
}

const Announcements: React.FC<AnnouncementsProps> = ({ user, community }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<'Request' | 'Offer'>('Request');

  useEffect(() => {
    loadAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [community.id]);

  const loadAnnouncements = () => {
    mockService.getAnnouncements(community.id).then(setAnnouncements);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc) return;

    const expiresDate = new Date();
    expiresDate.setDate(expiresDate.getDate() + 7); // Expire in 1 week

    const newAnnouncement: Announcement = {
      id: `local-${Date.now()}`,
      authorId: user.id,
      authorName: user.fullName,
      title: newTitle,
      description: newDesc,
      category: newCategory,
      createdAt: new Date().toISOString(),
      expiresAt: expiresDate.toISOString(),
      communityId: community.id
    };

    await mockService.createAnnouncement(newAnnouncement);
    setNewTitle('');
    setNewDesc('');
    setShowForm(false);
    loadAnnouncements();
  };

  const getDaysRemaining = (isoDate: string) => {
    const diff = new Date(isoDate).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days > 0 ? `${days} days left` : 'Expiring today';
  };

  return (
    <div className="space-y-6 relative h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Community Board</h2>
          <p className="text-slate-500">Needs, offers, and announcements</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-brand-600 text-white p-2 md:px-4 md:py-2 rounded-lg hover:bg-brand-700 transition-colors flex items-center shadow-lg shadow-brand-500/30"
        >
          <Plus size={20} className="md:mr-2" />
          <span className="hidden md:inline">Post New</span>
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Create Announcement</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="category" 
                      checked={newCategory === 'Request'} 
                      onChange={() => setNewCategory('Request')}
                      className="text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-slate-700">Need Help</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="category" 
                      checked={newCategory === 'Offer'} 
                      onChange={() => setNewCategory('Offer')}
                      className="text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-slate-700">Offering Help</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Need medium boxes"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={4}
                  placeholder="Describe what you need or what you are offering..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none bg-white text-slate-900"
                />
              </div>
              
              <div className="pt-2 text-xs text-slate-500 flex items-center">
                <Clock size={14} className="mr-1" />
                This post will automatically expire in 7 days.
              </div>

              <button
                type="submit"
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Post Announcement
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {announcements.map((ann) => (
          <div key={ann.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <span className={`px-2 py-1 text-xs font-bold rounded uppercase tracking-wide ${
                  ann.category === 'Request' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              }`}>
                  {ann.category}
              </span>
              <div className="flex items-center text-xs text-orange-500 font-medium bg-orange-50 px-2 py-1 rounded">
                <Clock size={12} className="mr-1" />
                {getDaysRemaining(ann.expiresAt)}
              </div>
            </div>
            
            <h3 className="font-bold text-lg text-slate-800 mb-2">{ann.title}</h3>
            <p className="text-slate-600 text-sm mb-6 flex-grow">{ann.description}</p>
            
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                <div className="flex items-center text-slate-500 font-medium">
                    <UserIcon size={14} className="mr-1.5" />
                    {ann.authorName}
                </div>
            </div>
          </div>
        ))}
        {announcements.length === 0 && (
            <div className="col-span-full py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-500">No active announcements.</p>
                <button onClick={() => setShowForm(true)} className="text-brand-600 font-medium hover:underline mt-2">Create the first one!</button>
            </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;