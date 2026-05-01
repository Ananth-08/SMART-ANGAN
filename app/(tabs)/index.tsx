import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();

  const StatCard = ({ icon, label, value, color, description }: any) => (
    <View style={styles.statCard}>
      <View style={[styles.statHeader]}>
        <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={[styles.statDelta, { color }]}>+12%</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statDesc}>{description}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <View style={styles.welcomeCard}>
        <View style={styles.welcomeInfo}>
          <Text style={styles.greeting}>Good Morning,</Text>
          <Text style={styles.userName}>Ananth M</Text>
          <Text style={styles.welcomeSub}>Manage your Anganwadi today.</Text>
        </View>
        <View style={styles.weatherBadge}>
          <Ionicons name="sunny" size={24} color="#FFD700" />
          <Text style={styles.weatherText}>32°C</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Daily Overview</Text>
        <TouchableOpacity><Text style={styles.viewMore}>Analysis</Text></TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <StatCard icon="people" label="Total Students" value="124" color="#0A3327" description="4 New this week" />
        <StatCard icon="calendar" label="Present Today" value="108" color="#10B981" description="87% Attendance" />
        <StatCard icon="restaurant" label="Meals Served" value="450" color="#F59E0B" description="Balanced Diet" />
        <StatCard icon="heart" label="Health Alerts" value="2" color="#D32F2F" description="Check MAM Cases" />
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionRow}>
        <TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('/students')}>
          <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}><Ionicons name="add" size={24} color="#2E7D32" /></View>
          <Text style={styles.actionText}>Enroll</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('/attendance')}>
          <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}><Ionicons name="checkmark-done" size={24} color="#1565C0" /></View>
          <Text style={styles.actionText}>Attend</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('/messages')}>
          <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}><Ionicons name="chatbubbles" size={24} color="#EF6C00" /></View>
          <Text style={styles.actionText}>Alerts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('/settings')}>
          <View style={[styles.actionIcon, { backgroundColor: '#F3E5F5' }]}><Ionicons name="settings" size={24} color="#7B1FA2" /></View>
          <Text style={styles.actionText}>Config</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.activitySection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Updates</Text>
          <TouchableOpacity><Text style={styles.viewMore}>View All</Text></TouchableOpacity>
        </View>
        
        <View style={styles.activityCard}>
          <ActivityItem icon="fitness" color="#0A3327" title="Growth analysis updated" student="Ananth Kumar" time="10 mins ago" />
          <ActivityItem icon="shield-checkmark" color="#2E7D32" title="Vaccination recorded" student="Manoj S" time="45 mins ago" />
          <ActivityItem icon="mail" color="#1565C0" title="SMS alerts sent" student="Absentee Parents" time="1 hour ago" />
        </View>
      </View>
    </ScrollView>
  );
}

function ActivityItem({ icon, color, title, student, time }: any) {
  return (
    <View style={styles.activityItem}>
      <View style={[styles.activityIconCircle, { backgroundColor: color + '10' }]}><Ionicons name={icon} size={20} color={color} /></View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTextTitle}>{title}</Text>
        <Text style={styles.activityTextSub}>{student} • {time}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  welcomeCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0A3327', borderRadius: 24, padding: 24, marginBottom: 24, elevation: 4 },
  welcomeInfo: { flex: 1 },
  greeting: { fontSize: 14, color: '#A5D6A7', fontWeight: '600' },
  userName: { fontSize: 24, color: colors.white, fontWeight: '800', marginVertical: 4 },
  welcomeSub: { fontSize: 12, color: '#A5D6A7', opacity: 0.8 },
  weatherBadge: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 6 },
  weatherText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 16 },
  viewMore: { fontSize: 14, fontWeight: '700', color: '#0A3327' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { width: (width - 52) / 2, backgroundColor: colors.white, borderRadius: 24, padding: 20, elevation: 2 },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statIconContainer: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  statDelta: { fontSize: 12, fontWeight: '700' },
  statValue: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  statLabel: { fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 4 },
  statDesc: { fontSize: 10, color: '#94A3B8' },
  quickActionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  quickActionCard: { width: (width - 80) / 4, alignItems: 'center' },
  actionIcon: { width: 56, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8, elevation: 1 },
  actionText: { fontSize: 11, fontWeight: '800', color: '#475569' },
  activitySection: { marginBottom: 20 },
  activityCard: { backgroundColor: colors.white, borderRadius: 24, padding: 12, elevation: 2 },
  activityItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  activityIconCircle: { width: 40, height: 40, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  activityContent: { flex: 1 },
  activityTextTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  activityTextSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
});
