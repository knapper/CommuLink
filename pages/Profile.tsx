import React, { useState, useRef } from 'react';
import { User, BloodType } from '../types';
import { mockService } from '../services/mockService';
import { Save, CheckCircle, Heart, Droplet, Camera, User as UserIcon } from 'lucide-react';

interface ProfileProps {
  user: User;
  onUpdate: (user: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState<User>(user);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof User, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    
    try {
      const updated = await mockService.updateUserProfile(formData);
      onUpdate(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">My Profile</h2>
        <p className="text-slate-500">Manage your personal information and privacy.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <div className="flex items-center space-x-6 mb-8">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-50 bg-slate-100 flex items-center justify-center">
                {formData.avatarUrl ? (
                  <img 
                    src={formData.avatarUrl} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon size={40} className="text-slate-300" />
                )}
              </div>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md border border-slate-200 text-slate-600 hover:text-brand-600 hover:border-brand-300 transition-all z-10"
                title="Change Profile Picture"
              >
                <Camera size={16} />
              </button>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload}
              />
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-slate-800">{formData.username}</h3>
              <p className="text-slate-500 text-sm">Community Member</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.isDonor && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600 border border-red-100">
                    <Heart size={10} className="mr-1 fill-current" />
                    Organ Donor
                  </span>
                )}
                {formData.isBloodDonor && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600 border border-red-100">
                    <Droplet size={10} className="mr-1 fill-current" />
                    Blood Donor
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Profession</label>
              <input
                type="text"
                value={formData.profession}
                onChange={(e) => handleChange('profession', e.target.value)}
                placeholder="e.g. Electrician"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Blood Type</label>
              <select
                value={formData.bloodType}
                onChange={(e) => handleChange('bloodType', e.target.value as BloodType)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
              >
                {Object.values(BloodType).map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
               <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
               <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors">
              <input 
                type="checkbox"
                checked={formData.allowContact}
                onChange={(e) => handleChange('allowContact', e.target.checked)}
                className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500 border-gray-300 bg-white"
              />
              <div>
                <span className="text-sm font-medium text-slate-800">Allow Contact</span>
                <p className="text-xs text-slate-500">Allow other community members to see your phone number.</p>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors">
              <input 
                type="checkbox"
                checked={formData.isDonor}
                onChange={(e) => handleChange('isDonor', e.target.checked)}
                className="w-5 h-5 text-red-600 rounded focus:ring-red-500 border-gray-300 bg-white"
              />
              <div>
                <span className="text-sm font-medium text-slate-800 flex items-center">
                  <Heart size={14} className="mr-1.5 text-red-500 fill-current" />
                  Organ Donor Status
                </span>
                <p className="text-xs text-slate-500">Indicate that you are willing to be an organ donor.</p>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors">
              <input 
                type="checkbox"
                checked={formData.isBloodDonor}
                onChange={(e) => handleChange('isBloodDonor', e.target.checked)}
                className="w-5 h-5 text-red-600 rounded focus:ring-red-500 border-gray-300 bg-white"
              />
              <div>
                <span className="text-sm font-medium text-slate-800 flex items-center">
                  <Droplet size={14} className="mr-1.5 text-red-500 fill-current" />
                  Blood Donor
                </span>
                <p className="text-xs text-slate-500">Indicate that you are willing to donate blood.</p>
              </div>
            </label>
          </div>

          <div className="pt-4 flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-2 rounded-lg font-medium text-white transition-all flex items-center ${
                success ? 'bg-green-600' : 'bg-brand-600 hover:bg-brand-700'
              }`}
            >
              {saving && <span className="animate-spin mr-2">⏳</span>}
              {!saving && success && <CheckCircle size={18} className="mr-2" />}
              {success ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;