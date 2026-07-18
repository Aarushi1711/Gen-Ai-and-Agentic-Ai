import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sun, Moon, Bell, ChevronDown, LogOut, User, Settings,
  Zap, Menu, X
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onMenuToggle?: () => void;
  sidebarOpen?: boolean;
}

export default function Navbar({ onMenuToggle, sidebarOpen }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const isPublicRoute = ['/', '/login', '/signup', '/about', '/contact'].includes(location.pathname);

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/80 dark:bg-surface-900/80 backdrop-blur-md border-b border-surface-200 dark:border-surface-800 flex items-center px-4 lg:px-6 gap-4">
      {/* Mobile menu toggle (authenticated only) */}
      {!isPublicRoute && (
        <button
          onClick={onMenuToggle}
          className="lg:hidden btn-ghost p-2"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      {/* Logo */}
      <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2 font-bold text-lg group">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center shadow-glow group-hover:shadow-glow-accent transition-shadow duration-300">
          <Zap size={16} className="text-white" />
        </div>
        <span className="text-surface-900 dark:text-surface-100">
          Aaroh <span className="text-gradient">AI</span>
        </span>
      </Link>

      {/* Public nav links */}
      {isPublicRoute && (
        <nav className="hidden md:flex items-center gap-1 ml-4">
          {[{ to: '/about', label: 'About' }, { to: '/contact', label: 'Contact' }].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === to
                  ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950'
                  : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="btn-ghost p-2 rounded-lg"
          aria-label="Toggle theme"
        >
          {theme === 'dark'
            ? <Sun size={18} className="text-surface-400 hover:text-surface-200 transition-colors" />
            : <Moon size={18} className="text-surface-500 hover:text-surface-700 transition-colors" />
          }
        </button>

        {user ? (
          <>
            <button className="btn-ghost p-2 rounded-lg relative" aria-label="Notifications">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
            </button>

            {/* Profile dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileOpen(o => !o)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              >
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff`}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover"
                />
                <span className="hidden sm:block text-sm font-medium text-surface-700 dark:text-surface-300 max-w-[120px] truncate">
                  {user.name}
                </span>
                <ChevronDown size={14} className={`text-surface-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-52 card shadow-lg py-1 animate-fade-in z-50">
                  <div className="px-3 py-2 border-b border-surface-100 dark:border-surface-700">
                    <p className="text-sm font-semibold text-surface-900 dark:text-surface-100 truncate">{user.name}</p>
                    <p className="text-xs text-muted truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-surface-50 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 transition-colors"
                  >
                    <User size={15} />Profile
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-surface-50 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 transition-colors"
                  >
                    <Settings size={15} />Settings
                  </Link>
                  <div className="divider my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400 transition-colors"
                  >
                    <LogOut size={15} />Sign out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-ghost text-sm px-3 py-2">Sign in</Link>
            <Link to="/signup" className="btn-primary text-sm px-4 py-2">Get started</Link>
          </div>
        )}
      </div>
    </header>
  );
}
