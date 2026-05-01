import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getStudents, getAttendanceByDate, getHealthAlertsCount, getRecentActivity, getMealsCountByDate } from '../../utils/database';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Live Stats State
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    mealsServed: 0,
    healthAlerts: 0
  });
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedDate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const students = await getStudents();
      const attendance = await getAttendanceByDate(dateStr);
      const healthAlerts = await getHealthAlertsCount();
      const recentUpdates = await getRecentActivity();
      const mealsCount = await getMealsCountByDate(dateStr);

      const presentCount = attendance.filter(a => a.status === 'present').length;

      setStats({
        totalStudents: students.length,
        presentToday: presentCount,
        mealsServed: mealsCount,
        healthAlerts: healthAlerts
      });
      setActivities(recentUpdates);
    } catch (error) {
      console.error('Dashboard Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) setSelectedDate(date);
  };

  const StatCard = ({ icon, label, value, color, description }: any) => (
    <View style={styles.statCard}>
      <View style={[styles.statHeader]}>
        <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={[styles.statDelta, { color }]}>Live</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statDesc}>{description}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <View style={styles.dateFilterContainer}>
        <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowDatePicker(true)}>
          <Ionicons name="calendar-outline" size={20} color="#0A3327" />
          <Text style={styles.dateText}>{selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
          <Ionicons name="chevron-down" size={16} color="#0A3327" />
        </TouchableOpacity>
      </View>

      <View style={styles.welcomeCard}>
        <View style={styles.welcomeInfo}>
          <Text style={styles.greeting}>Daily Dashboard</Text>
          <Text style={styles.userName}>Ananth M</Text>
          <Text style={styles.welcomeSub}>{stats.totalStudents} Students Enrolled</Text>
        </View>
        <View style={styles.weatherBadge}>
          <Ionicons name="stats-chart" size={24} color="#A5D6A7" />
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <TouchableOpacity onPress={fetchDashboardData}><Ionicons name="refresh-outline" size={20} color="#0A3327" /></TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0A3327" style={{ marginVertical: 40 }} />
      ) : (
        <View style={styles.statsGrid}>
          <StatCard icon="people" label="Total Students" value={stats.totalStudents} color="#0A3327" description="Registered base" />
          <StatCard icon="calendar" label="Present Today" value={stats.presentToday} color="#10B981" description={`${Math.round((stats.presentToday/stats.totalStudents || 0)*100)}% Attendance`} />
          <StatCard icon="restaurant" label="Meals Provided" value={stats.mealsServed} color="#F59E0B" description="Standard nutrition" />
          <StatCard icon="heart" label="Health Alerts" value={stats.healthAlerts} color="#D32F2F" description="SAM/MAM status" />
        </View>
      )}

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
          <TouchableOpacity onPress={() => router.push('/students')}><Text style={styles.viewMore}>Students</Text></TouchableOpacity>
        </View>
        
        <View style={styles.activityCard}>
          {activities.map((act, i) => (
            <ActivityItem 
              key={i}
              icon={act.type === 'health' ? 'fitness' : 'shield-checkmark'} 
              color={act.type === 'health' ? '#0A3327' : '#2E7D32'} 
              title={act.type === 'health' ? `Growth: ${act.detail}` : `Vaccine: ${act.detail}`} 
              student={act.student_name} 
              time={new Date(act.date).toLocaleDateString()} 
            />
          ))}
          {activities.length === 0 && (
            <Text style={{ textAlign: 'center', padding: 20, color: '#94A3B8' }}>No recent activities</Text>
          )}
        </View>
      </View>

      {showDatePicker && <DateTimePicker value={selectedDate} mode="date" display="default" onChange={onDateChange} />}
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
  dateFilterContainer: { marginBottom: 16, alignItems: 'center' },
  datePickerBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 100, gap: 8, elevation: 2 },
  dateText: { fontSize: 14, fontWeight: '700', color: '#0A3327' },
  welcomeCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0A3327', borderRadius: 24, padding: 24, marginBottom: 24, elevation: 4 },
  welcomeInfo: { flex: 1 },
  greeting: { fontSize: 14, color: '#A5D6A7', fontWeight: '600' },
  userName: { fontSize: 24, color: colors.white, fontWeight: '800', marginVertical: 4 },
  welcomeSub: { fontSize: 12, color: '#A5D6A7', opacity: 0.8 },
  weatherBadge: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  viewMore: { fontSize: 14, fontWeight: '700', color: '#0A3327' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { width: (width - 52) / 2, backgroundColor: colors.white, borderRadius: 24, padding: 20, elevation: 2 },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statIconContainer: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  statDelta: { fontSize: 10, fontWeight: '800', color: '#10B981', backgroundColor: '#E8F5E9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
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
