import { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Info, AlertCircle, Loader } from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import { mockArchitectureNodes, mockArchitectureEdges } from '../../data/mockData';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useSelectedProject } from '../../context/SelectedProjectContext';
import { ENDPOINTS } from '../../config/api';
import ProjectSwitcher from '../../components/shared/ProjectSwitcher';

const colorMap: Record<string, { bg: string; border: string; text: string }> = {
  blue: { bg: '#eff6ff', border: '#3b82f6', text: '#1d4ed8' },
  teal: { bg: '#f0fdfa', border: '#14b8a6', text: '#0f766e' },
  green: { bg: '#f0fdf4', border: '#22c55e', text: '#15803d' },
  orange: { bg: '#fff7ed', border: '#f97316', text: '#c2410c' },
  purple: { bg: '#faf5ff', border: '#a855f7', text: '#7e22ce' },
  red: { bg: '#fef2f2', border: '#ef4444', text: '#b91c1c' },
  gray: { bg: '#f8fafc', border: '#94a3b8', text: '#475569' },
};

const darkColorMap: Record<string, { bg: string; border: string; text: string }> = {
  blue: { bg: '#172554', border: '#3b82f6', text: '#93c5fd' },
  teal: { bg: '#042f2e', border: '#14b8a6', text: '#5eead4' },
  green: { bg: '#052e16', border: '#22c55e', text: '#86efac' },
  orange: { bg: '#431407', border: '#f97316', text: '#fdba74' },
  purple: { bg: '#3b0764', border: '#a855f7', text: '#d8b4fe' },
  red: { bg: '#450a0a', border: '#ef4444', text: '#fca5a5' },
  gray: { bg: '#1e293b', border: '#64748b', text: '#94a3b8' },
};

function CustomNode({ data }: { data: { label: string; sublabel: string; color: string } }) {
  const { theme } = useTheme();
  const palette = theme === 'dark' ? darkColorMap : colorMap;
  const colors = palette[data.color] || palette.blue;

  return (
    <div
      style={{
        background: colors.bg,
        border: `2px solid ${colors.border}`,
        borderRadius: '12px',
        padding: '12px 16px',
        minWidth: '140px',
        boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: colors.border, width: 8, height: 8 }} />
      <div style={{ fontWeight: 600, fontSize: 13, color: colors.text, marginBottom: 2 }}>{data.label}</div>
      <div style={{ fontSize: 11, color: colors.border, opacity: 0.8 }}>{data.sublabel}</div>
      <Handle type="source" position={Position.Right} style={{ background: colors.border, width: 8, height: 8 }} />
    </div>
  );
}

const nodeTypes = { default: CustomNode, input: CustomNode, output: CustomNode };

const techStackLegend = [
  { color: 'blue', label: 'Frontend' },
  { color: 'teal', label: 'API Layer' },
  { color: 'green', label: 'AI/ML' },
  { color: 'purple', label: 'Data Pipeline' },
  { color: 'orange', label: 'Auth' },
  { color: 'red', label: 'Cache' },
  { color: 'gray', label: 'External' },
];

