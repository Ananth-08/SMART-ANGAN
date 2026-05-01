import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const { showToast } = useToast();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);

  const currentLanguage = i18n.language;

  const changeLanguage = async (lng: string) => {
    await i18n.changeLanguage(lng);
    await AsyncStorage.setItem('user-language', lng);
    const langLabel = lng === 'en' ? 'English' : lng === 'hi' ? 'Hindi' : 'Tamil';
    showToast(`Language changed to ${langLabel}`, 'success');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      showToast('Logged out successfully', 'info');
    } catch (error) {
      showToast('Logout failed', 'error');
    }
  };

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      showToast('Pi Hub Database synced successfully', 'success');
    }, 2000);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color={colors.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.roleText}>Primary Staff</Text>
            <Text style={styles.nameText}>Ananth M</Text>
            <View style={styles.idBadge}>
              <Text style={styles.idText}>ID: SAT-0526-0001</Text>
            </View>
            <View style={styles.centerBadge}>
              <Text style={styles.centerText}>Center: Kodambakkam 3</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Pi Hub Sync Card */}
      <View style={styles.syncCard}>
        <Text style={styles.syncDescription}>
          the cloud was not sync
        </Text>
        <TouchableOpacity style={styles.syncButton} onPress={handleSync} disabled={syncing}>
          <MaterialCommunityIcons name="swap-horizontal" size={20} color={colors.white} />
          <Text style={styles.syncButtonText}>{syncing ? 'Syncing...' : t('settings.sync_now')}</Text>
        </TouchableOpacity>
      </View>

      {/* Localization Section */}
      <Text style={styles.sectionLabel}>{t('settings.localization')}</Text>
      <View style={styles.optionsCard}>
        <TouchableOpacity style={styles.languageItem} onPress={() => changeLanguage('en')}>
          <View style={styles.optionLeft}>
            <Ionicons name="globe-outline" size={24} color={colors.textSecondary} />
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>English</Text>
              <Text style={styles.optionSubtitle}>Default language</Text>
            </View>
          </View>
          <Ionicons 
            name={currentLanguage === 'en' ? "radio-button-on" : "radio-button-off"} 
            size={24} 
            color={currentLanguage === 'en' ? colors.primary : colors.border} 
          />
        </TouchableOpacity>
        
        <View style={styles.divider} />

        <TouchableOpacity style={styles.languageItem} onPress={() => changeLanguage('hi')}>
          <View style={styles.optionLeft}>
            <MaterialCommunityIcons name="translate" size={24} color={colors.textSecondary} />
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Hindi (हिन्दी)</Text>
              <Text style={styles.optionSubtitle}>वैकल्पिक भाषा</Text>
            </View>
          </View>
          <Ionicons 
            name={currentLanguage === 'hi' ? "radio-button-on" : "radio-button-off"} 
            size={24} 
            color={currentLanguage === 'hi' ? colors.primary : colors.border} 
          />
        </TouchableOpacity>
        
        <View style={styles.divider} />
        
        <TouchableOpacity style={styles.languageItem} onPress={() => changeLanguage('ta')}>
          <View style={styles.optionLeft}>
            <MaterialCommunityIcons name="translate" size={24} color={colors.textSecondary} />
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Tamil (தமிழ்)</Text>
              <Text style={styles.optionSubtitle}>மாற்று மொழி</Text>
            </View>
          </View>
          <Ionicons 
            name={currentLanguage === 'ta' ? "radio-button-on" : "radio-button-off"} 
            size={24} 
            color={currentLanguage === 'ta' ? colors.primary : colors.border} 
          />
        </TouchableOpacity>
      </View>

      {/* Support Section */}
      <Text style={styles.sectionLabel}>{t('settings.support')}</Text>
      <View style={styles.optionsCard}>
        <TouchableOpacity style={styles.supportItem} onPress={() => router.push('/support/help')}>
          <View style={styles.optionLeft}>
            <Ionicons name="help-circle-outline" size={24} color={colors.text} />
            <Text style={styles.supportTitle}>{t('settings.help')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.supportItem} onPress={() => router.push('/support/tech-support')}>
          <View style={styles.optionLeft}>
            <Ionicons name="headset-outline" size={24} color={colors.text} />
            <Text style={styles.supportTitle}>{t('settings.tech_support')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.supportItem} onPress={() => router.push('/support/privacy')}>
          <View style={styles.optionLeft}>
            <Ionicons name="document-text-outline" size={24} color={colors.text} />
            <Text style={styles.supportTitle}>{t('settings.privacy')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialCommunityIcons name="logout" size={22} color={colors.error} />
        <Text style={styles.logoutText}>{t('settings.logout')}</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.versionText}>App Version 2.4.1 (Stable)</Text>
        <Text style={styles.builtWithText}>Built with care for Rural Health</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FB',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  roleText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 2,
  },
  nameText: {
    ...typography.h3,
    color: colors.text,
    fontSize: 20,
    marginBottom: 8,
  },
  idBadge: {
    backgroundColor: '#DCEDC8',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  idText: {
    ...typography.caption,
    color: '#33691E',
    fontWeight: '700',
  },
  centerBadge: {
    backgroundColor: '#EEEEEE',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  centerText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  syncCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  syncHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  syncTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncTitle: {
    ...typography.h3,
    fontSize: 18,
    color: colors.text,
    marginLeft: 8,
  },
  lastSyncText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  syncDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  syncButton: {
    backgroundColor: '#0A3327',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
  },
  syncButtonText: {
    ...typography.button,
    color: colors.white,
    marginLeft: 8,
    fontSize: 16,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  optionsCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionTextContainer: {
    marginLeft: 16,
  },
  optionTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text,
  },
  optionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  supportTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginHorizontal: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFEBEE',
    backgroundColor: '#FFFBFC',
    marginTop: 8,
    marginBottom: 24,
  },
  logoutText: {
    ...typography.button,
    color: colors.error,
    marginLeft: 10,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  versionText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  builtWithText: {
    ...typography.caption,
    color: '#BDC3C7',
    marginTop: 4,
  },
});
