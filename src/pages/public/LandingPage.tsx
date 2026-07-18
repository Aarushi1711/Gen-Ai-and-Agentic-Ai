import { Link } from 'react-router-dom';
import {
  Zap, ArrowRight, Brain, Map, GitBranch, BarChart3,
  MessageSquare, FileText, Upload, Shield, ChevronRight,
  Star, Code2, Rocket, BookOpen
} from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    description: 'Deep code analysis using LLMs to detect architecture patterns, anti-patterns, and improvement opportunities.',
    color: 'text-primary-500',
    bg: 'bg-primary-50 dark:bg-primary-950',
  },
  {
    icon: Map,
    title: 'Intelligent Roadmaps',
    description: 'Auto-generated milestone-based roadmaps tailored to your project stage and goals.',
    color: 'text-accent-500',
    bg: 'bg-accent-50 dark:bg-accent-950',
  },
  {
    icon: GitBranch,
    title: 'Architecture Visualization',
    description: 'Interactive diagrams of your detected tech stack, services, and data flow — built with React Flow.',
    color: 'text-violet-500',
    bg: 'bg-violet-50 dark:bg-violet-950',
  },
  {
    icon: MessageSquare,
    title: 'AI Mentor Chat',
    description: 'Conversational guidance from an AI trained on engineering best practices and your specific codebase.',
    color: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-950',
  },
  {
    icon: BarChart3,
    title: 'Health Scorecards',
    description: 'Six-dimensional health scoring: architecture, scalability, security, docs, code quality, and performance.',
    color: 'text-rose-500',
    bg: 'bg-rose-50 dark:bg-rose-950',
  },
  {
    icon: FileText,
    title: 'Exportable Reports',
    description: 'Print-ready PDF reports summarizing your entire project health analysis for stakeholders.',
    color: 'text-teal-500',
    bg: 'bg-teal-50 dark:bg-teal-950',
  },
];

const personas = [
  { icon: Code2, title: 'Developers', description: 'Get expert feedback on architecture, code quality, and technical debt — without waiting for a code review.', accent: 'primary' },
  { icon: BookOpen, title: 'Students', description: 'Learn by doing. Get mentorship-grade feedback on your projects and understand what production-ready looks like.', accent: 'accent' },
  { icon: Rocket, title: 'Founders', description: 'Validate your technical stack, identify risks early, and communicate project health to technical co-founders and investors.', accent: 'violet' },
  { icon: Shield, title: 'Researchers', description: 'Document and structure AI/ML experiments with clear architecture visualizations and reproducibility reports.', accent: 'orange' },
];

const techStack = ['React', 'FastAPI', 'Python', 'LangChain', 'OpenAI', 'pgvector', 'Supabase', 'TypeScript', 'Docker', 'Kubernetes'];

const steps = [
  { num: '01', title: 'Share Your Idea', description: 'Upload a GitHub repo, drop a ZIP, paste code, or just describe your idea in natural language.' },
  { num: '02', title: 'AI Analysis', description: 'Aaroh parses your project, detects the stack, and scores it across 6 health dimensions in seconds.' },
  { num: '03', title: 'Get Your Roadmap', description: 'Receive a milestone-based roadmap with prioritized actions and an interactive architecture diagram.' },
  { num: '04', title: 'Deploy with Confidence', description: 'Track progress, chat with your AI mentor, and export your health report for stakeholders.' },
];

