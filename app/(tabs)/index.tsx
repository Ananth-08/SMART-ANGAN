import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { 
  getStudents, 
  getAttendanceByDate, 
  getHealthAlertsCount, 
  getRecentActivity, 
  getMealsCountByDate, 
  getStudentById, 
  getHealthRecords, 
  getVaccinationRecords, 
  getMeals 
} from '../../utils/database';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  
  const isParent = user?.role === 'parent';

  if (isParent) {
    return <ParentDashboard studentId={Number(user.studentId)} />;
  }

  return <StaffDashboard />;
}

function ParentDashboard({ studentId }: { studentId: number }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [vaccine, setVaccine] = useState<any>(null);
  const [attendance, setAttendance] = useState<string>('Not Marked');
  const [latestMeal, setLatestMeal] = useState<any>(null);

  const fetchParentData = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const sData = await getStudentById(studentId);
      const hData = await getHealthRecords(studentId);
      const vData = await getVaccinationRecords(studentId);
      const mData = await getMeals(studentId);
      const attData = await getAttendanceByDate(today);

      setStudent(sData);
      setHealth(hData[0] || null);
      setVaccine(vData[0] || null);
      setLatestMeal(mData[0] || null);
      
      const myAtt = attData.find(a => a.student_db_id === studentId);
      if (myAtt) {
        setAttendance(myAtt.status);
      } else {
        setAttendance('Not Marked');
      }
    } catch (error) {
      console.error('Parent Data Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchParentData();
    }, [studentId])
  );

  if (loading || !student) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#0A3327" /></View>;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <View style={styles.parentWelcomeCard}>
        <View style={styles.parentHeader}>
          <View style={styles.parentAvatarContainer}>
            {student.profile_image ? (
              <Image source={{ uri: student.profile_image }} style={styles.parentAvatar} />
            ) : (
              <Ionicons name="person" size={40} color={colors.primary} />
            )}
          </View>
          <View style={styles.parentWelcomeInfo}>
            <Text style={styles.parentGreeting}>{t('dashboard.greeting')}, {user.name}</Text>
            <Text style={styles.parentStudentName}>{student.first_name} {student.last_name}</Text>
            <Text style={styles.parentStudentId}>ID: {student.student_id}</Text>
          </View>
        </View>
      </View>

      <View style={styles.statusRow}>
        <View style={[styles.statusCard, { backgroundColor: attendance === 'Present' ? '#E8F5E9' : attendance === 'Absent' ? '#FFEBEE' : '#F1F5F9' }]}>
          <Ionicons 
            name={attendance === 'Present' ? 'checkmark-circle' : attendance === 'Absent' ? 'close-circle' : 'help-circle-outline'} 
            size={24} 
            color={attendance === 'Present' ? '#2E7D32' : attendance === 'Absent' ? '#D32F2F' : '#64748B'} 
          />
          <Text style={[styles.statusLabel, { color: attendance === 'Present' ? '#2E7D32' : attendance === 'Absent' ? '#D32F2F' : '#64748B' }]}>Today's Attendance</Text>
          <Text style={[styles.statusValue, { color: attendance === 'Present' ? '#1B5E20' : attendance === 'Absent' ? '#C62828' : '#334155' }]}>{attendance}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Current Health Status</Text>
      <View style={styles.parentHealthGrid}>
        <View style={styles.healthMetricCard}>
          <View style={[styles.metricIcon, { backgroundColor: '#E3F2FD' }]}><Ionicons name="resize" size={20} color="#1976D2" /></View>
          <Text style={styles.metricLabel}>Height</Text>
          <Text style={styles.metricValue}>{health?.height ? `${health.height} cm` : '--'}</Text>
        </View>
        <View style={styles.healthMetricCard}>
          <View style={[styles.metricIcon, { backgroundColor: '#FFF3E0' }]}><Ionicons name="speedometer" size={20} color="#F57C00" /></View>
          <Text style={styles.metricLabel}>Weight</Text>
          <Text style={styles.metricValue}>{health?.weight ? `${health.weight} kg` : '--'}</Text>
        </View>
        <View style={styles.healthMetricCard}>
          <View style={[styles.metricIcon, { backgroundColor: '#F3E5F5' }]}><Ionicons name="fitness" size={20} color="#7B1FA2" /></View>
          <Text style={styles.metricLabel}>Status</Text>
          <Text style={[styles.metricValue, { color: health?.status === 'Healthy' ? '#2E7D32' : '#D32F2F' }]}>{health?.status || '--'}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Latest Records</Text>
      <View style={styles.parentRecordCard}>
        <View style={styles.parentRecordItem}>
          <View style={[styles.recordIcon, { backgroundColor: '#E0F2F1' }]}><Ionicons name="shield-checkmark" size={20} color="#00695C" /></View>
          <View style={styles.recordContent}>
            <Text style={styles.recordTitle}>Last Vaccination</Text>
            <Text style={styles.recordSub}>{vaccine ? `${vaccine.vaccine_name} on ${new Date(vaccine.date).toLocaleDateString()}` : 'No record found'}</Text>
          </View>
        </View>
        <View style={styles.parentRecordDivider} />
        <View style={styles.parentRecordItem}>
          <View style={[styles.recordIcon, { backgroundColor: '#FFFDE7' }]}><Ionicons name="restaurant" size={20} color="#FBC02D" /></View>
          <View style={styles.recordContent}>
            <Text style={styles.recordTitle}>Last Nutrition Provided</Text>
            <Text style={styles.recordSub}>{latestMeal ? `${latestMeal.meal_type} on ${new Date(latestMeal.date).toLocaleDateString()}` : 'No record found'}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.refreshButton} onPress={fetchParentData}>
        <Ionicons name="refresh" size={20} color={colors.white} />
        <Text style={styles.refreshText}>Refresh Data</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function StaffDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [stats, setStats] = useState({ totalStudents: 0, presentToday: 0, mealsServed: 0, healthAlerts: 0 });
  const [activities, setActivities] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const students = await getStudents();
      const attendance = await getAttendanceByDate(dateStr);
      const healthAlerts = await getHealthAlertsCount();
      const recentUpdates = await getRecentActivity();
      const mealsCount = await getMealsCountByDate(dateStr);
      const presentCount = attendance.filter(a => a.status === 'Present').length;
      setStats({ totalStudents: students.length, presentToday: presentCount, mealsServed: mealsCount, healthAlerts });
      setActivities(recentUpdates);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [selectedDate])
  );

  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) setSelectedDate(date);
  };

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
          <Text style={styles.greeting}>{t('dashboard.greeting')}</Text>
          <Text style={styles.userName}>Ananth M</Text>
          <Text style={styles.welcomeSub}>{stats.totalStudents} {t('dashboard.total_students')}</Text>
        </View>
        <View style={styles.weatherBadge}><Ionicons name="stats-chart" size={24} color="#A5D6A7" /></View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('dashboard.overview')}</Text>
        <TouchableOpacity onPress={fetchDashboardData}><Ionicons name="refresh-outline" size={20} color="#0A3327" /></TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0A3327" style={{ marginVertical: 40 }} />
      ) : (
        <View style={styles.statsGrid}>
          <StatCard icon="people" label={t('dashboard.total_students')} value={stats.totalStudents} color="#0A3327" description="Registered base" />
          <StatCard icon="calendar" label={t('dashboard.present_today')} value={stats.presentToday} color="#10B981" description={`${Math.round((stats.presentToday/stats.totalStudents || 0)*100)}% Attendance`} />
          <StatCard icon="restaurant" label={t('dashboard.meals_provided')} value={stats.mealsServed} color="#F59E0B" description="Standard nutrition" />
          <StatCard icon="heart" label={t('dashboard.health_alerts')} value={stats.healthAlerts} color="#D32F2F" description="SAM/MAM status" />
        </View>
      )}

      <Text style={styles.sectionTitle}>{t('dashboard.quick_actions')}</Text>
      <View style={styles.quickActionRow}>
        <TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('/students')}><View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}><Ionicons name="add" size={24} color="#2E7D32" /></View><Text style={styles.actionText}>{t('dashboard.enroll')}</Text></TouchableOpacity>
        <TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('/attendance')}><View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}><Ionicons name="checkmark-done" size={24} color="#1565C0" /></View><Text style={styles.actionText}>{t('dashboard.attend')}</Text></TouchableOpacity>
        <TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('/messages')}><View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}><Ionicons name="chatbubbles" size={24} color="#EF6C00" /></View><Text style={styles.actionText}>{t('dashboard.alerts')}</Text></TouchableOpacity>
        <TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('/health-drive')}><View style={[styles.actionIcon, { backgroundColor: '#F0F9F6' }]}><Ionicons name="fitness" size={24} color="#0A3327" /></View><Text style={styles.actionText}>Health Drive</Text></TouchableOpacity>
      </View>

      <View style={styles.activitySection}>
        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{t('dashboard.recent_updates')}</Text><TouchableOpacity onPress={() => router.push('/students')}><Text style={styles.viewMore}>Students</Text></TouchableOpacity></View>
        <View style={styles.activityCard}>
          {activities.map((act, i) => (
            <ActivityItem key={i} icon={act.type === 'health' ? 'fitness' : act.type === 'vaccine' ? 'shield-checkmark' : 'restaurant'} color={act.type === 'health' ? '#0A3327' : act.type === 'vaccine' ? '#2E7D32' : '#EF6C00'} title={act.type === 'health' ? `Growth: ${act.detail}` : act.type === 'vaccine' ? `Vaccine: ${act.detail}` : `Meal: ${act.detail}`} student={act.student_name} time={new Date(act.date).toLocaleDateString()} />
          ))}
          {activities.length === 0 && <Text style={{ textAlign: 'center', padding: 20, color: '#94A3B8' }}>No recent activities</Text>}
        </View>
      </View>

      {showDatePicker && <DateTimePicker value={selectedDate} mode="date" display="default" onChange={onDateChange} maximumDate={new Date()} />}
    </ScrollView>
  );
}

