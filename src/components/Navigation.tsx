// src/components/Navigation.tsx

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, User, Settings, LogOut, Shield, Menu } from 'lucide-react';
import { NotificationsPanel } from './NotificationsPanel';

const Navigation = () => {
  const { user, profile, loading, signOut } = useAuth();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/donate', label: 'Donate' },   // was /surplus
  { path: '/volunteer', label: 'Volunteer' },
  { path: '/bag', label: 'Food Bag' },    // new
  { path: '/hubs', label: 'Food Hubs' },
];

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  if (loading) {
    return (
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-32 rounded"></div>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">NourishSA</span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors hover:text-green-600 ${
                    isActive(item.path)
                      ? 'text-green-600'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile hamburger + notification */}
            <div className="flex items-center md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2"
              >
                <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              </Button>
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(true)}
                  className="relative ml-2"
                >
                  <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </Button>
              )}
            </div>

            {/* Desktop right side */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNotifications(true)}
                    className="relative"
                  >
                    <Bell className="h-5 w-5" />
                  </Button>
                  {profile?.role === 'admin' && (
                    <Link to="/admin">
                      <Button variant="ghost" size="sm">
                        <Shield className="h-5 w-5 mr-2" /> Admin
                      </Button>
                    </Link>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={profile?.avatar_url!} alt={profile?.full_name!} />
                          <AvatarFallback>{getInitials(profile?.full_name || '')}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" forceMount>
                      <DropdownMenuLabel>
                        <div className="flex flex-col">
                          <span className="font-semibold">{profile?.full_name}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                          <Badge variant="secondary" className="mt-1">{profile?.role}</Badge>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/profile">
                          <User className="mr-2 h-4 w-4" /> Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/settings">
                          <Settings className="mr-2 h-4 w-4" /> Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                     <DropdownMenuItem
  onClick={(e) => {
    e.preventDefault(); // stop any default link behaviour
    signOut(); // call your updated signOut function
  }}
>
  <LogOut className="mr-2 h-4 w-4" /> Sign out
</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Link to="/signin">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu drawer */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/80 backdrop-blur-md border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-700">
          <div className="px-4 pt-4 pb-6 space-y-3">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg text-lg font-medium transition-colors hover:bg-green-100 dark:hover:bg-gray-800 ${
                  isActive(item.path)
                    ? 'bg-green-100 text-green-600'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <hr className="border-gray-200 dark:border-gray-700" />
            {!user && (
              <Link to="/signin" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full py-3 mt-2" size="lg">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      <NotificationsPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </>
  );
};

export default Navigation;
