import { useState } from 'react';
import { supabase } from '../config/supabaseClient';

export default function AddProjectForm({ userId, onProjectAdded }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Editable form fields filled by the scraper
  const [formData, setFormData] = useState({
    projectName: '',
    category: 'IT and Software Development',
    description: '',
    sampleImageUrl: '',
    uniqueWebId: ''
  });

  // Call your secure Vercel scraper endpoint
  const handleFetchMetadata = async () => {
    if (!url) return alert('Please enter a project URL first!');
    setLoading(true);

    try {
      // Replace with your real Vercel deployment endpoint domain
      const response = await fetch('https://vercel.app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl: url })
      });

      const data = await response.json();

      if (response.ok) {
        setFormData({
          projectName: data.projectName,
          category: formData.category, // keep user's category selection
          description: data.projectDescription,
          sampleImageUrl: data.sampleImageUrl,
          uniqueWebId: data.uniqueWebId
        });
      } else {
        alert(data.error || 'Failed to fetch layout tags.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to the scraper backend.');
    } finally {
      setLoading(false);
    }
  };

  // Submit the justified data directly to your secure database table
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.uniqueWebId) {
      alert('Please fetch data via link or generate an ID first!');
      return;
    }

    const { error } = await supabase.from('projects').insert([
      {
        user_id: userId,
        project_name: formData.projectName,
        category: formData.category,
        description: formData.description,
        sample_image_url: formData.sampleImageUrl,
        project_url: url,
        unique_web_id: formData.uniqueWebId
      }
    ]);

    if (!error) {
      alert('Project library catalog created successfully!');
      if (onProjectAdded) onProjectAdded();
    } else {
      alert(`Database error: ${error.message}`);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md max-w-xl mx-auto text-gray-900 dark:text-gray-100">
      <h3 className="text-xl font-bold mb-4">📚 Add to Project Library</h3>
      
      {/* URL Import Input */}
      <div className="mb-4 flex gap-2">
        <input
          type="url"
          placeholder="Paste external project link (e.g., GitHub, Behance)"
          className="flex-1 p-2 border rounded bg-gray-50 dark:bg-gray-8xl text-black dark:text-white"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          type="button"
          onClick={handleFetchMetadata}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition"
          disabled={loading}
        >
          {loading ? 'Fetching...' : '⚡ Auto-Fetch'}
        </button>
      </div>

      {/* Main Justification Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Project Name</label>
          <input
            type="text"
            required
            className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-8s"
            value={formData.projectName}
            onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Specification Category</label>
          <select
            className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-8s text-black dark:text-white"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <option>Construction and Infrastructure</option>
            <option>IT and Software Development</option>
            <option>Research and Development (R&D)</option>
            <option>Marketing and Creative</option>
            <option>Event Management</option>
            <option>Business and Organizational Change</option>
            <option>Compliance and Regulatory</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Project Summary Description</label>
          <textarea
            rows="4"
            className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-8s"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Sample Image URL</label>
          <input
            type="text"
            className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-8s"
            value={formData.sampleImageUrl}
            onChange={(e) => setFormData({ ...formData, sampleImageUrl: e.target.value })}
          />
        </div>

        {formData.uniqueWebId && (
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs tracking-wider">
            ⚙️ UNIQUE WEB ID REFERENCE: <strong className="text-blue-500">{formData.uniqueWebId}</strong>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition"
        >
          💾 Save Stand-Alone Catalog Item
        </button>
      </form>
    </div>
  );
}