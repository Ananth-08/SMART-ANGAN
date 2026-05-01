import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export default function TechSupportScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tech Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="headset-outline" size={48} color={colors.primary} />
          <Text style={styles.infoTitle}>Need Technical Help?</Text>
          <Text style={styles.infoSubtitle}>Our team is available to assist you with any app-related issues.</Text>
        </View>

        <TouchableOpacity style={styles.contactButton} onPress={() => Linking.openURL('tel:+919876543210')}>
          <Ionicons name="call" size={20} color={colors.white} />
          <Text style={styles.contactButtonText}>Call Support</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.contactButton, { backgroundColor: '#25D366' }]} onPress={() => Linking.openURL('https://wa.me/919876543210')}>
          <Ionicons name="logo-whatsapp" size={20} color={colors.white} />
          <Text style={styles.contactButtonText}>WhatsApp Us</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.contactButton, { backgroundColor: '#E1F5FE', borderWidth: 0 }]} onPress={() => Linking.openURL('mailto:support@smartangan.org')}>
          <Ionicons name="mail" size={20} color="#0288D1" />
          <Text style={[styles.contactButtonText, { color: '#0288D1' }]}>Email Support</Text>
        </TouchableOpacity>
      </View>
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
  content: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  infoCard: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginTop: 20,
    marginBottom: 12,
  },
  infoSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 16,
    gap: 12,
  },
  contactButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
