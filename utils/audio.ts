import * as Speech from 'expo-speech';
import i18next from 'i18next';

export const speakInstruction = (textKey: string) => {
  const currentLanguage = i18next.language || 'en';
  
  // Provide a fallback in case the translation key is missing
  const text = i18next.t(textKey, { defaultValue: '' });
  if (!text) return;

  // Map app languages to BCP-47 language codes
  let languageCode = 'en-US';
  if (currentLanguage === 'ta') {
    languageCode = 'ta-IN';
  } else if (currentLanguage === 'hi') {
    languageCode = 'hi-IN';
  }

  // Stop any currently playing speech to avoid overlap
  Speech.stop();
  
  Speech.speak(text, {
    language: languageCode,
    rate: 0.85, // Slightly slower for clarity
    pitch: 1.0,
  });
};

export const stopSpeech = () => {
  Speech.stop();
};
