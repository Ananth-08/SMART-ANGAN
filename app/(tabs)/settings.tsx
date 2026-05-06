import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';

const MOCK_CENTERS = [
  { id: '331502', name: 'Kodambakkam 3, Chennai', lat: 13.0489, lng: 80.2206 },
  { id: '331503', name: 'T. Nagar Main, Chennai', lat: 13.0382, lng: 80.2364 },
  { id: '331504', name: 'Vadapalani 1, Chennai', lat: 13.0500, lng: 80.2121 },
  { id: '999999', name: 'Demo Test Center (Always Pass)', lat: -1, lng: -1 }
];

// Helper to calculate distance in meters (Haversine formula)
function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
  var R = 6371000; // Radius of the earth in m
  var dLat = deg2rad(lat2-lat1);  
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; // Distance in m
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180);
}

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const { showToast } = useToast();
  const { t, i18n } = useTranslation();
  const { changeLanguage } = useLanguage();
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'pending' | 'verifying' | 'verified' | 'failed'>('pending');
  const [currentCoords, setCurrentCoords] = useState<{lat: number, lng: number} | null>(null);
  
  const [selectedCenter, setSelectedCenter] = useState(MOCK_CENTERS[0]);
  const [showCenterPicker, setShowCenterPicker] = useState(false);

  const verifyLocation = async () => {
    setLocationStatus('verifying');
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showToast('Permission to access location was denied', 'error');
        setLocationStatus('failed');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const currentLat = location.coords.latitude;
      const currentLng = location.coords.longitude;
      setCurrentCoords({ lat: currentLat, lng: currentLng });
      
      // Geofence verification logic
      setTimeout(() => {
        if (selectedCenter.id === '999999') {
          setLocationStatus('verified');
          showToast('Location verified for Demo Test Center.', 'success');
          return;
        }

        const distanceMeters = getDistanceFromLatLonInM(currentLat, currentLng, selectedCenter.lat, selectedCenter.lng);
        
        // 500 meter geofence tolerance for presentation purposes
        if (distanceMeters <= 500) {
          setLocationStatus('verified');
          showToast(`Verified! You are at ${selectedCenter.name}.`, 'success');
        } else {
          setLocationStatus('failed');
          Alert.alert(
            "Verification Failed", 
            `You are ${Math.round(distanceMeters)} meters away from the selected center (${selectedCenter.name}). You must be at the physical center to verify.`
          );
        }
      }, 1000);

    } catch (error) {
      setLocationStatus('failed');
      showToast('Could not fetch location', 'error');
    }
  };

  const currentLanguage = i18n.language;

  const handleLanguageChange = async (lng: string) => {
    await changeLanguage(lng);
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
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              <View style={[styles.idBadge, { marginBottom: 0 }]}>
                <Text style={styles.idText}>ID: SAT-0526</Text>
              </View>
              <TouchableOpacity onPress={() => setShowCenterPicker(true)} style={[styles.idBadge, { backgroundColor: '#E3F2FD', marginBottom: 0, flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                <Text style={[styles.idText, { color: '#1565C0' }]}>AWC: {selectedCenter.id}</Text>
                <Ionicons name="chevron-down" size={12} color="#1565C0" />
              </TouchableOpacity>
            </View>
            <View style={styles.centerBadge}>
              <Text style={styles.centerText}>{selectedCenter.name}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Geolocation Verification Card */}
      <View style={styles.syncCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Ionicons name="location" size={24} color={locationStatus === 'verified' ? '#2E7D32' : colors.primary} />
          <Text style={styles.syncTitle}>Center GPS Verification</Text>
        </View>
        
        {locationStatus === 'verified' ? (
          <View style={{ backgroundColor: '#E8F5E9', padding: 12, borderRadius: 10, marginBottom: 16 }}>
            <Text style={{ color: '#2E7D32', fontWeight: '600' }}>✓ Verified at Center</Text>
            {currentCoords && (
              <Text style={{ color: '#2E7D32', fontSize: 12, marginTop: 4 }}>
                Lat: {currentCoords.lat.toFixed(6)}, Lng: {currentCoords.lng.toFixed(6)}
              </Text>
            )}
          </View>
        ) : (
          <Text style={styles.syncDescription}>
            Supervisors require location verification before submitting today's reports.
          </Text>
        )}
        
        <TouchableOpacity 
          style={[styles.syncButton, locationStatus === 'verified' && { backgroundColor: '#F1F5F9' }]} 
          onPress={verifyLocation} 
          disabled={locationStatus === 'verifying'}
        >
          {locationStatus === 'verifying' ? (
            <MaterialCommunityIcons name="loading" size={20} color={colors.white} />
          ) : (
            <Ionicons name="scan-circle-outline" size={20} color={locationStatus === 'verified' ? colors.primary : colors.white} />
          )}
          <Text style={[styles.syncButtonText, locationStatus === 'verified' && { color: colors.primary }]}>
            {locationStatus === 'verifying' ? 'Verifying...' : locationStatus === 'verified' ? 'Update Location' : 'Verify My Location'}
          </Text>
        </TouchableOpacity>
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
        <TouchableOpacity style={styles.languageItem} onPress={() => handleLanguageChange('en')}>
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

        <TouchableOpacity style={styles.languageItem} onPress={() => handleLanguageChange('hi')}>
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
        
        <TouchableOpacity style={styles.languageItem} onPress={() => handleLanguageChange('ta')}>
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

      {/* Center Picker Modal */}
      <Modal visible={showCenterPicker} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', width: '85%', borderRadius: 16, padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 16 }}>Select Your Anganwadi</Text>
            {MOCK_CENTERS.map(c => (
              <TouchableOpacity 
                key={c.id} 
                style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                onPress={() => {
                  setSelectedCenter(c);
                  setLocationStatus('pending'); // Reset verification on center change
                  setShowCenterPicker(false);
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', color: '#0F172A' }}>{c.name}</Text>
                  <Text style={{ fontSize: 12, color: '#64748B' }}>AWC Code: {c.id}</Text>
                </View>
                {selectedCenter.id === c.id && <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={{ marginTop: 20, alignItems: 'center', padding: 12, backgroundColor: '#F1F5F9', borderRadius: 10 }} onPress={() => setShowCenterPicker(false)}>
              <Text style={{ fontWeight: '700', color: '#334155' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
