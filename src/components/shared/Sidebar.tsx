import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Upload, MessageSquare, Activity,
  Map, GitBranch, BarChart3, FileText, User, X
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/upload', icon: Upload, label: 'Upload Project' },
  { to: '/chat', icon: MessageSquare, label: 'AI Mentor Chat' },
  { to: '/health', icon: Activity, label: 'Project Health' },
  { to: '/roadmap', icon: Map, label: 'Roadmap' },
  { to: '/architecture', icon: GitBranch, label: 'Architecture' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/report', icon: FileText, label: 'PDF Report' },
  { to: '/profile', icon: User, label: 'Profile' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();

  const content = (
    <nav className="flex flex-col gap-1 p-3">
      {navItems.map(({ to, icon: Icon, label }) => {
        const active = location.pathname === to;
        return (
          <Link
            key={to}
            to={to}
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
              active
                ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300'
                : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100'
            }`}
          >
            <Icon
              size={18}
              className={`flex-shrink-0 transition-colors ${
                active
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-surface-400 dark:text-surface-500 group-hover:text-surface-600 dark:group-hover:text-surface-300'
              }`}
            />
            <span>{label}</span>
            {active && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-600 dark:bg-primary-400" />
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 min-h-[calc(100vh-4rem)] bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 sticky top-16 self-start h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="py-2">{content}</div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <aside className="relative w-64 bg-white dark:bg-surface-900 h-full shadow-xl flex flex-col animate-slide-in">
            <div className="flex items-center justify-between px-4 h-16 border-b border-surface-200 dark:border-surface-800">
              <span className="font-bold text-surface-900 dark:text-surface-100">Navigation</span>
              <button onClick={onClose} className="btn-ghost p-2">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-2">{content}</div>
          </aside>
        </div>
      )}
    </>
  );
}
