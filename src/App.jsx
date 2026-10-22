import { useState, useEffect } from 'react';
import { supabase } from './config/supabaseClient';
import ThemeToggle from './components/ThemeToggle';
import LanguageSelector from './components/LanguageSelector';
import AddProjectForm from './components/AddProjectForm';

export default function App() {
  const [sharedItem, setSharedItem] = useState(null);
  const [loadingShared, setLoadingShared] = useState(false);

  // --- SHARE LINK DETECTION HOOK ---
  useEffect(() => {
    const handleUrlRoute = async () => {
      const currentHash = window.location.hash; // e.g., #/catalog?id=PROJ-XXXXX

      if (currentHash.includes('?id=')) {
        const urlParams = new URLSearchParams(currentHash.split('?')[1]);
        const targetId = urlParams.get('id');

        if (targetId) {
          setLoadingShared(true);
          try {
            // Query Supabase for the project matching the unique web reference code
            const { data, error } = await supabase
              .from('projects')
              .select('*, profiles(fullname, about_me, avatar_url, is_contact_public, email, phone)')
              .eq('unique_web_id', targetId)
              .single();

            if (data) {
              setSharedItem(data);
            } else {
              console.error('Shared item not found:', error);
            }
          } catch (err) {
            console.error('Error fetching shared record:', err);
          } finally {
            setLoadingShared(false);
          }
        }
      }
    };

    window.addEventListener('hashchange', handleUrlRoute);
    handleUrlRoute(); // Run immediately on page load

    return () => window.removeEventListener('hashchange', handleUrlRoute);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-6 transition-colors">
      {/* Top Header Layout */}
      <header className="flex justify-between items-center mb-8 max-w-4xl mx-auto border-b pb-4 border-gray-200 dark:border-gray-800">
        <h1 className="text-2xl font-black">📚 My Project Library</h1>
        <div className="flex items-center gap-4">
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto">
        {loadingShared ? (
          <div className="text-center py-12 font-medium">Loading shared catalog record...</div>
        ) : sharedItem ? (
          /* VIEWED WHEN SOMEONE OPENS A SHARED LINK */
          <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
            <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2.5 py-1 rounded-full font-semibold">
              Shared Catalog Record
            </span>
            <h2 className="text-3xl font-bold mt-4">{sharedItem.project_name}</h2>
            <p className="text-sm text-gray-500 mt-1">Category: {sharedItem.category}</p>
            
            {sharedItem.sample_image_url && (
              <img 
                src={sharedItem.sample_image_url} 
                alt={sharedItem.project_name} 
                className="w-full h-64 object-cover rounded-lg my-4" 
              />
            )}
            
            <p className="text-base leading-relaxed mt-4">{sharedItem.description}</p>
            
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400">Unique Reference ID:</p>
                <p className="font-mono text-sm text-blue-600">{sharedItem.unique_web_id}</p>
              </div>
              <button 
                onClick={() => { setSharedItem(null); window.location.hash = ''; }} 
                className="text-sm bg-gray-200 dark:bg-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-700 transition"
              >
                Back to Main Workspace
              </button>
            </div>
          </div>
        ) : (
          /* DEFAULT DASHBOARD VIEW */
          <div>
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-extrabold">Welcome to Your Workspace</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage your structured project library, sync records via external links, and showcase your professional journey.
              </p>
            </div>
            
            {/* Form to add new items */}
            <AddProjectForm userId="YOUR_USER_UUID_HERE" />
          </div>
        )}
      </main>
    </div>
  );
}