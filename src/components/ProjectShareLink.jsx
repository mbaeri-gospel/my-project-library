import { useState } from 'react';

export default function ProjectShareLink({ uniqueWebId, itemType = 'project' }) {
  const [copied, setCopied] = useState(false);

  // Safely construct dynamic asset endpoints for deployment pipelines
  const generateShareUrl = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    // Uses structural URL fragments to guarantee 404 safety on GitHub Pages
    return `${baseUrl}#/${itemType === 'profile' ? 'user' : 'catalog'}?id=${uniqueWebId}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(generateShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500); // resets confirmation tag state
    } catch (err) {
      console.error('Could not copy link text', err);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <button
        onClick={handleCopyLink}
        className="text-xs bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-md font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 transition flex items-center gap-1.5"
      >
        {copied ? '✅ Copied Reference URL!' : '🔗 Share Catalog Link'}
      </button>
    </div>
  );
}