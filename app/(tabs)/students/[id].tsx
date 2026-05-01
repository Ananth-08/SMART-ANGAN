import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { getStudentById, Student } from '../../../utils/database';
import QRCode from 'react-native-qrcode-svg';

export default function StudentDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        if (id) {
          const data = await getStudentById(Number(id));
          setStudent(data);
        }
      } catch (error) {
        console.error('Error fetching student:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!student) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Student not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Student Profile</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="create-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            {student.profile_image ? (
              <Image source={{ uri: student.profile_image }} style={styles.avatar} />
            ) : (
              <View style={styles.placeholderAvatar}>
                <Ionicons name="person" size={50} color={colors.primary} />
              </View>
            )}
          </View>
          <Text style={styles.name}>{student.first_name} {student.last_name}</Text>
          <Text style={styles.studentId}>{student.student_id}</Text>
          
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: '#E8F5E9' }]}>
              <Text style={[styles.badgeText, { color: '#2E7D32' }]}>{student.gender}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: '#E3F2FD' }]}>
              <Text style={[styles.badgeText, { color: '#1565C0' }]}>Grade A</Text>
            </View>
          </View>
        </View>

        {/* QR Code Section */}
        <View style={styles.qrSection}>
          <Text style={styles.sectionTitle}>Digital ID</Text>
          <View style={styles.qrCard}>
            <QRCode
              value={student.student_id || ''}
              size={120}
              color="#000"
              backgroundColor="white"
            />
            <Text style={styles.qrHint}>Scan for quick attendance</Text>
          </View>
        </View>

        {/* Details Sections */}
        <View style={styles.detailsContainer}>
          <DetailSection title="Personal Information">
            <DetailItem icon="calendar-outline" label="Date of Birth" value={student.dob} />
            <DetailItem icon="location-outline" label="City" value={student.city || 'Not specified'} />
            <DetailItem icon="home-outline" label="Address" value={`${student.door_number || ''} ${student.street || ''}, ${student.village || ''}`} />
          </DetailSection>

          <DetailSection title="Parent Information">
            <DetailItem icon="man-outline" label="Father" value={student.father_name || 'N/A'} />
            <DetailItem icon="call-outline" label="Father's Contact" value={student.father_mobile || 'N/A'} />
            <DetailItem icon="woman-outline" label="Mother" value={student.mother_name || 'N/A'} />
            <DetailItem icon="call-outline" label="Mother's Contact" value={student.mother_mobile || 'N/A'} />
          </DetailSection>

          <DetailSection title="Emergency Contact">
            <DetailItem icon="alert-circle-outline" label="Emergency" value={student.emergency_contact || 'N/A'} />
          </DetailSection>
        </View>
      </ScrollView>
    </View>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.sectionWrapper}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function DetailItem({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.detailItem}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.detailTextContainer}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 24,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    padding: 4,
    backgroundColor: '#E8F5E9',
    marginBottom: 16,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  placeholderAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 4,
  },
  studentId: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  qrSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 18,
    color: colors.text,
    marginBottom: 12,
    paddingLeft: 4,
  },
  qrCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  qrHint: {
    marginTop: 16,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  detailsContainer: {
    gap: 24,
  },
  sectionWrapper: {},
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F0F9F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    marginBottom: 16,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.white,
    fontWeight: '700',
  },
});
