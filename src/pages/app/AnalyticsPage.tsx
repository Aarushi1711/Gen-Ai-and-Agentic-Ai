import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import AppLayout from '../../layouts/AppLayout';
import { mockAnalytics } from '../../data/mockData';
import { useTheme } from '../../context/ThemeContext';
import { TrendingUp, Code2, GitBranch, AlertCircle, FileText, TestTube } from 'lucide-react';

export default function AnalyticsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const axisColor = isDark ? '#64748b' : '#94a3b8';
  const gridColor = isDark ? '#1e293b' : '#f1f5f9';
  const tooltipBg = isDark ? '#1e293b' : '#fff';
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0';
  const tooltipText = isDark ? '#f1f5f9' : '#0f172a';
  const data = mockAnalytics;

  const customTooltip = {
    contentStyle: {
      background: tooltipBg,
      border: `1px solid ${tooltipBorder}`,
      borderRadius: 8,
      color: tooltipText,
      fontSize: 12,
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    },
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="text-muted mt-1">VectorSearch Engine — Project metrics and trends</p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Code2, label: 'Lines of Code', value: data.linesOfCode.toLocaleString(), color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-950' },
            { icon: FileText, label: 'Files', value: data.fileCount, color: 'text-accent-500', bg: 'bg-accent-50 dark:bg-accent-950' },
            { icon: TestTube, label: 'Test Coverage', value: `${data.testCoverage}%`, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950' },
            { icon: AlertCircle, label: 'Open Issues', value: data.openIssues, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950' },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="card p-5 card-hover">
              <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                <Icon size={17} className={color} />
              </div>
              <div className="text-2xl font-bold text-surface-900 dark:text-surface-100">{value}</div>
              <div className="text-sm text-muted mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Commit activity */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-6">
              <GitBranch size={16} className="text-primary-500" />
              <h2 className="font-semibold text-surface-900 dark:text-surface-100">Commit Activity</h2>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.commitActivity} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="week" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...customTooltip} />
                <Bar dataKey="commits" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Commits" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Health score trend */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp size={16} className="text-accent-500" />
              <h2 className="font-semibold text-surface-900 dark:text-surface-100">Health Score Trend</h2>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.healthScoreTrend} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="date" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[50, 100]} tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...customTooltip} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ fill: '#10b981', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                  name="Health Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Tech stack breakdown */}
          <div className="card p-6">
            <h2 className="font-semibold text-surface-900 dark:text-surface-100 mb-6">Tech Stack Breakdown</h2>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={data.techStackBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {data.techStackBreakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip {...customTooltip} formatter={(v) => [`${v}%`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {data.techStackBreakdown.map(({ name, value, color }) => (
                  <div key={name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: color }} />
                    <span className="text-sm text-surface-700 dark:text-surface-300 flex-1">{name}</span>
                    <span className="text-sm font-medium text-surface-900 dark:text-surface-100">{value}%</span>
                    <div className="w-16 bg-surface-100 dark:bg-surface-700 rounded-full h-1.5">
                      <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category scores radar */}
          <div className="card p-6">
            <h2 className="font-semibold text-surface-900 dark:text-surface-100 mb-6">Category Scores</h2>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={data.categoryScores} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
                <PolarGrid stroke={isDark ? '#334155' : '#e2e8f0'} />
                <PolarAngleAxis dataKey="category" tick={{ fill: axisColor, fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  dataKey="score"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.15}
                  strokeWidth={2}
                  name="Score"
                />
                <Tooltip {...customTooltip} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
