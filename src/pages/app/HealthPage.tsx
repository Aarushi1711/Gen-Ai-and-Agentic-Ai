import { useState } from 'react';
import {
  Activity, TrendingUp, AlertTriangle, CheckCircle,
  ChevronDown, ChevronUp, Shield, Zap, FileText, Code2, Server, BarChart3
} from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import { mockHealthReport, mockProjects } from '../../data/mockData';

type Status = 'excellent' | 'good' | 'warning' | 'critical';

const statusConfig: Record<Status, { color: string; bg: string; label: string; icon: React.ComponentType<{size?: number; className?: string}> }> = {
  excellent: { color: 'text-accent-600 dark:text-accent-400', bg: 'bg-accent-50 dark:bg-accent-950', label: 'Excellent', icon: CheckCircle },
  good: { color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-950', label: 'Good', icon: TrendingUp },
  warning: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950', label: 'Needs attention', icon: AlertTriangle },
  critical: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950', label: 'Critical', icon: AlertTriangle },
};

const categoryIcons: Record<string, React.ComponentType<{size?: number; className?: string}>> = {
  Architecture: Server,
  Scalability: TrendingUp,
  Documentation: FileText,
  'Code Quality': Code2,
  Security: Shield,
  Performance: Zap,
};

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="w-full bg-surface-100 dark:bg-surface-700 rounded-full h-2 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

function CategoryCard({ cat }: { cat: typeof mockHealthReport.categories[0] }) {
  const [expanded, setExpanded] = useState(false);
  const config = statusConfig[cat.status as Status] || statusConfig.good;
  const Icon = categoryIcons[cat.name] || Activity;
  const barColor = cat.score >= 85 ? 'bg-accent-500' : cat.score >= 70 ? 'bg-primary-500' : cat.score >= 55 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="card overflow-hidden">
      <button
        className="w-full p-5 flex items-center gap-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
      >
        <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={18} className={config.color} />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="font-semibold text-surface-900 dark:text-surface-100">{cat.name}</h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
              <span className="text-lg font-bold text-surface-900 dark:text-surface-100">{cat.score}</span>
            </div>
          </div>
          <ScoreBar score={cat.score} color={barColor} />
        </div>
        <div className="flex-shrink-0 text-surface-400">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-surface-100 dark:border-surface-700 pt-4 animate-fade-in">
          <p className="text-sm text-surface-700 dark:text-surface-300 mb-3">{cat.summary}</p>
          {cat.issues.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wide mb-2">Issues to address:</p>
              <ul className="space-y-1.5">
                {cat.issues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-surface-600 dark:text-surface-400">
                    <AlertTriangle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OverallScoreGauge({ score }: { score: number }) {
  const color = score >= 85 ? '#10b981' : score >= 70 ? '#3b82f6' : score >= 55 ? '#f59e0b' : '#ef4444';
  const r = 56;
  const circ = Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="relative flex items-center justify-center w-40 h-28">
      <svg width="140" height="90" viewBox="0 0 140 90">
        <path d="M 14 80 A 56 56 0 0 1 126 80" fill="none" stroke="currentColor" strokeWidth="10" className="text-surface-200 dark:text-surface-700" strokeLinecap="round" />
        <path
          d="M 14 80 A 56 56 0 0 1 126 80"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: 'stroke-dasharray 1s ease-out' }}
        />
      </svg>
      <div className="absolute bottom-2 text-center">
        <div className="text-4xl font-bold text-surface-900 dark:text-surface-100">{score}</div>
        <div className="text-xs text-muted">/ 100</div>
      </div>
    </div>
  );
}

export default function HealthPage() {
  const [selectedProject] = useState(mockProjects[0]);
  const report = mockHealthReport;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">Project Health</h1>
            <p className="text-muted mt-1">{selectedProject.name}</p>
          </div>
          <div className="flex gap-2">
            <a href="/report" className="btn-secondary flex items-center gap-2 text-sm">
              <FileText size={15} />Export Report
            </a>
            <button className="btn-primary text-sm flex items-center gap-2">
              <Activity size={15} />Re-analyze
            </button>
          </div>
        </div>

        {/* Overall score card */}
        <div className="card p-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex flex-col items-center">
              <OverallScoreGauge score={report.overallScore} />
              <p className="text-sm font-semibold text-surface-700 dark:text-surface-300 mt-1">Overall Health</p>
              <p className="text-xs text-muted">Last analyzed {new Date(report.lastAnalyzed).toLocaleDateString()}</p>
            </div>
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {report.categories.map(cat => (
                <div key={cat.name} className="text-center">
                  <div className="text-2xl font-bold text-surface-900 dark:text-surface-100">{cat.score}</div>
                  <div className="text-xs text-muted mt-0.5">{cat.name}</div>
                  <div className={`text-xs font-medium mt-1 ${statusConfig[cat.status as Status]?.color || 'text-muted'}`}>
                    {statusConfig[cat.status as Status]?.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Radar / quick summary bars */}
        <div className="card p-6">
          <h2 className="font-semibold text-surface-900 dark:text-surface-100 mb-4">Score Overview</h2>
          <div className="space-y-3">
            {report.categories.map(cat => {
              const barColor = cat.score >= 85 ? 'bg-accent-500' : cat.score >= 70 ? 'bg-primary-500' : 'bg-amber-500';
              return (
                <div key={cat.name} className="flex items-center gap-3">
                  <span className="w-28 text-sm text-surface-600 dark:text-surface-400 flex-shrink-0">{cat.name}</span>
                  <div className="flex-1">
                    <ScoreBar score={cat.score} color={barColor} />
                  </div>
                  <span className="w-8 text-right text-sm font-semibold text-surface-900 dark:text-surface-100">{cat.score}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category details */}
        <div>
          <h2 className="section-title text-lg mb-4">Detailed Analysis</h2>
          <div className="space-y-3">
            {report.categories.map(cat => (
              <CategoryCard key={cat.name} cat={cat} />
            ))}
          </div>
        </div>

        {/* Priority fixes */}
        <div className="card p-6 border-l-4 border-l-amber-500">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-amber-500" />
            <h2 className="font-semibold text-surface-900 dark:text-surface-100">Priority Fixes</h2>
          </div>
          <p className="text-sm text-muted mb-4">Address these issues to improve your score the most:</p>
          <div className="space-y-2">
            {report.categories.flatMap(c => c.issues).slice(0, 4).map((issue, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm text-surface-700 dark:text-surface-300">
                <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 text-xs flex items-center justify-center flex-shrink-0 font-bold mt-0.5">{i + 1}</span>
                {issue}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
