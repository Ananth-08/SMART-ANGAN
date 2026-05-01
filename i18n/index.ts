import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import en from './en.json';
import hi from './hi.json';
import ta from './ta.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  ta: { translation: ta },
};

const LANGUAGE_KEY = 'user-language';

// Initialize i18n synchronously first
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false, // Prevents issues during SSR/Initial load
    },
  });

// Async function to load saved language
export const loadSavedLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (savedLanguage) {
      await i18n.changeLanguage(savedLanguage);
    } else {
      const locales = Localization.getLocales();
      const deviceLanguage = locales[0]?.languageCode === 'ta' ? 'ta' : (locales[0]?.languageCode || 'en');
      await i18n.changeLanguage(deviceLanguage);
    }
  } catch (error) {
    console.log('Error loading language:', error);
  }
};

export default i18n;
