import { useState } from 'react';
import { CheckCircle, Clock, Circle, ChevronDown, ChevronUp, Calendar, List, LayoutGrid } from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import { mockRoadmap } from '../../data/mockData';

type ViewMode = 'timeline' | 'kanban';
type Status = 'completed' | 'in_progress' | 'pending';

const statusConfig: Record<Status, { icon: React.ComponentType<{size?: number; className?: string}>; color: string; bg: string; label: string }> = {
  completed: { icon: CheckCircle, color: 'text-accent-600 dark:text-accent-400', bg: 'bg-accent-500', label: 'Completed' },
  in_progress: { icon: Clock, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-500', label: 'In Progress' },
  pending: { icon: Circle, color: 'text-surface-400 dark:text-surface-500', bg: 'bg-surface-300 dark:bg-surface-600', label: 'Pending' },
};

function TimelineMilestone({ milestone, isLast }: { milestone: typeof mockRoadmap.milestones[0]; isLast: boolean }) {
  const [expanded, setExpanded] = useState(milestone.status === 'in_progress');
  const config = statusConfig[milestone.status as Status];
  const Icon = config.icon;
  const doneCount = milestone.tasks.filter(t => t.done).length;

  return (
    <div className="flex gap-4">
      {/* Timeline indicator */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
          milestone.status === 'completed' ? 'border-accent-500 bg-accent-50 dark:bg-accent-950' :
          milestone.status === 'in_progress' ? 'border-primary-500 bg-primary-50 dark:bg-primary-950' :
          'border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-800'
        }`}>
          <Icon size={18} className={config.color} />
        </div>
        {!isLast && <div className="flex-1 w-px bg-surface-200 dark:bg-surface-700 my-1 min-h-[24px]" />}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div
          className="card overflow-hidden cursor-pointer hover:shadow-card-hover transition-shadow"
          onClick={() => setExpanded(e => !e)}
        >
          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-semibold text-surface-900 dark:text-surface-100">{milestone.title}</h3>
                  <span className={`badge ${
                    milestone.status === 'completed' ? 'bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-300' :
                    milestone.status === 'in_progress' ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' :
                    'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400'
                  }`}>{config.label}</span>
                </div>
                <p className="text-sm text-muted">{milestone.description}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-1 text-xs text-muted">
                  <Calendar size={12} />
                  <span>{milestone.dueDate}</span>
                </div>
                {expanded ? <ChevronUp size={16} className="text-surface-400" /> : <ChevronDown size={16} className="text-surface-400" />}
              </div>
            </div>

            {/* Task progress bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-muted mb-1">
                <span>{doneCount}/{milestone.tasks.length} tasks</span>
                <span>{Math.round((doneCount / milestone.tasks.length) * 100)}%</span>
              </div>
              <div className="w-full bg-surface-100 dark:bg-surface-700 rounded-full h-1.5">
                <div
                  className={`h-full rounded-full ${milestone.status === 'completed' ? 'bg-accent-500' : 'bg-primary-500'}`}
                  style={{ width: `${(doneCount / milestone.tasks.length) * 100}%`, transition: 'width 0.5s ease' }}
                />
              </div>
            </div>
          </div>

          {expanded && (
            <div className="border-t border-surface-100 dark:border-surface-700 px-5 py-4 space-y-2 animate-fade-in">
              {milestone.tasks.map(task => (
                <div key={task.id} className="flex items-center gap-2.5 text-sm">
                  <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                    task.done ? 'bg-accent-500' : 'border-2 border-surface-300 dark:border-surface-600'
                  }`}>
                    {task.done && <CheckCircle size={12} className="text-white" />}
                  </div>
                  <span className={task.done ? 'text-muted line-through' : 'text-surface-700 dark:text-surface-300'}>
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({ status, milestones }: { status: Status; milestones: typeof mockRoadmap.milestones }) {
  const config = statusConfig[status];
  const filtered = milestones.filter(m => m.status === status);
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={`w-2 h-2 rounded-full ${config.bg}`} />
        <h3 className="font-semibold text-sm text-surface-700 dark:text-surface-300">{config.label}</h3>
        <span className="ml-auto text-xs text-muted bg-surface-100 dark:bg-surface-800 px-2 py-0.5 rounded-full">{filtered.length}</span>
      </div>
      <div className="space-y-3">
        {filtered.map(m => {
          const doneCount = m.tasks.filter(t => t.done).length;
          return (
            <div key={m.id} className="card p-4">
              <h4 className="font-medium text-surface-900 dark:text-surface-100 text-sm mb-1">{m.title}</h4>
              <p className="text-xs text-muted mb-3 leading-relaxed">{m.description}</p>
              <div className="flex items-center justify-between text-xs text-muted mb-1">
                <span className="flex items-center gap-1"><Calendar size={11} />{m.dueDate}</span>
                <span>{doneCount}/{m.tasks.length}</span>
              </div>
              <div className="w-full bg-surface-100 dark:bg-surface-700 rounded-full h-1">
                <div
                  className={`h-full rounded-full ${status === 'completed' ? 'bg-accent-500' : status === 'in_progress' ? 'bg-primary-500' : 'bg-surface-300'}`}
                  style={{ width: `${(doneCount / m.tasks.length) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="card p-4 text-center text-xs text-muted border-dashed">No milestones</div>
        )}
      </div>
    </div>
  );
}

export default function RoadmapPage() {
  const [view, setView] = useState<ViewMode>('timeline');
  const milestones = mockRoadmap.milestones;
  const completedCount = milestones.filter(m => m.status === 'completed').length;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">Roadmap</h1>
            <p className="text-muted mt-1">VectorSearch Engine — {completedCount}/{milestones.length} milestones completed</p>
          </div>
          <div className="flex gap-1 p-1 bg-surface-100 dark:bg-surface-800 rounded-lg">
            {([['timeline', List], ['kanban', LayoutGrid]] as const).map(([v, Icon]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  view === v ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 shadow-sm' : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-300'
                }`}
              >
                <Icon size={15} />{v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Progress summary */}
        <div className="grid grid-cols-3 gap-4">
          {(['completed', 'in_progress', 'pending'] as Status[]).map(s => {
            const count = milestones.filter(m => m.status === s).length;
            const config = statusConfig[s];
            const Icon = config.icon;
            return (
              <div key={s} className="card p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  s === 'completed' ? 'bg-accent-50 dark:bg-accent-950' :
                  s === 'in_progress' ? 'bg-primary-50 dark:bg-primary-950' :
                  'bg-surface-100 dark:bg-surface-800'
                }`}>
                  <Icon size={18} className={config.color} />
                </div>
                <div>
                  <div className="text-xl font-bold text-surface-900 dark:text-surface-100">{count}</div>
                  <div className="text-xs text-muted">{config.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Views */}
        {view === 'timeline' ? (
          <div className="space-y-0">
            {milestones.map((m, i) => (
              <TimelineMilestone key={m.id} milestone={m} isLast={i === milestones.length - 1} />
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {(['completed', 'in_progress', 'pending'] as Status[]).map(s => (
              <KanbanColumn key={s} status={s} milestones={milestones} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
