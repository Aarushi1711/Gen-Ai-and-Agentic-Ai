import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Upload, MessageSquare, TrendingUp, Clock,
  Activity, GitBranch, ArrowRight, Zap
} from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { ENDPOINTS } from '../../config/api';
import { mockRecentActivity } from '../../data/mockData'; // still mock — no backend endpoint yet

// Real shape returned by your backend's /projects endpoint
interface BackendProject {
  id: number;
  owner_id: number;
  title: string;
  idea_description: string | null;
  input_type: string;
  github_url: string | null;
  zip_filename: string | null;
  timeline: string | null;
  created_at: string;
}

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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DashboardPage() {
  const { user, getIdToken } = useAuth();
  const [projects, setProjects] = useState<BackendProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const token = await getIdToken();
        const res = await fetch(ENDPOINTS.projects.list, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error('Failed to load projects');
        }
        const data: BackendProject[] = await res.json();
        setProjects(data);
      } catch (err) {
        setError('Could not load your projects. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, [getIdToken]);

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

        {/* Stats row — Total Projects is real, others still placeholders until those features exist */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Projects', value: String(projects.length), icon: Zap, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-950' },
            { label: 'Avg Health Score', value: '—', icon: Activity, color: 'text-accent-500', bg: 'bg-accent-50 dark:bg-accent-950' },
            { label: 'Chat Sessions', value: '—', icon: MessageSquare, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950' },
            { label: 'Milestones Done', value: '—', icon: TrendingUp, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950' },
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

            {loading && (
              <div className="card p-8 text-center text-muted">Loading your projects...</div>
            )}

            {!loading && error && (
              <div className="card p-8 text-center text-red-500">{error}</div>
            )}

            {!loading && !error && projects.length === 0 && (
              <div className="card p-8 text-center">
                <p className="text-muted mb-3">You don't have any projects yet.</p>
                <Link to="/upload" className="btn-primary inline-flex items-center gap-2">
                  <Plus size={16} />Create your first project
                </Link>
              </div>
            )}

            {!loading && !error && projects.length > 0 && (
              <div className="space-y-3">
                {projects.map(p => (
                  <div key={p.id} className="card p-5 card-hover flex items-center gap-4">
                    <div className="relative flex-shrink-0">
                      {/* healthScore placeholder until health-analysis backend exists */}
                      <ScoreRing score={0} />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-surface-900 dark:text-surface-100">—</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-surface-900 dark:text-surface-100 truncate">{p.title}</h3>
                        <span className="badge bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400">
                          {p.input_type}
                        </span>
                      </div>
                      <p className="text-sm text-muted mt-0.5 truncate">{p.idea_description || 'No description provided'}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs text-muted flex items-center gap-1">
                        <Clock size={11} />{formatDate(p.created_at)}
                      </p>
                      <Link to="/health" className="text-xs text-primary-600 dark:text-primary-400 mt-1 hover:underline block">
                        View report
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent activity — still mock, no backend endpoint for this yet */}
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