function StatCard({ icon, label, value, color, description }: any) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statHeader}><View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}><Ionicons name={icon} size={20} color={color} /></View><Text style={[styles.statDelta, { color }]}>Live</Text></View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statDesc}>{description}</Text>
    </View>
  );
}

function ActivityItem({ icon, color, title, student, time }: any) {
  return (
    <View style={styles.activityItem}>
      <View style={[styles.activityIconCircle, { backgroundColor: color + '10' }]}><Ionicons name={icon} size={20} color={color} /></View>
      <View style={styles.activityContent}><Text style={styles.activityTextTitle}>{title}</Text><Text style={styles.activityTextSub}>{student} • {time}</Text></View>
      <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  
  // Parent Dashboard Styles
  parentWelcomeCard: { backgroundColor: colors.white, borderRadius: 24, padding: 20, marginBottom: 24, elevation: 2 },
  parentHeader: { flexDirection: 'row', alignItems: 'center' },
  parentAvatarContainer: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F0F9F6', justifyContent: 'center', alignItems: 'center', marginRight: 16, overflow: 'hidden' },
  parentAvatar: { width: '100%', height: '100%' },
  parentWelcomeInfo: { flex: 1 },
  parentGreeting: { fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
  parentStudentName: { fontSize: 22, fontWeight: '800', color: '#0A3327', marginTop: 2 },
  parentStudentId: { fontSize: 12, color: colors.primary, fontWeight: '700', marginTop: 2 },
  statusRow: { marginBottom: 24 },
  statusCard: { padding: 20, borderRadius: 20, alignItems: 'center', gap: 8 },
  statusLabel: { fontSize: 13, fontWeight: '700' },
  statusValue: { fontSize: 24, fontWeight: '900' },
  parentHealthGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  healthMetricCard: { flex: 1, backgroundColor: colors.white, borderRadius: 20, padding: 16, alignItems: 'center', elevation: 1 },
  metricIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  metricLabel: { fontSize: 11, fontWeight: '700', color: colors.textSecondary, marginBottom: 4 },
  metricValue: { fontSize: 16, fontWeight: '800', color: colors.text },
  parentRecordCard: { backgroundColor: colors.white, borderRadius: 24, padding: 20, elevation: 1 },
  parentRecordItem: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 4 },
  recordIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  recordContent: { flex: 1 },
  recordTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  recordSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  parentRecordDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },
  refreshButton: { backgroundColor: '#0A3327', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 16, marginTop: 20, gap: 8 },
  refreshText: { color: colors.white, fontSize: 16, fontWeight: '800' },
});
