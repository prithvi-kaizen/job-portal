import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/button';

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-heading text-xl font-bold">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground">
            T
          </div>
          Team-1
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {user.role === 'candidate' && (
                <Link to="/candidate">
                  <Button variant="ghost">Job Feed</Button>
                </Link>
              )}
              {user.role === 'employer' && (
                <Link to="/employer">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
              )}
              <span className="text-sm font-medium text-muted-foreground mr-2">
                {user.name}
              </span>
              <Button onClick={handleLogout} variant="outline" size="sm">
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link to="/auth">
                <Button>Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
