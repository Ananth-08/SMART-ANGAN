import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Data Protection</Text>
        <Text style={styles.paragraph}>
          We take the privacy of our students and staff very seriously. All data collected in SmartAngan is stored locally on your device and encrypted.
        </Text>

        <Text style={styles.title}>Collection of Information</Text>
        <Text style={styles.paragraph}>
          SmartAngan collects student registration details, including names, dates of birth, and guardian contact information, strictly for the purpose of maintaining accurate educational records and managing attendance.
        </Text>

        <Text style={styles.title}>Data Sharing</Text>
        <Text style={styles.paragraph}>
          Your data is only synced with the authorized Pi Hub server managed by the Anganwadi administration. We do not sell or share your data with any third-party organizations.
        </Text>

        <Text style={styles.title}>Permissions</Text>
        <Text style={styles.paragraph}>
          The app requires camera access solely for scanning student QR codes during attendance marking. Storage access is required for saving student profile images.
        </Text>

        <Text style={styles.footerText}>Last updated: May 2026</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 15,
    paddingBottom: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
    marginTop: 20,
  },
  paragraph: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#BDC3C7',
    marginTop: 40,
    textAlign: 'center',
  },
});
