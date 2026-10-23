import { useState } from 'react';
import { supabase } from '../config/supabaseClient';

export default function LoginForm({ onLoginSuccess, switchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;
      
      if (data?.user) {
        if (onLoginSuccess) onLoginSuccess(data.user);
      }
    } catch (err) {
      alert(`Login failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 bg-white dark:bg-gray-900 p-8 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">🔐 Welcome Back</h2>
      
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Email Address</label>
          <input 
            type="email" 
            required 
            className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Password</label>
          <input 
            type="password" 
            required 
            className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition-all cursor-pointer"
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>

      <div className="text-center mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
        <button 
          onClick={switchToRegister} 
          className="text-xs text-blue-500 hover:underline font-semibold"
        >
          New to My Project Library? Create an account instead
        </button>
      </div>
    </div>
  );
}
