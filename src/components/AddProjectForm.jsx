import { useState } from 'react';
import { supabase } from '../config/supabaseClient';

const SCRAPER_URL = import.meta.env.VITE_SCRAPER_URL?.replace(/\/$/, '');

const createDefaultFormData = () => ({
  projectName: '',
  category: 'IT and Software Development',
  description: '',
  sampleImageUrl: '',
  uniqueWebId: ''
});

const inputClass =
  'w-full p-2 border rounded bg-gray-50 dark:bg-gray-800 text-black dark:text-white';

const normalizeUrl = (value) => {
  const trimmed = value?.trim();

  if (!trimmed) return '';

  try {
    const parsed = new URL(trimmed);
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.toString() : '';
  } catch {
    return '';
  }
};

const slugify = (value) => {
  const cleaned = String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

  return cleaned || 'project';
};

const generateUniqueWebId = (projectName, targetUrl) => {
  const baseSource = projectName?.trim() || targetUrl || 'project';
  const base = slugify(baseSource);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
};

export default function AddProjectForm({ userId, onProjectAdded }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState(createDefaultFormData);

  const resetForm = () => {
    setFormData(createDefaultFormData());
    setUrl('');
  };

  const updateFormField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerateUniqueWebId = () => {
    const trimmedUrl = url.trim();
    const projectName = formData.projectName.trim();

    if (!trimmedUrl && !projectName) {
      setMessage({
        type: 'error',
        text: 'Enter a project name or URL before generating a unique ID.'
      });
      return;
    }

    const generated = generateUniqueWebId(projectName || trimmedUrl, trimmedUrl);
    updateFormField('uniqueWebId', generated);
    setMessage({ type: 'success', text: `Generated unique ID: ${generated}` });
  };

  const handleFetchMetadata = async () => {
    const trimmedUrl = url.trim();
    const validUrl = normalizeUrl(trimmedUrl);

    if (!trimmedUrl) {
      setMessage({ type: 'error', text: 'Please enter a project URL first.' });
      return;
    }

    if (!validUrl) {
      setMessage({
        type: 'error',
        text: 'Please enter a valid HTTP or HTTPS project URL.'
      });
      return;
    }

    if (!SCRAPER_URL) {
      setMessage({
        type: 'error',
        text: 'Scraper URL is not configured. Set VITE_SCRAPER_URL in your environment.'
      });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      const response = await fetch(SCRAPER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl: validUrl })
      });

      const contentType = response.headers.get('content-type') || '';
      let data = null;

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || 'Unexpected scraper response.');
      }

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to fetch metadata.');
      }

      setFormData((prev) => {
        const nextProjectName = data?.projectName?.trim() || prev.projectName || '';

        return {
          ...prev,
          projectName: nextProjectName,
          category: prev.category || 'IT and Software Development',
          description: data?.projectDescription?.trim() || prev.description,
          sampleImageUrl: data?.sampleImageUrl?.trim() || prev.sampleImageUrl,
          uniqueWebId:
            data?.uniqueWebId?.trim() ||
            prev.uniqueWebId ||
            generateUniqueWebId(nextProjectName || validUrl, validUrl)
        };
      });

      setMessage({ type: 'success', text: 'Project metadata fetched successfully.' });
    } catch (err) {
      console.error(err);
      setMessage({
        type: 'error',
        text: err.message || 'Error connecting to the scraper backend.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedUrl = url.trim();
    const validUrl = normalizeUrl(trimmedUrl);
    const projectName = formData.projectName.trim();

    if (!userId) {
      setMessage({ type: 'error', text: 'User is not available.' });
      return;
    }

    if (!validUrl) {
      setMessage({ type: 'error', text: 'Please enter a valid project URL.' });
      return;
    }

    if (!formData.uniqueWebId) {
      setMessage({
        type: 'error',
        text: 'Please fetch data via link or generate an ID first.'
      });
      return;
    }

    if (!projectName) {
      setMessage({ type: 'error', text: 'Project name is required.' });
      return;
    }

    try {
      setSubmitting(true);
      setMessage({ type: '', text: '' });

      const { error } = await supabase.from('projects').insert([
        {
          user_id: userId,
          project_name: projectName,
          category: formData.category,
          description: formData.description.trim(),
          sample_image_url: formData.sampleImageUrl?.trim() || '',
          project_url: validUrl,
          unique_web_id: formData.uniqueWebId
        }
      ]);

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Project library catalog created successfully!'
      });

      resetForm();
      if (onProjectAdded) onProjectAdded();
    } catch (err) {
      console.error(err);
      setMessage({
        type: 'error',
        text: `Database error: ${err.message}`
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md max-w-xl mx-auto text-gray-900 dark:text-gray-100">
      <h3 className="text-xl font-bold mb-4">📚 Add to Project Library</h3>

      {message.text && (
        <div
          className={`mb-4 p-3 rounded text-sm ${
            message.type === 'error'
              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200'
              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="mb-4 flex gap-2">
        <input
          type="url"
          placeholder="Paste external project link (e.g., GitHub, Behance)"
          className={`${inputClass} flex-1`}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          type="button"
          onClick={handleFetchMetadata}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition disabled:opacity-60"
          disabled={loading || !url.trim()}
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
            className={inputClass}
            value={formData.projectName}
            onChange={(e) => updateFormField('projectName', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Specification Category</label>
          <select
            className={inputClass}
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
            className={inputClass}
            value={formData.description}
            onChange={(e) => updateFormField('description', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Sample Image URL</label>
          <input
            type="text"
            className={inputClass}
            value={formData.sampleImageUrl}
            onChange={(e) => updateFormField('sampleImageUrl', e.target.value)}
          />
        </div>

        <div className="flex gap-2 items-center">
          <button
            type="button"
            onClick={handleGenerateUniqueWebId}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm font-medium transition"
          >
            Generate ID
          </button>

          {formData.uniqueWebId && (
            <div className="flex-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs tracking-wider break-all">
              ⚙️ UNIQUE WEB ID REFERENCE:{' '}
              <strong className="text-blue-500">{formData.uniqueWebId}</strong>
            </div>
          )}
        </div>

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
