import { ArrowRight, Brain, Heart, Lightbulb, Target, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout';

const team = [
  {
    name: 'Anshita Agrawal',
    avatar: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
  },
  {
    name: 'Aman Bharti',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
  },
  {
    name: 'Ankita Yadav',
    avatar: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
  },
  {
    name: 'Bhavika',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
  },
  {
    name: 'Aarushi Gupta',
    avatar: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
  },
];

const values = [
  { icon: Lightbulb, title: 'Clarity over complexity', description: 'We turn overwhelming codebases into clear, actionable insights anyone can act on.' },
  { icon: Heart, title: 'Mentorship at scale', description: 'Expert guidance should be available to every developer, not just those with senior colleagues nearby.' },
  { icon: Target, title: 'Outcome-driven', description: 'We measure success by projects shipped, not metrics on a dashboard.' },
  { icon: Users, title: 'Community-first', description: 'Built by developers, for developers. Our roadmap is shaped by our community.' },
];

const howItWorks = [
  {
    phase: 'Idea',
    icon: Lightbulb,
    description: 'Share your project concept, GitHub repo, or existing codebase. Aaroh accepts text, voice, ZIP uploads, or direct repository links.',
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950',
  },
  {
    phase: 'Analysis',
    icon: Brain,
    description: 'Our AI pipeline parses your code, detects your tech stack, maps the architecture, and scores six health dimensions in under 60 seconds.',
    color: 'text-primary-500',
    bg: 'bg-primary-50 dark:bg-primary-950',
  },
  {
    phase: 'Roadmap',
    icon: Target,
    description: 'A personalized milestone-based roadmap is generated with prioritized actions, expected timelines, and specific code-level suggestions.',
    color: 'text-accent-500',
    bg: 'bg-accent-50 dark:bg-accent-950',
  },
  {
    phase: 'Deployment',
    icon: Zap,
    description: 'Track progress, chat with your AI mentor, monitor health score improvements, and export professional reports for stakeholders.',
    color: 'text-violet-500',
    bg: 'bg-violet-50 dark:bg-violet-950',
  },
];

export default function AboutPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-surface-50 to-white dark:from-surface-950 dark:to-surface-900 pt-20 pb-24">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">About Aaroh AI</span>
          <h1 className="text-5xl font-bold text-surface-900 dark:text-surface-100 mt-4 mb-6 leading-tight">
            We believe every developer<br />deserves a great mentor.
          </h1>
          <p className="text-xl text-surface-600 dark:text-surface-400 leading-relaxed max-w-2xl mx-auto">
            Aaroh AI was built on a simple insight: the difference between a good project and a great one
            is often just the right guidance at the right moment.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 px-6 bg-white dark:bg-surface-900">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12">
          <div className="card p-8">
            <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950 flex items-center justify-center mb-4">
              <Target size={20} className="text-primary-500" />
            </div>
            <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-3">Our Mission</h2>
            <p className="text-surface-600 dark:text-surface-400 leading-relaxed">
              To give every developer, student, and founder access to expert-level project mentorship —
              regardless of their company size, network, or budget. We democratize the kind of architectural
              thinking that used to require a decade of experience or a senior engineer in your network.
            </p>
          </div>
          <div className="card p-8">
            <div className="w-10 h-10 rounded-lg bg-accent-50 dark:bg-accent-950 flex items-center justify-center mb-4">
              <Lightbulb size={20} className="text-accent-500" />
            </div>
            <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-3">Our Vision</h2>
            <p className="text-surface-600 dark:text-surface-400 leading-relaxed">
              A world where the next great AI application isn't held back by a lack of guidance.
              Where a student in Lagos gets the same quality technical mentorship as an engineer at a
              top-tier Silicon Valley company. Where great ideas become great projects, consistently.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-surface-50 dark:bg-surface-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title text-3xl">How Aaroh AI works</h2>
            <p className="text-muted mt-2 max-w-xl mx-auto">From idea to deployment — four phases of intelligent guidance</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map(({ phase, icon: Icon, description, color, bg }, i) => (
              <div key={phase} className="card p-6 card-hover relative">
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-4`}>
                  <Icon size={20} className={color} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-muted uppercase tracking-wider">Phase {i + 1}</span>
                </div>
                <h3 className="font-semibold text-surface-900 dark:text-surface-100 mb-2">{phase}</h3>
                <p className="text-sm text-muted leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-6 bg-white dark:bg-surface-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title text-3xl">Our values</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {values.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-4 p-6 card card-hover">
                <div className="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-primary-500" />
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

      {/* Team */}
      <section className="py-24 px-6 bg-surface-50 dark:bg-surface-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title text-3xl">The team behind Aaroh</h2>
            <p className="text-muted mt-2">Engineers and researchers on a mission to redefine project mentorship.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map(({ name, avatar }) => (
              <div key={name} className="card p-6 text-center card-hover">
                <img src={avatar} alt={name} className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-2 border-surface-200 dark:border-surface-700" />
                <h3 className="font-semibold text-surface-900 dark:text-surface-100">{name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-white dark:bg-surface-900 border-t border-surface-100 dark:border-surface-800">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-surface-900 dark:text-surface-100 mb-4">Ready to get started?</h2>
          <p className="text-muted mb-8">Join thousands of developers already mentoring their projects with AI.</p>
          <Link to="/signup" className="btn-primary px-8 py-3 inline-flex items-center gap-2">
            Create free account <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
