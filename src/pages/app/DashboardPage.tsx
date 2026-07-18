import { Link } from 'react-router-dom';
import {
  Plus, Upload, MessageSquare, TrendingUp, Clock,
  Activity, GitBranch, ArrowRight, Zap
} from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { mockProjects, mockRecentActivity } from '../../data/mockData';

const statusColors = {
  active: 'bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-300',
  analyzing: 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300',
  completed: 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400',
};

const activityIcons = {
  analysis: Activity,
  roadmap: GitBranch,
  upload: Upload,
  chat: MessageSquare,
  report: TrendingUp,
};

const quickActions = [
  { to: '/upload', icon: Upload, label: 'Upload Project', desc: 'Analyze a new project', color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-950' },
  { to: '/chat', icon: MessageSquare, label: 'AI Chat', desc: 'Chat with your mentor', color: 'text-accent-500', bg: 'bg-accent-50 dark:bg-accent-950' },
  { to: '/health', icon: Activity, label: 'Health Check', desc: 'View project scores', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950' },
  { to: '/roadmap', icon: GitBranch, label: 'Roadmap', desc: 'Track milestones', color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950' },
];

function ScoreRing({ score }: { score: number }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 85 ? '#10b981' : score >= 70 ? '#f59e0b' : '#ef4444';
  return (
    <svg width="48" height="48" className="-rotate-90">
      <circle cx="24" cy="24" r={r} fill="none" stroke="currentColor" strokeWidth="3" className="text-surface-200 dark:text-surface-700" />
      <circle
        cx="24" cy="24" r={r} fill="none"
        stroke={color} strokeWidth="3"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">
              Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-muted mt-1">Here's what's happening with your projects.</p>
          </div>
          <Link to="/upload" className="btn-primary flex items-center gap-2 self-start">
            <Plus size={16} />New Project
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Projects', value: '3', icon: Zap, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-950' },
            { label: 'Avg Health Score', value: '84', icon: Activity, color: 'text-accent-500', bg: 'bg-accent-50 dark:bg-accent-950' },
            { label: 'Chat Sessions', value: '12', icon: MessageSquare, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950' },
            { label: 'Milestones Done', value: '9', icon: TrendingUp, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card p-5 card-hover">
              <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                <Icon size={18} className={color} />
              </div>
              <div className="text-2xl font-bold text-surface-900 dark:text-surface-100">{value}</div>
              <div className="text-sm text-muted mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="section-title text-lg mb-4">Quick actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map(({ to, icon: Icon, label, desc, color, bg }) => (
              <Link key={to} to={to} className="card p-5 card-hover group flex flex-col gap-3">
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon size={20} className={color} />
                </div>
                <div>
                  <div className="font-medium text-surface-900 dark:text-surface-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{label}</div>
                  <div className="text-xs text-muted mt-0.5">{desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Projects */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title text-lg">Your projects</h2>
              <Link to="/upload" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                Add new <ArrowRight size={14} />
              </Link>
            </div>
            <div className="space-y-3">
              {mockProjects.map(p => (
                <div key={p.id} className="card p-5 card-hover flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <ScoreRing score={p.healthScore} />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-surface-900 dark:text-surface-100">{p.healthScore}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-surface-900 dark:text-surface-100 truncate">{p.name}</h3>
                      <span className={`badge ${statusColors[p.status]}`}>{p.status}</span>
                    </div>
                    <p className="text-sm text-muted mt-0.5 truncate">{p.description}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {p.techStack.slice(0, 3).map(t => (
                        <span key={t} className="text-xs px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400">{t}</span>
                      ))}
                      {p.techStack.length > 3 && (
                        <span className="text-xs text-muted">+{p.techStack.length - 3}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs text-muted flex items-center gap-1">
                      <Clock size={11} />{p.lastUpdated}
                    </p>
                    <Link to="/health" className="text-xs text-primary-600 dark:text-primary-400 mt-1 hover:underline block">
                      View report
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div>
            <h2 className="section-title text-lg mb-4">Recent activity</h2>
            <div className="card divide-y divide-surface-100 dark:divide-surface-700">
              {mockRecentActivity.map(({ id, type, project, description, time }) => {
                const Icon = activityIcons[type as keyof typeof activityIcons] || Activity;
                return (
                  <div key={id} className="px-4 py-3.5 flex items-start gap-3 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon size={13} className="text-surface-500 dark:text-surface-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-surface-700 dark:text-surface-300 leading-snug">{description}</p>
                      <p className="text-xs text-muted mt-0.5">{project} · {time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
