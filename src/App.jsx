import { useState, useEffect } from 'react';
import { supabase } from './config/supabaseClient';
import RegisterForm from './components/RegisterForm';
import Dashboard from './views/Dashboard';
import PublicRecruiterView from './views/PublicRecruiterView';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [publicRoute, setPublicRoute] = useState({ type: null, id: null });

  useEffect(() => {
    // 1. Check for an active user session immediately on application load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Set up a listener for real-time authentication state updates (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // 3. Simple hash-routing parser to isolate shared links without breaking GitHub Pages
    const parseHashRoute = () => {
      const hash = window.location.hash;
      if (hash.includes('?id=')) {
        const type = hash.includes('#/user') ? 'profile' : hash.includes('#/catalog') ? 'project' : null;
        const urlParams = new URLSearchParams(hash.split('?')[1]);
        const id = urlParams.get('id');
        if (type && id) {
          setPublicRoute({ type, id });
          return;
        }
      }
      setPublicRoute({ type: null, id: null });
    };

    window.addEventListener('hashchange', parseHashRoute);
    parseHashRoute(); // Execute routing logic on initialization

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('hashchange', parseHashRoute);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950">
        <div className="text-sm font-bold tracking-widest uppercase animate-pulse text-blue-600">
          Verifying Encrypted Session...
        </div>
      </div>
    );
  }

  // Route to the Recruiter view if a valid shared layout link is processed
  if (publicRoute.type) {
    return <PublicRecruiterView routeType={publicRoute.type} targetId={publicRoute.id} />;
  }

  // Route to either the private Dashboard view or the Registration prompt based on session status
  return (
    <>
      {session ? (
        <Dashboard user={session.user} />
      ) : (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-950 py-12 px-4">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-black text-blue-600 dark:text-blue-400">🗂️ My Project Library</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Deploy, catalog, and share multi-specification projects.</p>
          </div>
          <RegisterForm onAuthSuccess={(user) => console.log('Authenticated user context setup:', user.id)} />
        </div>
      )}
    </>
  );
}
