import React, { useState } from 'react';
import { HashRouter } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Directory from './pages/Directory';
import Announcements from './pages/Announcements';
import Profile from './pages/Profile';
import { User, Community, AuthState } from './types';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    community: null,
  });

  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleLoginSuccess = (user: User, community: Community) => {
    setAuthState({
      isAuthenticated: true,
      user,
      community,
    });
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      community: null,
    });
    setCurrentPage('dashboard');
  };

  const handleProfileUpdate = (updatedUser: User) => {
    setAuthState(prev => ({
      ...prev,
      user: updatedUser
    }));
  };

  // Simple Router based on state for demo/SPA simplicity within constraints
  // In a real app, this would use <Routes> and <Route> from react-router-dom
  const renderPage = () => {
    if (!authState.isAuthenticated || !authState.user || !authState.community) {
      return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard 
          user={authState.user} 
          community={authState.community} 
          onNavigate={setCurrentPage} 
        />;
      case 'directory':
        return <Directory community={authState.community} />;
      case 'announcements':
        return <Announcements 
          user={authState.user} 
          community={authState.community} 
        />;
      case 'profile':
        return <Profile 
          user={authState.user} 
          onUpdate={handleProfileUpdate} 
        />;
      default:
        return <Dashboard 
          user={authState.user} 
          community={authState.community} 
          onNavigate={setCurrentPage} 
        />;
    }
  };

  return (
    <HashRouter>
      <Layout
        user={authState.user}
        community={authState.community}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
      >
        {renderPage()}
      </Layout>
    </HashRouter>
  );
};

export default App;