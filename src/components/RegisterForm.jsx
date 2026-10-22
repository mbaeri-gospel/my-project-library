import { useState } from 'react';
import { supabase } from '../config/supabaseClient';

export default function RegisterForm({ onAuthSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullname: '',
    phone: '',
    country: '',
    reasonForUsing: '',
    aboutMe: ''
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create a secure login account credential profile inside Supabase Auth management
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData?.user) {
        // 2. Hydrate user metadata straight into your custom relational profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              fullname: formData.fullname,
              email: formData.email,
              phone: formData.phone,
              country: formData.country,
              reason_for_using: formData.reasonForUsing,
              about_me: formData.aboutMe,
              is_contact_public: false // Enforces private-by-default boundary rules
            }
          ]);

        if (profileError) throw profileError;

        alert('Account profile registry successful! Check your mailbox verification links.');
        if (onAuthSuccess) onAuthSuccess(authData.user);
      }
    } catch (err) {
      alert(`Registration pipeline failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 bg-white dark:bg-gray-900 p-8 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">🚀 Create Profile Account</h2>
      
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Full Professional Name</label>
          <input type="text" required className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700" value={formData.fullname} onChange={e => setFormData({...formData, fullname: e.target.value})} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Email Address</label>
            <input type="email" required className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Password Access</label>
            <input type="password" required className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Phone Contact</label>
            <input type="tel" className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Country Location</label>
            <input type="text" className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Reason for Using the Web App</label>
          <input type="text" placeholder="e.g. Build connections, track R&D projects" className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700" value={formData.reasonForUsing} onChange={e => setFormData({...formData, reasonForUsing: e.target.value})} />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">About Me Summary Box</label>
          <textarea rows="3" className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700" value={formData.aboutMe} onChange={e => setFormData({...formData, aboutMe: e.target.value})} />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition-all">
          {loading ? 'Processing Registry Operations...' : '🔒 Register Profile Asset'}
        </button>
      </form>
    </div>
  );
}
