import { useLanguage } from '../contexts/LanguageContext';

/**
 * Custom hook for accessing translations and language settings.
 * 
 * @example
 * const { t, language, setLanguage } = useTranslation();
 * 
 * // Use translated text
 * <p>{t('profile.loading')}</p>
 * 
 * // Switch language
 * <button onClick={() => setLanguage('es')}>Spanish</button>
 */
export function useTranslation() {
    return useLanguage();
}
