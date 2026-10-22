import React from 'react';
import { useTranslation } from 'react-i18next';
import './i18n'; // Import the i18n configuration so it runs when the app starts

export default function LanguageSelector() {
  const { i18n: i18nInstance } = useTranslation();

  const changeLanguage = (event) => {
    i18nInstance.changeLanguage(event.target.value);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">🌐 Language:</span>
      <select 
        onChange={changeLanguage} 
        value={i18nInstance.language || 'en'} 
        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-sm text-black dark:text-white"
      >
        <option value="en">English</option>
        <option value="fr">Français (French)</option>
        <option value="es">Español (Spanish)</option>
      </select>
    </div>
  );
}