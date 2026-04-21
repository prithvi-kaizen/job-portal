import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import Auth from './pages/auth/Auth';
import Landing from './pages/Landing';
import CandidateFeed from './pages/candidate/CandidateFeed';
import EmployerDashboard from './pages/employer/EmployerDashboard';
import { useAuthStore } from './store/authStore';

function App() {
  const { user } = useAuthStore();

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-background font-sans">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            {user && user.role === 'candidate' && (
              <Route path="/candidate/*" element={<CandidateFeed />} />
            )}
            {user && (user.role === 'employer' || user.role === 'admin') && (
              <Route path="/employer/*" element={<EmployerDashboard />} />
            )}
            <Route path="*" element={
              <div className="container py-20 text-center">
                <h1 className="text-4xl font-bold font-heading mb-4">404</h1>
                <p className="text-muted-foreground">Page not found or unauthorized.</p>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