export default function ArchitecturePage() {
  const { theme } = useTheme();
  const { getIdToken } = useAuth();
  const { selectedProject, loading: projectsLoading } = useSelectedProject();
  const [nodes, setNodes, onNodesChange] = useNodesState(mockArchitectureNodes as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(mockArchitectureEdges as Edge[]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges(eds => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  useEffect(() => {
    if (!selectedProject) {
      setLoading(false);
      return;
    }

    async function fetchArchitecture() {
      setLoading(true);
      try {
        const token = await getIdToken();
        const res = await fetch(ENDPOINTS.architecture.get(String(selectedProject!.id)), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load architecture');
        const data = await res.json();
        setNodes(data.nodes || mockArchitectureNodes as Node[]);
        setEdges(data.edges || mockArchitectureEdges as Edge[]);
        setError(null);
      } catch (err) {
        setError('Could not load architecture. Using mock data instead.');
        setNodes(mockArchitectureNodes as Node[]);
        setEdges(mockArchitectureEdges as Edge[]);
      } finally {
        setLoading(false);
      }
    }
    fetchArchitecture();
  }, [selectedProject, getIdToken, setNodes, setEdges]);

  if (projectsLoading || loading) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto"><div className="card p-8 text-center text-muted flex items-center justify-center gap-2"><Loader size={20} className="animate-spin" /> Loading architecture...</div></div>
      </AppLayout>
    );
  }

  if (!selectedProject) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto space-y-6">
          <h1 className="page-title">Architecture Visualization</h1>
          <div className="card p-8 text-center text-muted">
            You don't have any projects yet. Upload one to get started.
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-4 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">Architecture Visualization</h1>
            <p className="text-muted mt-1">{selectedProject.title} — Interactive architecture diagram</p>
          </div>
          <div className="flex items-center gap-3">
            <ProjectSwitcher />
            <div className="flex items-center gap-2 text-xs text-muted bg-primary-50 dark:bg-primary-950 border border-primary-200 dark:border-primary-800 rounded-lg px-3 py-2">
              <Info size={13} className="text-primary-500" />
              <span>Drag nodes to rearrange. Click for details.</span>
            </div>
          </div>
        </div>
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 text-sm">
            <AlertCircle size={15} />{error}
          </div>
        )}

        {/* Legend */}
        <div className="card p-4 flex flex-wrap gap-3">
          {techStackLegend.map(({ color, label }) => {
            const palette = theme === 'dark' ? darkColorMap : colorMap;
            const c = palette[color];
            return (
              <div key={label} className="flex items-center gap-1.5 text-xs">
                <div className="w-3 h-3 rounded" style={{ background: c.border }} />
                <span className="text-surface-600 dark:text-surface-400">{label}</span>
              </div>
            );
          })}
        </div>

        {/* React Flow canvas */}
        <div className="card overflow-hidden" style={{ height: '560px' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedNode(node)}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            defaultEdgeOptions={{
              style: { stroke: theme === 'dark' ? '#64748b' : '#94a3b8', strokeWidth: 1.5 },
              labelStyle: { fontSize: 11, fill: theme === 'dark' ? '#94a3b8' : '#64748b' },
              labelBgStyle: { fill: theme === 'dark' ? '#1e293b' : '#fff', fillOpacity: 0.8 },
            }}
          >
            <Controls
              style={{
                background: theme === 'dark' ? '#1e293b' : '#fff',
                border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
              }}
            />
            <MiniMap
              style={{
                background: theme === 'dark' ? '#0f172a' : '#f8fafc',
                border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
              }}
              nodeColor={(node) => {
                const color = (node.data as { color?: string }).color;
                const c = colorMap[color || 'blue'];
                return c?.border || '#3b82f6';
              }}
            />
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color={theme === 'dark' ? '#334155' : '#e2e8f0'}
            />
          </ReactFlow>
        </div>

        {/* Node detail panel */}
        {selectedNode && (
          <div className="card p-5 border-l-4 border-l-primary-500 animate-slide-up">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-surface-900 dark:text-surface-100">{selectedNode.data.label}</h3>
                <p className="text-sm text-muted">{selectedNode.data.sublabel}</p>
              </div>
              <button onClick={() => setSelectedNode(null)} className="text-xs text-muted hover:text-surface-700 dark:hover:text-surface-300">
                Dismiss
              </button>
            </div>
            <div className="mt-3 grid sm:grid-cols-3 gap-3">
              <div className="text-sm">
                <span className="text-muted">Node ID:</span>{' '}
                <span className="font-mono text-primary-600 dark:text-primary-400">{selectedNode.id}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted">Type:</span>{' '}
                <span className="font-medium text-surface-700 dark:text-surface-300 capitalize">{selectedNode.type}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted">Connections:</span>{' '}
                <span className="font-medium text-surface-700 dark:text-surface-300">
                  {edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).length} edges
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}