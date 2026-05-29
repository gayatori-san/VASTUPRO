/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, LogOut, Compass, Sparkles, Building2, LayoutDashboard, Settings } from 'lucide-react';
import { handleGoogleLogin, handleLogout } from '../lib/firebase';
import { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuthModal?: () => void;
}

export default function Navbar({ user, activeTab, setActiveTab }: NavbarProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const loginWithGoogle = async () => {
    try {
      await handleGoogleLogin();
    } catch (err) {
      console.error(err);
    }
  };

  const logout = async () => {
    try {
      await handleLogout();
      setActiveTab('landing');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-royal-950/85 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('landing')}>
            <div className="relative">
              <Compass className="h-8 w-8 text-gold-400 animate-spiritual-float" />
              <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-amber-300 animate-pulse" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-white">
              Vastu<span className="text-gold-400">Pro</span>
            </span>
          </div>

          {/* Center Links */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => setActiveTab('landing')}
              className={`text-sm font-medium transition-colors ${
                activeTab === 'landing' ? 'text-gold-400' : 'text-gray-300 hover:text-white'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`text-sm font-medium transition-colors ${
                activeTab === 'services' ? 'text-gold-400' : 'text-gray-300 hover:text-white'
              }`}
            >
              Services
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`text-sm font-medium transition-colors ${
                activeTab === 'pricing' ? 'text-gold-400' : 'text-gray-300 hover:text-white'
              }`}
            >
              Pricing
            </button>
            {user && (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                    activeTab === 'dashboard' ? 'text-gold-400' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  My Dashboard
                </button>
                {user.role === 'admin' && (
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`flex items-center gap-1 text-sm font-medium text-amber-300 hover:text-white transition-colors`}
                  >
                    <Settings className="h-4 w-4" />
                    Admin
                  </button>
                )}
              </>
            )}
          </div>

          {/* Auth Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-gray-400">Welcome,</p>
                  <p className="text-sm font-semibold text-white">{user.displayName || user.email}</p>
                </div>
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="avatar"
                    referrerPolicy="no-referrer"
                    className="h-9 w-9 rounded-full border border-gold-400/40"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-royal-800 text-gold-400">
                    <User className="h-4 w-4" />
                  </div>
                )}
                <button
                  onClick={logout}
                  title="Sign out of your account"
                  className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={loginWithGoogle}
                className="flex items-center gap-2 rounded-lg bg-gold-gradient px-4 py-2 text-sm font-semibold text-royal-950 shadow-md hover:opacity-90 active:scale-95 transition-all"
              >
                <span>Login with Google</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-royal-950 px-2 pt-2 pb-3 space-y-1">
          <button
            onClick={() => {
              setActiveTab('landing');
              setMenuOpen(false);
            }}
            className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white"
          >
            Home
          </button>
          <button
            onClick={() => {
              setActiveTab('services');
              setMenuOpen(false);
            }}
            className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white"
          >
            Services
          </button>
          <button
            onClick={() => {
              setActiveTab('pricing');
              setMenuOpen(false);
            }}
            className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white"
          >
            Pricing
          </button>
          {user && (
            <>
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  setMenuOpen(false);
                }}
                className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white"
              >
                My Dashboard
              </button>
              {user.role === 'admin' && (
                <button
                  onClick={() => {
                    setActiveTab('admin');
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-amber-300 hover:bg-white/5 hover:text-white"
                >
                  Admin Panel
                </button>
              )}
            </>
          )}

          <div className="border-t border-white/10 pt-4 pb-1">
            {user ? (
              <div className="flex items-center px-3 justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{user.displayName || user.email}</p>
                  <p className="text-xs text-gray-400">Premium Seeker</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="rounded-lg bg-red-950/50 hover:bg-red-900 border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-200 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="px-3">
                <button
                  onClick={() => {
                    loginWithGoogle();
                    setMenuOpen(false);
                  }}
                  className="block w-full text-center rounded-lg bg-gold-gradient py-2 text-sm font-semibold text-royal-950"
                >
                  Login with Google
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
