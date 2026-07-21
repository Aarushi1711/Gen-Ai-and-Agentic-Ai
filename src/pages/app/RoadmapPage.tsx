import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Circle } from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { ENDPOINTS } from '../../config/api';

interface BackendMilestone {
  id: number;
  project_id: number;
  milestone_title: string;
  milestone_description: string | null;
  order_index: number;
  created_at: string;
}

export default function RoadmapPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { getIdToken } = useAuth();
  const [milestones, setMilestones] = useState<BackendMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    async function fetchRoadmap() {
      try {
        const token = await getIdToken();
        const res = await fetch(`${ENDPOINTS.roadmap.get(projectId!)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load roadmap');
        const data: BackendMilestone[] = await res.json();
        setMilestones(data.sort((a, b) => a.order_index - b.order_index));
      } catch {
        setError('Could not load the roadmap. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchRoadmap();
  }, [projectId, getIdToken]);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="page-title">Roadmap</h1>
          <p className="text-muted mt-1">
            {loading ? 'Loading...' : `${milestones.length} milestone${milestones.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {loading && (
          <div className="card p-8 text-center text-muted">Loading roadmap...</div>
        )}

        {!loading && error && (
          <div className="card p-8 text-center text-red-500">{error}</div>
        )}

        {!loading && !error && milestones.length === 0 && (
          <div className="card p-8 text-center text-muted">
            No milestones yet for this project.
          </div>
        )}

        {!loading && !error && milestones.length > 0 && (
          <div className="space-y-3">
            {milestones.map((m, i) => (
              <div key={m.id} className="flex gap-4">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-800">
                    <Circle size={16} className="text-surface-400 dark:text-surface-500" />
                  </div>
                  {i !== milestones.length - 1 && (
                    <div className="flex-1 w-px bg-surface-200 dark:bg-surface-700 my-1 min-h-[24px]" />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <div className="card p-5">
                    <h3 className="font-semibold text-surface-900 dark:text-surface-100">{m.milestone_title}</h3>
                    {m.milestone_description && (
                      <p className="text-sm text-muted mt-1">{m.milestone_description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}