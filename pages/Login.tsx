import React, { useState } from 'react';
import { Building2, Users, ArrowRight, Lock, Key } from 'lucide-react';
import { mockService } from '../services/mockService';
import { User, Community } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User, community: Community) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [communityId, setCommunityId] = useState('church-st-mary');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { user, community } = await mockService.login(communityId, username);
      onLoginSuccess(user, community);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-slate-50 p-6 text-center border-b border-slate-100">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-100 text-brand-600 rounded-xl mb-3">
            <Users size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome to CommuLink</h1>
          <p className="text-slate-500 mt-1 text-sm">Secure Community Data Portal</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
              <Building2 size={16} /> Community Code
            </label>
            <input
              type="text"
              required
              value={communityId}
              onChange={(e) => setCommunityId(e.target.value)}
              placeholder="e.g., church-st-mary"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
            />
            <p className="text-xs text-slate-400 mt-1">
              Try: <code>church-st-mary</code>, <code>golf-club-elite</code>
            </p>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
              <Key size={16} /> Username / Email
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
              <Lock size={16} /> Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              disabled
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
            />
            <p className="text-xs text-slate-400 mt-1">Disabled for demo access</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Accessing Portal...' : 'Enter Portal'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>
        
        <div className="bg-slate-50 p-4 text-center text-xs text-slate-500">
          Powered by Multi-Tenant Architecture. Designed by Natanael Almonte
        </div>
      </div>
    </div>
  );
};

export default Login;