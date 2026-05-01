import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from 'react-i18next';

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const { showToast } = useToast();
  const { t, i18n } = useTranslation();

  const handleLogout = async () => {
    try {
      await signOut();
      showToast('Logged out successfully', 'info');
    } catch (error) {
      showToast('Logout failed', 'error');
    }
  };

  const SettingItem = ({ icon, title, value, onPress, type = 'chevron' }: any) => (
    <TouchableOpacity style={styles.item} onPress={onPress} disabled={type === 'switch'}>
      <View style={styles.itemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
          <Ionicons name={icon} size={22} color={colors.primary} />
        </View>
        <Text style={styles.itemTitle}>{title}</Text>
      </View>
      <View style={styles.itemRight}>
        {type === 'switch' ? (
          <Switch value={value} onValueChange={onPress} trackColor={{ true: colors.primary }} />
        ) : (
          <>
            {value && <Text style={styles.itemValue}>{value}</Text>}
            <Ionicons name="chevron-forward" size={20} color={colors.border} />
          </>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <SettingItem icon="person-outline" title="Profile Details" />
        <SettingItem icon="notifications-outline" title="Notifications" type="switch" value={true} />
        <SettingItem icon="lock-closed-outline" title="Change Password" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <SettingItem 
          icon="language-outline" 
          title="Language" 
          value={i18n.language === 'ta' ? 'தமிழ்' : i18n.language === 'hi' ? 'हिन्दी' : 'English'} 
        />
        <SettingItem icon="moon-outline" title="Dark Mode" type="switch" value={false} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <SettingItem icon="help-circle-outline" title="Help Center" />
        <SettingItem icon="shield-checkmark-outline" title="Privacy Policy" />
        <SettingItem icon="information-circle-outline" title="About App" />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color={colors.error} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  section: {
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  itemTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemValue: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 20,
    paddingVertical: 16,
    marginHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FFE3E3',
  },
  logoutText: {
    ...typography.button,
    color: colors.error,
    marginLeft: 8,
  },
  versionText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
});
