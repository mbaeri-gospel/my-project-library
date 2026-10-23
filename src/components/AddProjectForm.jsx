import { useState } from 'react';
import { supabase } from '../config/supabaseClient';

const SCRAPER_URL = import.meta.env.VITE_SCRAPER_URL?.replace(/\/$/, '');

const defaultFormData = {
  projectName: '',
  category: 'IT and Software Development',
  description: '',
  sampleImageUrl: '',
  uniqueWebId: ''
};

export default function AddProjectForm({ userId, onProjectAdded }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);

  const updateFormField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFetchMetadata = async () => {
    if (!url.trim()) {
      alert('Please enter a project URL first.');
      return;
    }

    if (!SCRAPER_URL) {
      alert('Scraper URL is not configured. Set VITE_SCRAPER_URL in your environment.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(SCRAPER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl: url.trim() })
      });

      const contentType = response.headers.get('content-type') || '';
      const data =
        contentType.includes('application/json') ? await response.json() : null;

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to fetch metadata.');
      }

      setFormData((prev) => ({
        ...prev,
        projectName: data.projectName || prev.projectName,
        category: prev.category || 'IT and Software Development',
        description: data.projectDescription || prev.description,
        sampleImageUrl: data.sampleImageUrl || prev.sampleImageUrl,
        uniqueWebId: data.uniqueWebId || prev.uniqueWebId
      }));
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error connecting to the scraper backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      alert('User is not available.');
      return;
    }

    if (!formData.uniqueWebId) {
      alert('Please fetch data via link or generate an ID first.');
      return;
    }

    if (!formData.projectName.trim()) {
      alert('Project name is required.');
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase.from('projects').insert([
        {
          user_id: userId,
          project_name: formData.projectName.trim(),
          category: formData.category,
          description: formData.description.trim(),
          sample_image_url: formData.sampleImageUrl?.trim() || '',
          project_url: url.trim(),
          unique_web_id: formData.uniqueWebId
        }
      ]);

      if (error) throw error;

      alert('Project library catalog created successfully!');
      setFormData(defaultFormData);
      setUrl('');
      if (onProjectAdded) onProjectAdded();
    } catch (err) {
      console.error(err);
      alert(`Database error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md max-w-xl mx-auto text-gray-900 dark:text-gray-100">
      <h3 className="text-xl font-bold mb-4">📚 Add to Project Library</h3>

      <div className="mb-4 flex gap-2">
        <input
          type="url"
          placeholder="Paste external project link (e.g., GitHub, Behance)"
          className="flex-1 p-2 border rounded bg-gray-50 dark:bg-gray-800 text-black dark:text-white"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          type="button"
          onClick={handleFetchMetadata}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Fetching...' : '⚡ Auto-Fetch'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Project Name</label>
          <input
            type="text"
            required
            className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-800"
            value={formData.projectName}
            onChange={(e) => updateFormField('projectName', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Specification Category</label>
          <select
            className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-800 text-black dark:text-white"
            value={formData.category}
            onChange={(e) => updateFormField('category', e.target.value)}
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
            className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-800"
            value={formData.description}
            onChange={(e) => updateFormField('description', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Sample Image URL</label>
          <input
            type="text"
            className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-800"
            value={formData.sampleImageUrl}
            onChange={(e) => updateFormField('sampleImageUrl', e.target.value)}
          />
        </div>

        {formData.uniqueWebId && (
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs tracking-wider">
            ⚙️ UNIQUE WEB ID REFERENCE:{' '}
            <strong className="text-blue-500">{formData.uniqueWebId}</strong>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition disabled:opacity-60"
        >
          {submitting ? 'Saving...' : '💾 Save Stand-Alone Catalog Item'}
        </button>
      </form>
    </div>
  );
}