export default function LandingPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-surface-50 to-white dark:from-surface-950 dark:to-surface-900 pt-20 pb-32">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-primary-500/10 via-accent-500/10 to-primary-500/10 blur-3xl rounded-full" />
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 text-sm font-medium mb-6 animate-fade-in">
            <Zap size={14} />
            <span>AI-Powered Project Mentorship</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-surface-900 dark:text-surface-100 mb-6 leading-[1.1] animate-slide-up">
            Every Great Project Starts
            <br />
            <span className="text-gradient">with the Right Guidance.</span>
          </h1>
          <p className="text-xl text-surface-600 dark:text-surface-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up">
            Aaroh AI analyzes your codebase, generates intelligent roadmaps, and provides
            real-time mentorship — so you build better, faster, and with confidence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
            <Link to="/signup" className="btn-primary px-8 py-3 text-base flex items-center gap-2 shadow-glow">
              Start for Free <ArrowRight size={18} />
            </Link>
            <Link to="/about" className="btn-secondary px-8 py-3 text-base flex items-center gap-2">
              How it works <ChevronRight size={18} />
            </Link>
          </div>

          {/* Trust bar */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-6 opacity-60">
            {['Trusted by 2,000+ developers', '10,000+ projects analyzed', '4.9/5 rating'].map(t => (
              <div key={t} className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                <Star size={14} className="text-amber-400 fill-amber-400" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What is Aaroh AI */}
      <section className="py-24 px-6 bg-white dark:bg-surface-900">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">What is Aaroh AI?</span>
              <h2 className="section-title mt-2 mb-4 text-3xl">Your personalized AI mentor for GenAI &amp; Agentic projects</h2>
              <p className="text-surface-600 dark:text-surface-400 leading-relaxed mb-6">
                Aaroh AI bridges the gap between having an idea and shipping a production-ready project. Upload your
                code or describe your concept, and our AI analyzes architecture, suggests improvements, and guides
                you step-by-step through development.
              </p>
              <p className="text-surface-600 dark:text-surface-400 leading-relaxed mb-8">
                Unlike generic AI assistants, Aaroh maintains context about your specific project, learns your
                tech stack, and provides expert-level mentorship that improves as your project evolves.
              </p>
              <Link to="/signup" className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold hover:gap-3 transition-all">
                Get started free <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Projects Analyzed', value: '10K+', color: 'from-primary-500 to-primary-600' },
                { label: 'Avg Health Score Improvement', value: '+31%', color: 'from-accent-500 to-accent-600' },
                { label: 'Dev Hours Saved', value: '50K+', color: 'from-violet-500 to-violet-600' },
                { label: 'User Satisfaction', value: '4.9★', color: 'from-orange-500 to-orange-600' },
              ].map(({ label, value, color }) => (
                <div key={label} className="card p-6 text-center card-hover">
                  <div className={`text-3xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent mb-1`}>{value}</div>
                  <div className="text-sm text-muted">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-surface-50 dark:bg-surface-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-accent-600 dark:text-accent-400 uppercase tracking-wider">Process</span>
            <h2 className="section-title mt-2 text-3xl">From idea to deployment in four steps</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map(({ num, title, description }) => (
              <div key={num} className="relative">
                <div className="card p-6 card-hover h-full">
                  <div className="text-4xl font-bold text-surface-200 dark:text-surface-700 mb-3 font-mono">{num}</div>
                  <h3 className="font-semibold text-surface-900 dark:text-surface-100 mb-2">{title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{description}</p>
                </div>
                {num !== '04' && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-surface-300 dark:bg-surface-600" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-white dark:bg-surface-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Features</span>
            <h2 className="section-title mt-2 text-3xl">Everything your project needs to succeed</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description, color, bg }) => (
              <div key={title} className="card p-6 card-hover group">
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-4`}>
                  <Icon size={20} className={color} />
                </div>
                <h3 className="font-semibold text-surface-900 dark:text-surface-100 mb-2">{title}</h3>
                <p className="text-sm text-muted leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who is it for */}
      <section className="py-24 px-6 bg-surface-50 dark:bg-surface-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">Who it's for</span>
            <h2 className="section-title mt-2 text-3xl">Built for every builder</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {personas.map(({ icon: Icon, title, description }) => (
              <div key={title} className="card p-6 flex gap-4 card-hover">
                <div className="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-primary-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-surface-900 dark:text-surface-100 mb-1">{title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="py-16 px-6 bg-white dark:bg-surface-900 border-y border-surface-100 dark:border-surface-800">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm text-muted mb-8 font-medium uppercase tracking-wider">Supports projects built with</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {techStack.map(tech => (
              <span key={tech} className="px-4 py-2 rounded-full bg-surface-100 dark:bg-surface-800 text-sm font-medium text-surface-700 dark:text-surface-300 border border-surface-200 dark:border-surface-700 hover:border-primary-400 dark:hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-default">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6 bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-800 dark:to-surface-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to mentor your next project?</h2>
          <p className="text-primary-200 text-lg mb-10 leading-relaxed">
            Join thousands of developers who ship better products with AI-powered guidance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="bg-white hover:bg-surface-50 text-primary-700 font-semibold px-8 py-3 rounded-lg transition-colors flex items-center gap-2">
              Get started free <ArrowRight size={18} />
            </Link>
            <Link to="/about" className="border border-primary-400 hover:border-white text-primary-200 hover:text-white font-medium px-8 py-3 rounded-lg transition-colors">
              Learn more
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
