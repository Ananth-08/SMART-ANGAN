import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const StatCard = ({ icon, label, value, color }: any) => (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, Ananth</Text>
          <Text style={styles.subtitle}>Welcome back to Smart Angan</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person-circle" size={40} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <StatCard icon="people" label="Students" value="124" color="#4F46E5" />
        <StatCard icon="calendar" label="Attendance" value="92%" color="#10B981" />
        <StatCard icon="restaurant" label="Meals" value="450" color="#F59E0B" />
        <StatCard icon="heart" label="Health" value="Good" color="#EF4444" />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Ionicons name="notifications" size={20} color={colors.primary} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>New Student Registered</Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.border} />
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="add-circle" size={28} color={colors.primary} />
            <Text style={styles.actionLabel}>Add Student</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="book" size={28} color={colors.primary} />
            <Text style={styles.actionLabel}>Mark Attendance</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="stats-chart" size={28} color={colors.primary} />
            <Text style={styles.actionLabel}>Reports</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.white,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  greeting: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 48) / 2,
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 20,
    margin: 6,
    borderWidth: 2,
    borderColor: '#D4EFDF',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  welcomeSection: {
    marginBottom: 25,
  },
  welcomeText: {
    ...typography.h1,
    fontSize: 28,
    color: '#0A3327',
  },
  dateText: {
    ...typography.caption,
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  summaryTitle: {
    ...typography.h3,
    fontSize: 16,
    color: '#0A3327',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  statNumber: {
    ...typography.h1,
    fontSize: 42,
    color: '#0A3327',
  },
  statLabel: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#EEE',
    marginHorizontal: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  progressCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  remainingText: {
    ...typography.caption,
    color: '#AF601A',
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
    marginVertical: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#0A3327',
    borderRadius: 6,
  },
  progressTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 15,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  actionButton: {
    flex: 1,
    height: 100,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    padding: 10,
  },
  actionText: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '700',
    color: '#0A3327',
    fontSize: 11,
  },
  activityCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  viewAllText: {
    color: '#138D75',
    fontWeight: '600',
    fontSize: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    shadowRadius: 5,
    elevation: 1,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text,
  },
  activityTime: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionItem: {
    width: (width - 72) / 3,
    backgroundColor: colors.white,
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  actionLabel: {
    ...typography.caption,
    fontSize: 10,
    marginTop: 8,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
});
