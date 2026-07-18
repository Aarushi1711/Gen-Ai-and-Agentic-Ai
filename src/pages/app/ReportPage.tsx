import { useRef } from 'react';
import { Printer, Download, Share2, CheckCircle, AlertTriangle, Zap, Calendar } from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import { mockHealthReport, mockProjects, mockRoadmap } from '../../data/mockData';

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
  const reportRef = useRef<HTMLDivElement>(null);
  const project = mockProjects[0];
  const report = mockHealthReport;

  const handlePrint = () => window.print();

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
        {/* Toolbar (not printed) */}
        <div className="flex items-center justify-between print:hidden">
          <div>
            <h1 className="page-title">PDF Report</h1>
            <p className="text-muted mt-1">Printable health analysis for {project.name}</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary flex items-center gap-2 text-sm">
              <Share2 size={15} />Share
            </button>
            <button className="btn-secondary flex items-center gap-2 text-sm">
              <Download size={15} />Export PDF
            </button>
            <button onClick={handlePrint} className="btn-primary flex items-center gap-2 text-sm">
              <Printer size={15} />Print
            </button>
          </div>
        </div>

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
            <p className="text-xl text-surface-600 dark:text-surface-400 mb-4">{project.name}</p>
            <div className="flex items-center justify-center gap-6 text-sm text-muted flex-wrap">
              <span className="flex items-center gap-1.5"><Calendar size={13} />Generated: {new Date().toLocaleDateString()}</span>
              <span>Last analyzed: {new Date(report.lastAnalyzed).toLocaleDateString()}</span>
              <span>Powered by Aaroh AI</span>
            </div>
          </div>

          {/* Executive summary */}
          <section>
            <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100 mb-4 pb-2 border-b border-surface-100 dark:border-surface-700">Executive Summary</h2>
            <div className="grid sm:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-6 bg-surface-50 dark:bg-surface-800 rounded-xl">
                <div className="text-5xl font-bold text-surface-900 dark:text-surface-100 mb-1">{report.overallScore}</div>
                <div className="text-sm font-semibold text-surface-600 dark:text-surface-400">Overall Health Score</div>
                <div className="text-xs text-accent-600 dark:text-accent-400 mt-1 font-medium">
                  {report.overallScore >= 85 ? 'Excellent' : report.overallScore >= 70 ? 'Good' : 'Needs Improvement'}
                </div>
              </div>
              <div className="sm:col-span-2 p-6 bg-surface-50 dark:bg-surface-800 rounded-xl">
                <p className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed mb-3">
                  <strong>{project.name}</strong> is a {project.description.toLowerCase()}. This report covers a comprehensive 
                  analysis across six health dimensions: architecture, scalability, documentation, code quality, 
                  security, and performance.
                </p>
                <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
                  The project demonstrates strong fundamentals with an overall health score of {report.overallScore}/100. 
                  Key strengths include architecture ({report.categories[0].score}/100) and code quality ({report.categories[3].score}/100). 
                  Primary areas for improvement are documentation and performance optimization.
                </p>
              </div>
            </div>
          </section>

          {/* Score overview */}
          <section>
            <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100 mb-4 pb-2 border-b border-surface-100 dark:border-surface-700">Health Dimension Scores</h2>
            <div className="space-y-4">
              {report.categories.map(cat => (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-surface-800 dark:text-surface-200">{cat.name}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      cat.status === 'excellent' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                      'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    }`}>{cat.status === 'excellent' ? 'Excellent' : 'Good'}</span>
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
              {report.categories.map(cat => (
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
              {mockRoadmap.milestones.map((m, i) => (
                <div key={m.id} className="flex gap-3 p-4 bg-surface-50 dark:bg-surface-800 rounded-lg">
                  <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-surface-200 dark:bg-surface-700 text-xs font-bold text-surface-600 dark:text-surface-400">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-medium text-sm text-surface-800 dark:text-surface-200">{m.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted">{m.dueDate}</span>
                        <span className={`badge text-xs ${
                          m.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                          m.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                          'bg-surface-100 dark:bg-surface-700 text-surface-500 dark:text-surface-400'
                        }`}>{m.status.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted mt-0.5">{m.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Tech stack */}
          <section>
            <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100 mb-4 pb-2 border-b border-surface-100 dark:border-surface-700">Detected Tech Stack</h2>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map(tech => (
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
