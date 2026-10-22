import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Quick translation initialization configuration
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: { welcome: "Welcome to Project Library", add_project: "Add New Project" } },
      fr: { translation: { welcome: "Bienvenue à la bibliothèque de projets", add_project: "Ajouter un nouveau projet" } },
      es: { translation: { welcome: "Bienvenido a la biblioteca de proyectos", add_project: "Agregar nuevo proyecto" } }
    },
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });

export default function LanguageSelector() {
  const { t } = useTranslation();

  const changeLanguage = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">🌐 {t('welcome')}</span>
      <select 
        onChange={changeLanguage} 
        defaultValue={i18n.language}
        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-sm text-black dark:text-white"
      >
        <option value="en">English</option>
        <option value="fr">Français (French)</option>
        <option value="es">Español (Spanish)</option>
      </select>
    </div>
  );
}
