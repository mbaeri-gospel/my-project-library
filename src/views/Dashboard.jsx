import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabaseClient';
import AddProjectForm from '../components/AddProjectForm';
import ThemeToggle from '../components/ThemeToggle';
import LanguageSelector from '../components/LanguageSelector';
import ProjectShareLink from '../components/ProjectShareLink';

export default function Dashboard({ user }) {
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);

  const categories = [
    'All',
    'Construction and Infrastructure',
    'IT and Software Development',
    'Research and Development (R&D)',
    'Marketing and Creative',
    'Event Management',
    'Business and Organizational Change',
    'Compliance and Regulatory'
  ];

  const fetchUserProjects = useCallback(async () => {
    const { data } = await supabase.from('projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) setProjects(data);
  }, [user.id]);

  useEffect(() => {
    let active = true;

    const loadDashboardData = async () => {
      const [profileResult, projectsResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      ]);

      if (!active) return;
      if (profileResult.data) setProfile(profileResult.data);
      if (projectsResult.data) setProjects(projectsResult.data);
    };

    loadDashboardData();
    return () => {
      active = false;
    };
  }, [user.id]);

  const handleContactPrivacyToggle = async () => {
    const updatedState = !profile.is_contact_public;
    const { error } = await supabase.from('profiles').update({ is_contact_public: updatedState }).eq('id', user.id);
    if (!error) setProfile({ ...profile, is_contact_public: updatedState });
  };

  const filteredProjects = activeCategoryFilter === 'All' 
    ? projects 
    : projects.filter(p => p.category === activeCategoryFilter);

  if (!profile) return <div className="text-center mt-20 text-lg font-medium animate-pulse">Synchronizing Secure Workspace...</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 transition-colors duration-300">
      
      {/* Control Navigation Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-2xl font-black tracking-tight text-blue-600 dark:text-blue-400">🗂️ My Project Library</h1>
        <div className="flex items-center gap-4">
          <LanguageSelector />
          <ThemeToggle />
          <button onClick={() => supabase.auth.signOut()} className="text-sm font-semibold text-red-500 hover:text-red-600 border border-red-500/20 px-3 py-1.5 rounded-lg transition">Sign Out</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side: Owner Profile Column View */}
        <section className="lg:col-span-1 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 self-start">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-black text-3xl flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-md">
              {profile.fullname.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold mt-4 text-gray-900 dark:text-white">{profile.fullname}</h2>
            <span className="text-xs font-semibold bg-slate-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-1 rounded mt-1">{profile.country || 'Global Citizen'}</span>
          </div>

          <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-4 space-y-4">
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">About Me</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">{profile.about_me || 'No professional overview details populated yet.'}</p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Intent Metric</h4>
              <p className="text-sm text-gray-500 italic mt-0.5">"{profile.reason_for_using}"</p>
            </div>

            {/* Granular Public Privacy Control Module */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase">Contact Exposure</span>
                <button 
                  onClick={handleContactPrivacyToggle} 
                  className={`text-xs px-2.5 py-1 rounded-full font-bold shadow-sm transition-all ${profile.is_contact_public ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}
                >
                  {profile.is_contact_public ? '🌐 Public Connected' : '🔒 Private Masked'}
                </button>
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5 leading-snug">When masked, your phone numbers and emails are hidden away from other public visitors unless explicitly shared.</p>
            </div>
            
            <div className="pt-2">
              <ProjectShareLink uniqueWebId={user.id} itemType="profile" />
            </div>
          </div>
        </section>

        {/* Right Side: Multi-Catalog Project Portfolio Space */}
        <section className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4 bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
            
            {/* Functional Category Filter Segment */}
            <div className="flex flex-wrap gap-1.5">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeCategoryFilter === cat ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-700 dark:text-slate-300'}`}
                >
                  {cat === 'All' ? '📂 All Clusters' : cat}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm px-4 py-2 rounded-xl transition shadow-md flex items-center gap-1.5"
            >
              {showAddForm ? '❌ Close Panel' : '➕ Add Stand-Alone Catalog'}
            </button>
          </div>

          {showAddForm && (
            <div className="p-4 bg-slate-100 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 animate-fadeIn">
              <AddProjectForm userId={user.id} onProjectAdded={() => { fetchUserProjects(); setShowAddForm(false); }} />
            </div>
          )}

          {/* Dynamic Portfolio Item Display Engine */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProjects.length === 0 ? (
              <div className="col-span-full py-16 text-center text-gray-400 font-medium border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                No indexed project artifacts located matching the active selection.
              </div>
            ) : (
              filteredProjects.map(project => (
                <div key={project.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm project-card-glow flex flex-col justify-between">
                  <div>
                    {project.sample_image_url && (
                      <img src={project.sample_image_url} alt="" className="w-full h-40 object-cover rounded-xl mb-4 bg-slate-100 dark:bg-gray-800" onError={(e) => e.target.style.display='none'} />
                    )}
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded">
                      {project.category}
                    </span>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mt-1.5 leading-tight">{project.project_name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-3 leading-relaxed">{project.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-50 dark:border-gray-800/60 flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[10px] font-mono tracking-tight text-gray-400">ID: {project.unique_web_id}</span>
                    <div className="flex gap-2">
                      {project.project_url && (
                        <a href={project.project_url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center py-1">Visit Source ↗</a>
                      )}
                      <ProjectShareLink uniqueWebId={project.unique_web_id} itemType="catalog" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
