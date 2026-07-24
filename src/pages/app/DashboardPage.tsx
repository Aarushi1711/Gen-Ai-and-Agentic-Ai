import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Upload, MessageSquare, TrendingUp, Clock,
  Activity, GitBranch, ArrowRight, Zap, Sparkles
} from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { useSelectedProject } from '../../context/SelectedProjectContext';
import { ENDPOINTS } from '../../config/api';

interface BackendReport {
  id: number;
  project_id: number;
  architecture_score: number | null;
  scalability_score: number | null;
  documentation_score: number | null;
  deployment_readiness_score: number | null;
  code_quality_score: number | null;
  security_score: number | null;
  performance_score: number | null;
  generated_at: string;
}

interface ChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface BackendMilestone {
  id: number;
  milestone_title: string;
  created_at: string;
}

interface RepoIntelResponse {
  source_type: string;
  detected_languages: string | null;
  detected_frameworks: string | null;
  architecture_pattern: string | null;
  analysis: {
    project_type: string | null;
    tech_stack: { name: string; category: string }[];
    readme: { score: number; exists: boolean } | null;
    project_summary: string | null;
  } | null;
}

type ActivityItem = {
  id: string;
  type: 'chat' | 'roadmap';
  description: string;
  time: string;
  timestamp: number;
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

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function DashboardPage() {
  const { user, getIdToken } = useAuth();
  const { projects, selectedProject, loading: projectsLoading } = useSelectedProject();

  const [latestReport, setLatestReport] = useState<BackendReport | null>(null);
  const [chatCount, setChatCount] = useState<number | null>(null);
  const [milestoneCount, setMilestoneCount] = useState<number | null>(null);
  const [repoIntel, setRepoIntel] = useState<RepoIntelResponse | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(true);

  useEffect(() => {
    if (!selectedProject) {
      setLatestReport(null);
      setChatCount(null);
      setMilestoneCount(null);
      setRepoIntel(null);
      setActivity([]);
      setLoadingDetails(false);
      return;
    }

    let cancelled = false;

    async function fetchDetails() {
      setLoadingDetails(true);
      const token = await getIdToken();
      const authHeaders = { Authorization: `Bearer ${token}` };
      const projectId = selectedProject!.id;

      const [reportsRes, historyRes, roadmapRes, repoIntelRes] = await Promise.all([
        fetch(ENDPOINTS.health.report(String(projectId)), { headers: authHeaders }).catch(() => null),
        fetch(ENDPOINTS.ai.history(String(projectId)), { headers: authHeaders }).catch(() => null),
        fetch(ENDPOINTS.roadmap.get(String(projectId)), { headers: authHeaders }).catch(() => null),
        fetch(ENDPOINTS.repoIntel.get(String(projectId)), { headers: authHeaders }).catch(() => null),
      ]);

      if (cancelled) return;

      // Health score — average of whichever category scores the latest report has
      if (reportsRes?.ok) {
        const reports: BackendReport[] = await reportsRes.json();
        if (reports.length > 0) {
          const latest = reports.reduce((a, b) => new Date(a.generated_at) > new Date(b.generated_at) ? a : b);
          setLatestReport(latest);
        } else {
          setLatestReport(null);
        }
      } else {
        setLatestReport(null);
      }

      // Chat + roadmap — used for both the stat cards and the activity feed
      let chatMessages: ChatHistoryItem[] = [];
      if (historyRes?.ok) {
        chatMessages = await historyRes.json();
        setChatCount(chatMessages.length);
      } else {
        setChatCount(null);
      }

      let milestones: BackendMilestone[] = [];
      if (roadmapRes?.ok) {
        milestones = await roadmapRes.json();
        setMilestoneCount(milestones.length);
      } else {
        setMilestoneCount(null);
      }

      // Repo intelligence — a 404 here is expected for idea-only (text/voice)
      // projects or ones where analysis hasn't completed, not an error state.
      if (repoIntelRes?.ok) {
        setRepoIntel(await repoIntelRes.json());
      } else {
        setRepoIntel(null);
      }

      // Real activity feed built from actual timestamps — no mock data.
      const items: ActivityItem[] = [
        ...chatMessages.filter(m => m.role === 'assistant').map((m, i) => ({
          id: `chat_${i}`,
          type: 'chat' as const,
          description: `Aaroh answered a question about ${selectedProject!.title}`,
          time: timeAgo(m.created_at),
          timestamp: new Date(m.created_at).getTime(),
        })),
        ...milestones.map(m => ({
          id: `milestone_${m.id}`,
          type: 'roadmap' as const,
          description: `Milestone added: ${m.milestone_title}`,
          time: timeAgo(m.created_at),
          timestamp: new Date(m.created_at).getTime(),
        })),
      ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 6);

      setActivity(items);
      setLoadingDetails(false);
    }

    fetchDetails();
    return () => { cancelled = true; };
  }, [selectedProject?.id, getIdToken]);

  const scoreFields = latestReport
    ? [
        latestReport.architecture_score, latestReport.scalability_score, latestReport.documentation_score,
        latestReport.deployment_readiness_score, latestReport.code_quality_score,
        latestReport.security_score, latestReport.performance_score,
      ].filter((s): s is number => s !== null)
    : [];
  const avgHealthScore = scoreFields.length > 0
    ? Math.round(scoreFields.reduce((a, b) => a + b, 0) / scoreFields.length)
    : null;

  const activityIcons = { chat: MessageSquare, roadmap: GitBranch };

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
            { label: 'Total Projects', value: String(projects.length), icon: Zap, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-950' },
            { label: 'Active Project Health', value: avgHealthScore !== null ? String(avgHealthScore) : '—', icon: Activity, color: 'text-accent-500', bg: 'bg-accent-50 dark:bg-accent-950' },
            { label: 'Chat Messages', value: chatCount !== null ? String(chatCount) : '—', icon: MessageSquare, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950' },
            { label: 'Roadmap Milestones', value: milestoneCount !== null ? String(milestoneCount) : '—', icon: TrendingUp, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950' },
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

        {/* Active project overview — real repo-intel data, honest fallback otherwise */}
        {selectedProject && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title text-lg flex items-center gap-2">
                <Sparkles size={18} className="text-accent-500" />
                {selectedProject.title}
              </h2>
              {latestReport && (
                <div className="flex items-center gap-3">
                  <ScoreRing score={avgHealthScore ?? 0} />
                  <span className="text-sm text-muted">Health score</span>
                </div>
              )}
            </div>

            {loadingDetails ? (
              <p className="text-sm text-muted">Loading project overview...</p>
            ) : repoIntel?.analysis ? (
              <div className="space-y-3">
                {repoIntel.analysis.project_summary && (
                  <p className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed">
                    {repoIntel.analysis.project_summary}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {repoIntel.analysis.project_type && (
                    <span className="badge bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300">
                      {repoIntel.analysis.project_type}
                    </span>
                  )}
                  {repoIntel.analysis.tech_stack.slice(0, 8).map(t => (
                    <span key={t.name} className="badge bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400">
                      {t.name}
                    </span>
                  ))}
                </div>
                {repoIntel.analysis.readme && (
                  <p className="text-xs text-muted">
                    README quality: {repoIntel.analysis.readme.score}/100
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted">
                {selectedProject.input_type === 'text' || selectedProject.input_type === 'voice'
                  ? "This project was created from an idea description — no repository has been analyzed for it."
                  : "Repository analysis hasn't completed for this project yet."}
              </p>
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Projects */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title text-lg">Your projects</h2>
              <Link to="/upload" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                Add new <ArrowRight size={14} />
              </Link>
            </div>

            {projectsLoading && (
              <div className="card p-8 text-center text-muted">Loading your projects...</div>
            )}

            {!projectsLoading && projects.length === 0 && (
              <div className="card p-8 text-center">
                <p className="text-muted mb-3">You don't have any projects yet.</p>
                <Link to="/upload" className="btn-primary inline-flex items-center gap-2">
                  <Plus size={16} />Create your first project
                </Link>
              </div>
            )}

            {!projectsLoading && projects.length > 0 && (
              <div className="space-y-3">
                {projects.map(p => (
                  <div
                    key={p.id}
                    className={`card p-5 card-hover flex items-center gap-4 ${
                      p.id === selectedProject?.id ? 'border-primary-400 dark:border-primary-600' : ''
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-surface-900 dark:text-surface-100 truncate">{p.title}</h3>
                        <span className="badge bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400">
                          {p.input_type}
                        </span>
                        {p.id === selectedProject?.id && (
                          <span className="badge bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300">Active</span>
                        )}
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

          {/* Recent activity — built from real chat + roadmap timestamps */}
          <div>
            <h2 className="section-title text-lg mb-4">Recent activity</h2>
            <div className="card divide-y divide-surface-100 dark:divide-surface-700">
              {activity.length === 0 && (
                <div className="px-4 py-6 text-sm text-muted text-center">
                  {selectedProject ? 'No activity yet for this project.' : 'Select a project to see activity.'}
                </div>
              )}
              {activity.map(({ id, type, description, time }) => {
                const Icon = activityIcons[type];
                return (
                  <div key={id} className="px-4 py-3.5 flex items-start gap-3 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon size={13} className="text-surface-500 dark:text-surface-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-surface-700 dark:text-surface-300 leading-snug">{description}</p>
                      <p className="text-xs text-muted mt-0.5">{time}</p>
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
