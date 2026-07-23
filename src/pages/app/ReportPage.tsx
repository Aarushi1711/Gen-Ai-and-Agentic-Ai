import { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Printer, Download, Share2, CheckCircle, AlertTriangle, Zap, Calendar, Loader2 } from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { useSelectedProject } from '../../context/SelectedProjectContext';
import { ENDPOINTS } from '../../config/api';
import ProjectSwitcher from '../../components/shared/ProjectSwitcher';

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
  ai_commentary: string | null;
  category_details: string | null;
  generated_at: string;
}

interface BackendMilestone {
  id: number;
  project_id: number;
  milestone_title: string;
  milestone_description: string | null;
  order_index: number;
  created_at: string;
}

type ReportCategory = {
  name: string;
  score: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  summary: string;
  issues: string[];
};

function scoreToStatus(score: number): ReportCategory['status'] {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 55) return 'warning';
  return 'critical';
}

function buildCategories(report: BackendReport): ReportCategory[] {
  const details: Record<string, { summary?: string; issues?: string[] }> = report.category_details
    ? JSON.parse(report.category_details)
    : {};

  const scoreFields: [string, number | null][] = [
    ['Architecture', report.architecture_score],
    ['Scalability', report.scalability_score],
    ['Documentation', report.documentation_score],
    ['Deployment Readiness', report.deployment_readiness_score],
    ['Code Quality', report.code_quality_score],
    ['Security', report.security_score],
    ['Performance', report.performance_score],
  ];

  return scoreFields
    .filter(([, score]) => typeof score === 'number')
    .map(([name, score]) => ({
      name,
      score: score as number,
      status: scoreToStatus(score as number),
      summary: details[name]?.summary || '',
      issues: details[name]?.issues || [],
    }));
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 85 ? 'bg-green-500' : score >= 70 ? 'bg-blue-500' : 'bg-amber-500';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-gray-100 rounded-full h-2 print:bg-gray-200">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-sm font-bold w-8 text-right">{score}</span>
    </div>
  );
}

