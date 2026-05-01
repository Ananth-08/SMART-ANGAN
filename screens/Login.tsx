import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const { width } = Dimensions.get('window');

const Login = () => {
  const router = useRouter();
  const { signIn, signInAsParent } = useAuth();
  const { showToast } = useToast();
  const { t, i18n } = useTranslation();
  
  const [isParentMode, setIsParentMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (isParentMode) {
      if (!mobile) {
        showToast('Please enter your mobile number', 'error');
        return;
      }
      setIsLoading(true);
      try {
        await signInAsParent(mobile);
        showToast('Parent Login Successful!', 'success');
        router.replace('/(tabs)');
      } catch (error: any) {
        showToast(error.message || 'Login Failed', 'error');
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
      }
      setIsLoading(true);
      try {
        await signIn(email, password);
        showToast('Staff Login Successful!', 'success');
        router.replace('/(tabs)');
      } catch (error: any) {
        showToast(error.message || 'Login Failed', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleLanguage = async () => {
    let newLng = i18n.language === 'en' ? 'ta' : i18n.language === 'ta' ? 'hi' : 'en';
    await i18n.changeLanguage(newLng);
    await AsyncStorage.setItem('user-language', newLng);
  };

  const getLanguageLabel = () => {
    switch (i18n.language) {
      case 'en': return 'தமிழ்';
      case 'ta': return 'हिन्दी';
      case 'hi': return 'English';
      default: return 'தமிழ்';
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.langButton} onPress={toggleLanguage}>
            <Ionicons name="language" size={20} color={colors.primary} />
            <Text style={styles.langText}>{getLanguageLabel()}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>{isParentMode ? 'Parent Portal' : t('login.title')}</Text>
          <Text style={styles.subtitle}>
            {isParentMode ? 'Access your child\'s health and attendance records' : t('login.subtitle')}
          </Text>
        </View>

        <View style={styles.form}>
          {isParentMode ? (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mobile Number</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter registered mobile number"
                  placeholderTextColor={colors.textSecondary}
                  value={mobile}
                  onChangeText={setMobile}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
            </View>
          ) : (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('common.email')}</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter username"
                    placeholderTextColor={colors.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('common.password')}</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter password"
                    placeholderTextColor={colors.textSecondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.loginButtonText}>{t('common.login')}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.modeSwitcher}>
            <Text style={styles.modeText}>{isParentMode ? 'Are you a Staff Member?' : 'Are you a Parent?'}</Text>
            <TouchableOpacity onPress={() => setIsParentMode(!isParentMode)}>
              <Text style={styles.modeLink}>{isParentMode ? 'Login as Staff' : 'Login as Parent'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 60,
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  langText: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 6,
    fontWeight: '700',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 8,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#0A3327',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#0A3327',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '800',
  },
  modeSwitcher: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    gap: 8,
  },
  modeText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  modeLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '800',
  },
});

export default Login;
