import React, { createContext, useContext, useState, ReactNode } from 'react';
import { View, StyleSheet, Image, Dimensions, Animated, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';

interface LanguageContextType {
  changeLanguage: (lng: string) => Promise<void>;
  isChangingLanguage: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  const { i18n } = useTranslation();
  const fadeAnim = useState(new Animated.Value(0))[0];

  const changeLanguage = async (lng: string) => {
    setIsChangingLanguage(true);

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    try {
      // Simulate loading for better UX (as requested)
      await new Promise(resolve => setTimeout(resolve, 1500));

      await i18n.changeLanguage(lng);
      await AsyncStorage.setItem('user-language', lng);

    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsChangingLanguage(false);
      });
    }
  };

  return (
    <LanguageContext.Provider value={{ changeLanguage, isChangingLanguage }}>
      {children}
      {isChangingLanguage && (
        <Animated.View style={[styles.loadingOverlay, { opacity: fadeAnim }]}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <ActivityIndicator size="large" color="#0A3327" style={styles.loader} />
          </View>
        </Animated.View>
      )}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
  },
  loader: {
    marginTop: 20,
  }
});