export default function ReportPage() {
  const { getIdToken } = useAuth();
  const { selectedProject, loading: projectsLoading } = useSelectedProject();
  const reportRef = useRef<HTMLDivElement>(null);
  const [report, setReport] = useState<BackendReport | null>(null);
  const [milestones, setMilestones] = useState<BackendMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePrint = () => window.print();

  useEffect(() => {
    if (!selectedProject) {
      setLoading(false);
      setReport(null);
      setMilestones([]);
      return;
    }

    const projectId = selectedProject.id;

    async function fetchData() {
      setLoading(true);
      try {
        const token = await getIdToken();
        const [reportRes, roadmapRes] = await Promise.all([
          fetch(ENDPOINTS.health.report(String(projectId)), {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(ENDPOINTS.roadmap.get(String(projectId)), {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!reportRes.ok) {
          throw new Error('Failed to load health report');
        }

        const reports: BackendReport[] = await reportRes.json();
        const latestReport = reports.length > 0
          ? reports.reduce((a, b) => new Date(a.generated_at) > new Date(b.generated_at) ? a : b)
          : null;

        setReport(latestReport);

        if (roadmapRes.ok) {
          const roadmap: BackendMilestone[] = await roadmapRes.json();
          setMilestones(roadmap.sort((a, b) => a.order_index - b.order_index));
        } else {
          setMilestones([]);
        }

        setError(null);
      } catch (err) {
        setReport(null);
        setMilestones([]);
        setError(err instanceof Error ? err.message : 'Could not load report');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedProject, getIdToken]);

  const handleExportPdf = async () => {
    if (!reportRef.current || !selectedProject || !report) return;

    try {
      setExporting(true);
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${selectedProject.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-health-report.pdf`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not export PDF');
    } finally {
      setExporting(false);
    }
  };

  const handleShare = async () => {
    if (!selectedProject || !report) return;

    const shareData = {
      title: `${selectedProject.title} Health Report`,
      text: `Health report for ${selectedProject.title}`,
      url: window.location.href,
    };

    try {
      setSharing(true);
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
      } else {
        throw new Error('Sharing is not supported in this browser');
      }
      setError(null);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError(err instanceof Error ? err.message : 'Could not share report');
      }
    } finally {
      setSharing(false);
    }
  };

  if (projectsLoading || loading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto">
          <div className="card p-8 text-center text-muted flex items-center justify-center gap-2">
            <Loader2 size={18} className="animate-spin" />
            Loading report...
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!selectedProject) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="page-title">PDF Report</h1>
          <div className="card p-8 text-center text-muted">
            You don&apos;t have any projects yet. Upload one to generate a report.
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error && !report) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="page-title">PDF Report</h1>
              <p className="text-muted mt-1">{selectedProject.title}</p>
            </div>
            <ProjectSwitcher />
          </div>
          <div className="card p-8 text-center text-red-500">{error}</div>
        </div>
      </AppLayout>
    );
  }

  if (!report) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="page-title">PDF Report</h1>
              <p className="text-muted mt-1">{selectedProject.title}</p>
            </div>
            <ProjectSwitcher />
          </div>
          <div className="card p-8 text-center text-muted">
            No health report has been generated for this project yet, so there is nothing to export or share.
          </div>
        </div>
      </AppLayout>
    );
  }

  const categories = buildCategories(report);
  const overallScore = categories.length > 0
    ? Math.round(categories.reduce((sum, cat) => sum + cat.score, 0) / categories.length)
    : 0;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
        {/* Toolbar (not printed) */}
        <div className="flex items-center justify-between print:hidden">
          <div>
            <h1 className="page-title">PDF Report</h1>
            <p className="text-muted mt-1">Printable health analysis for {selectedProject.title}</p>
          </div>
          <div className="flex gap-2 items-center">
            <ProjectSwitcher />
            <button onClick={handleShare} disabled={sharing} className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-50">
              {sharing ? <Loader2 size={15} className="animate-spin" /> : <Share2 size={15} />}
              Share
            </button>
            <button onClick={handleExportPdf} disabled={exporting} className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-50">
              {exporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
              Export PDF
            </button>
            <button onClick={handlePrint} className="btn-primary flex items-center gap-2 text-sm">
              <Printer size={15} />Print
            </button>
          </div>
        </div>

        {error && (
          <div className="card p-4 text-sm text-red-500 print:hidden">{error}</div>
        )}

        {/* Report body */}
        <div
          ref={reportRef}
          className="card p-8 md:p-12 print:shadow-none print:border-none space-y-10"
        >
          {/* Cover */}
          <div className="text-center border-b border-surface-200 dark:border-surface-700 pb-10">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center mx-auto mb-4">
              <Zap size={28} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-surface-900 dark:text-surface-100 mb-1">AI Project Health Report</h1>
            <p className="text-xl text-surface-600 dark:text-surface-400 mb-4">{selectedProject.title}</p>
            <div className="flex items-center justify-center gap-6 text-sm text-muted flex-wrap">
              <span className="flex items-center gap-1.5"><Calendar size={13} />Generated: {new Date().toLocaleDateString()}</span>
              <span>Last analyzed: {new Date(report.generated_at).toLocaleDateString()}</span>
              <span>Powered by Aaroh AI</span>
            </div>
          </div>

          {/* Executive summary */}
          <section>
            <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100 mb-4 pb-2 border-b border-surface-100 dark:border-surface-700">Executive Summary</h2>
            <div className="grid sm:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-6 bg-surface-50 dark:bg-surface-800 rounded-xl">
                <div className="text-5xl font-bold text-surface-900 dark:text-surface-100 mb-1">{overallScore}</div>
                <div className="text-sm font-semibold text-surface-600 dark:text-surface-400">Overall Health Score</div>
                <div className="text-xs text-accent-600 dark:text-accent-400 mt-1 font-medium">
                  {overallScore >= 85 ? 'Excellent' : overallScore >= 70 ? 'Good' : 'Needs Improvement'}
                </div>
              </div>
              <div className="sm:col-span-2 p-6 bg-surface-50 dark:bg-surface-800 rounded-xl">
                <p className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed mb-3">
                  <strong>{selectedProject.title}</strong> is evaluated across architecture, scalability, documentation,
                  deployment readiness, code quality, security, and performance.
                </p>
                <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
                  {report.ai_commentary || `The project currently has an overall health score of ${overallScore}/100. Use the sections below to review strengths, weaknesses, and next steps.`}
                </p>
              </div>
            </div>
          </section>

          {/* Score overview */}
          <section>
            <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100 mb-4 pb-2 border-b border-surface-100 dark:border-surface-700">Health Dimension Scores</h2>
            <div className="space-y-4">
              {categories.map(cat => (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-surface-800 dark:text-surface-200">{cat.name}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      cat.status === 'excellent' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                      cat.status === 'good' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                      cat.status === 'warning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' :
                      'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {cat.status === 'excellent' ? 'Excellent' : cat.status === 'good' ? 'Good' : cat.status === 'warning' ? 'Needs Attention' : 'Critical'}
                    </span>
                  </div>
                  <ScoreBar score={cat.score} />
                  <p className="text-xs text-muted mt-1">{cat.summary}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Findings & recommendations */}
          <section>
            <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100 mb-4 pb-2 border-b border-surface-100 dark:border-surface-700">Findings &amp; Recommendations</h2>
            <div className="space-y-6">
              {categories.map(cat => (
                <div key={cat.name}>
                  <h3 className="font-semibold text-surface-800 dark:text-surface-200 mb-2">{cat.name}</h3>
                  <p className="text-sm text-surface-600 dark:text-surface-400 mb-2">{cat.summary}</p>
                  {cat.issues.map((issue, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-surface-600 dark:text-surface-400 ml-2 mb-1">
                      <AlertTriangle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                      {issue}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>

          {/* Roadmap summary */}
          <section>
            <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100 mb-4 pb-2 border-b border-surface-100 dark:border-surface-700">Roadmap Summary</h2>
            <div className="space-y-3">
              {milestones.length === 0 && (
                <div className="text-sm text-muted">No roadmap milestones found for this project.</div>
              )}
              {milestones.map((m, i) => (
                <div key={m.id} className="flex gap-3 p-4 bg-surface-50 dark:bg-surface-800 rounded-lg">
                  <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-surface-200 dark:bg-surface-700 text-xs font-bold text-surface-600 dark:text-surface-400">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-medium text-sm text-surface-800 dark:text-surface-200">{m.milestone_title}</span>
                      <span className="text-xs text-muted">{new Date(m.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-muted mt-0.5">{m.milestone_description || 'No description provided.'}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Tech stack */}
          <section>
            <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100 mb-4 pb-2 border-b border-surface-100 dark:border-surface-700">Detected Tech Stack</h2>
            <div className="flex flex-wrap gap-2">
              {[selectedProject.input_type, selectedProject.github_url ? 'GitHub' : null, selectedProject.zip_filename ? 'ZIP Upload' : null].filter(Boolean).map(tech => (
                <span key={tech} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-100 dark:bg-surface-800 rounded-full text-sm text-surface-700 dark:text-surface-300">
                  <CheckCircle size={12} className="text-accent-500" />
                  {tech}
                </span>
              ))}
            </div>
          </section>

          {/* Footer */}
          <div className="border-t border-surface-200 dark:border-surface-700 pt-6 text-center">
            <p className="text-xs text-muted">
              This report was generated by Aaroh AI on {new Date().toLocaleDateString()}.
              For questions, contact support@aaroh.ai
            </p>
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <div className="w-5 h-5 rounded bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center">
                <Zap size={10} className="text-white" />
              </div>
              <span className="text-xs font-semibold text-surface-500">Aaroh AI — Every great project starts with the right guidance.</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}