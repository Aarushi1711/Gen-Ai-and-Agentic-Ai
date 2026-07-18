import React, { useState } from 'react';
import { Camera, Plus, X, Check, Edit2 } from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { mockUser } from '../../data/mockData';

const allSkills = ['React', 'TypeScript', 'Python', 'FastAPI', 'Node.js', 'Go', 'Rust', 'Docker', 'Kubernetes', 'PostgreSQL', 'Redis', 'LangChain', 'OpenAI', 'TensorFlow', 'PyTorch', 'AWS', 'GCP', 'Azure'];
const roleLabels = { student: 'Student', developer: 'Developer', founder: 'Founder', researcher: 'Researcher' };
const timelineOptions = ['1 week', '2 weeks', '1 month', '3 months', '6 months', '1 year'];

export default function ProfilePage() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({ ...mockUser, name: user?.name || mockUser.name, email: user?.email || mockUser.email, role: user?.role || mockUser.role });
  const [selectedSkills, setSelectedSkills] = useState<string[]>(mockUser.skills);
  const [newSkill, setNewSkill] = useState('');
  const [timeline, setTimeline] = useState('1 month');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // TODO: PUT to ENDPOINTS.auth.me
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleSkill = (s: string) => {
    setSelectedSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const addCustomSkill = () => {
    const s = newSkill.trim();
    if (s && !selectedSkills.includes(s)) {
      setSelectedSkills(prev => [...prev, s]);
    }
    setNewSkill('');
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Profile</h1>
            <p className="text-muted mt-1">Manage your account and preferences.</p>
          </div>
          {editing ? (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="btn-secondary flex items-center gap-2">
                <X size={15} />Cancel
              </button>
              <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                <Check size={15} />Save changes
              </button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="btn-secondary flex items-center gap-2">
              <Edit2 size={15} />{saved ? 'Saved!' : 'Edit profile'}
            </button>
          )}
        </div>

        {/* Avatar + basic info */}
        <div className="card p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-surface-200 dark:border-surface-700"
              />
              {editing && (
                <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white hover:bg-primary-700 transition-colors">
                  <Camera size={12} />
                </button>
              )}
            </div>
            <div className="flex-1 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Full name</label>
                  {editing ? (
                    <input className="input" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
                  ) : (
                    <p className="text-surface-900 dark:text-surface-100 font-medium">{profile.name}</p>
                  )}
                </div>
                <div>
                  <label className="label">Email</label>
                  {editing ? (
                    <input className="input" type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
                  ) : (
                    <p className="text-surface-900 dark:text-surface-100">{profile.email}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="label">Role</label>
                {editing ? (
                  <div className="flex gap-2 flex-wrap">
                    {(['student', 'developer', 'founder', 'researcher'] as const).map(r => (
                      <button
                        key={r}
                        onClick={() => setProfile(p => ({ ...p, role: r }))}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                          profile.role === r
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300'
                            : 'border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-surface-300'
                        }`}
                      >
                        {roleLabels[r]}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className="badge bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 capitalize">{profile.role}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="card p-6">
          <h2 className="font-semibold text-surface-900 dark:text-surface-100 mb-4">About</h2>
          {editing ? (
            <textarea
              className="input resize-none"
              rows={3}
              value={profile.bio}
              onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
              placeholder="Tell us about yourself..."
            />
          ) : (
            <p className="text-surface-700 dark:text-surface-300 leading-relaxed">{profile.bio}</p>
          )}
        </div>

        {/* Skills */}
        <div className="card p-6">
          <h2 className="font-semibold text-surface-900 dark:text-surface-100 mb-4">Skills & Technologies</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedSkills.map(skill => (
              <span
                key={skill}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm border ${
                  editing
                    ? 'border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-300 dark:hover:border-red-700 hover:text-red-600 dark:hover:text-red-400'
                    : 'border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-700 dark:text-surface-300'
                } transition-colors`}
                onClick={() => editing && toggleSkill(skill)}
              >
                {skill}
                {editing && <X size={12} />}
              </span>
            ))}
          </div>
          {editing && (
            <>
              <p className="text-xs text-muted mb-2">Add from common technologies:</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {allSkills.filter(s => !selectedSkills.includes(s)).map(s => (
                  <button
                    key={s}
                    onClick={() => toggleSkill(s)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border border-dashed border-surface-300 dark:border-surface-600 text-surface-500 dark:text-surface-400 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <Plus size={10} />{s}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="input flex-1"
                  placeholder="Add custom skill..."
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCustomSkill()}
                />
                <button onClick={addCustomSkill} className="btn-secondary px-3">Add</button>
              </div>
            </>
          )}
        </div>

        {/* Timeline preferences */}
        <div className="card p-6">
          <h2 className="font-semibold text-surface-900 dark:text-surface-100 mb-1">Roadmap Timeline Preference</h2>
          <p className="text-sm text-muted mb-4">How long should generated roadmaps span by default?</p>
          <div className="flex gap-2 flex-wrap">
            {timelineOptions.map(t => (
              <button
                key={t}
                disabled={!editing}
                onClick={() => setTimeline(t)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  timeline === t
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300'
                    : 'border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400'
                } ${!editing ? 'cursor-default' : 'hover:border-primary-300 cursor-pointer'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div className="card p-6 border-red-200 dark:border-red-900">
          <h2 className="font-semibold text-red-600 dark:text-red-400 mb-1">Danger zone</h2>
          <p className="text-sm text-muted mb-4">These actions are irreversible. Please be certain.</p>
          <div className="flex gap-3 flex-wrap">
            <button className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
              Delete all projects
            </button>
            <button className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
              Delete account
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
