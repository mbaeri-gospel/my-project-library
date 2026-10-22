import { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';

export default function PublicRecruiterView({ routeType, targetId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPublicData() {
      setLoading(true);
      if (routeType === 'profile') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('fullname, country, about_me, reason_for_using, email, phone, is_contact_public')
          .eq('id', targetId)
          .single();
        setData(profile);
      } else if (routeType === 'project') {
        const { data: project } = await supabase
          .from('projects')
          .select('project_name, category, description, sample_image_url, project_url, unique_web_id')
          .eq('unique_web_id', targetId)
          .single();
        setData(project);
      }
      setLoading(false);
    }
    fetchPublicData();
  }, [routeType, targetId]);

  if (loading) return <div className="text-center mt-20 font-mono animate-pulse">Loading Public Project Asset...</div>;
  if (!data) return <div className="text-center mt-20 text-red-500 font-bold">⚠️ Requested catalog file or profile could not be found.</div>;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-gray-950 py-12 px-4 text-slate-900 dark:text-gray-100 transition-colors">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
        
        {/* Render logic for shared profile view */}
        {routeType === 'profile' ? (
          <div>
            <div className="w-20 h-20 rounded-full bg-blue-600 text-white font-black text-2xl flex items-center justify-center shadow-md mb-4 mx-auto">
              {data.fullname.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-2xl font-black text-center mb-1">{data.fullname}</h2>
            <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">{data.country || 'Verified User'}</p>
            
            <div className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-500">Professional Overview</h4>
                <p className="text-sm mt-1 leading-relaxed text-gray-600 dark:text-gray-300">{data.about_me || 'No professional overview details populated yet.'}</p>
              </div>

              {/* Strict profile isolation rules */}
              <div className="bg-slate-50 dark:bg-gray-850 p-4 rounded-xl border border-gray-200 dark:border-gray-700/60 mt-4">
                <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-2">📬 Direct Connection Channels</h4>
                {data.is_contact_public ? (
                  <div className="text-sm space-y-1 font-medium">
                    <p>📧 Email: <a href={`mailto:${data.email}`} className="text-blue-500 hover:underline">{data.email}</a></p>
                    {data.phone && <p>📞 Phone Contact: <span className="text-emerald-500">{data.phone}</span></p>}
                  </div>
                ) : (
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium italic">🔒 The owner has kept their personal phone number and email address hidden. Click the return link below to look for public source attachments.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Render logic for shared individual catalog items */
          <div>
            {data.sample_image_url && (
              <img src={data.sample_image_url} alt="" className="w-full h-56 object-cover rounded-xl mb-4 bg-slate-100 dark:bg-gray-800" />
            )}
            <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">
              {data.category}
            </span>
            <h2 className="text-2xl font-black mt-2 mb-4 leading-tight">{data.project_name}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{data.description}</p>
            
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs text-gray-400">
              <span>Catalog Reference: <strong>{data.unique_web_id}</strong></span>
              {data.project_url && (
                <a href={data.project_url} target="_blank" rel="noreferrer" className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-blue-700 transition">Visit Verified Source ↗</a>
              )}
            </div>
          </div>
        )}

        <div className="text-center mt-8 border-t border-gray-100 dark:border-gray-800 pt-4">
          <button onClick={() => window.location.hash = ''} className="text-xs font-semibold text-blue-500 hover:underline">
            ← Return to "My Project Library" Portal Gateway
          </button>
        </div>
      </div>
    </div>
  );
}
