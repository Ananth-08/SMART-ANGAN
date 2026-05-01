import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Platform, Modal, TextInput, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { getStudentById, Student, addHealthRecord, getHealthRecords, addVaccinationRecord, getVaccinationRecords, addMeal, getMeals } from '../../../utils/database';
import QRCode from 'react-native-qrcode-svg';
import { useToast } from '../../../context/ToastContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

const { width } = Dimensions.get('window');

interface HealthRecord {
  id: number;
  date: string;
  height: number;
  weight: number;
  z_score: number;
  status: string;
}

interface VaccineRecord {
  id: number;
  vaccine_name: string;
  date: string;
  notes: string;
}

export default function StudentDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Profile' | 'Health'>('Profile');
  const qrRef = useRef<any>();
  
  // Health State
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [vaccinationRecords, setVaccinationRecords] = useState<VaccineRecord[]>([]);
  const [mealRecords, setMealRecords] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVaccineModal, setShowVaccineModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  
  // Input State
  const [newHeight, setNewHeight] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [vaccineName, setVaccineName] = useState('');
  const [vaccineNotes, setVaccineNotes] = useState('');
  const [recordDate, setRecordDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchStudentData();
  }, [id]);

  const fetchStudentData = async () => {
    try {
      if (id) {
        const data = await getStudentById(Number(id));
        setStudent(data);
        if (data) {
          const hRecords = await getHealthRecords(Number(id));
          const vRecords = await getVaccinationRecords(Number(id));
          const mRecords = await getMeals(Number(id));
          setHealthRecords(hRecords);
          setVaccinationRecords(vRecords);
          setMealRecords(mRecords);
        }
      }
    } catch (error) {
      console.error('Error fetching student:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    if (months < 0) { years--; months += 12; }
    return `${years}y ${months}m`;
  };

  const calculateStatus = (h: number, w: number) => {
    const heightInMeters = h / 100;
    const bmi = w / (heightInMeters * heightInMeters);
    if (bmi < 13) return { status: 'SAM', color: '#D32F2F' };
    if (bmi < 14.5) return { status: 'MAM', color: '#F57C00' };
    if (bmi < 18.5) return { status: 'Healthy', color: '#2E7D32' };
    return { status: 'Overweight', color: '#1565C0' };
  };

  const handleAddHealthData = async () => {
    if (!newHeight || !newWeight) {
      showToast('Please enter both height and weight', 'error');
      return;
    }
    const h = parseFloat(newHeight);
    const w = parseFloat(newWeight);
    const { status } = calculateStatus(h, w);
    const date = recordDate.toISOString().split('T')[0];
    try {
      await addHealthRecord({ student_db_id: Number(id), date, height: h, weight: w, status, z_score: 0 });
      showToast('Health data saved', 'success');
      setShowAddModal(false);
      setNewHeight(''); setNewWeight(''); setRecordDate(new Date());
      fetchStudentData();
    } catch (error) { showToast('Failed to add data', 'error'); }
  };

  const handleAddVaccination = async () => {
    if (!vaccineName) {
      showToast('Please enter vaccine name', 'error');
      return;
    }
    const date = recordDate.toISOString().split('T')[0];
    try {
      await addVaccinationRecord({ student_db_id: Number(id), vaccine_name: vaccineName, date, notes: vaccineNotes });
      showToast('Vaccination record saved', 'success');
      setShowVaccineModal(false);
      setVaccineName(''); setVaccineNotes(''); setRecordDate(new Date());
      fetchStudentData();
    } catch (error) { showToast('Failed to add vaccine', 'error'); }
  };

  const handleProvideMeal = async () => {
    try {
      await addMeal(Number(id), 'Standard Balanced Meal');
      showToast('Meal provided recorded', 'success');
      const mRecords = await getMeals(Number(id));
      setMealRecords(mRecords);
    } catch (error) { showToast('Failed to record meal', 'error'); }
  };

  const downloadAsPDF = async (type: 'QR' | 'ID') => {
    if (!student) return;
    showToast(`Generating ${type} PDF...`, 'info');
    let qrBase64 = '';
    if (qrRef.current) {
      qrRef.current.toDataURL((data: string) => {
        qrBase64 = `data:image/png;base64,${data}`;
        generatePDF(qrBase64, type);
      });
    } else { generatePDF('', type); }
  };

  const generatePDF = async (qrData: string, type: 'QR' | 'ID') => {
    if (!student) return;
    const html = type === 'QR' ? `
      <html><body style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;"><h1 style="color: #0A3327;">Student Attendance QR</h1><p style="font-size: 24px; margin-bottom: 40px;">${student.first_name} ${student.last_name}</p><img src="${qrData}" style="width: 300px; height: 300px; border: 10px solid #f0f0f0; padding: 20px; border-radius: 20px;" /><p style="margin-top: 40px; color: #666;">ID: ${student.student_id}</p></body></html>
    ` : `
      <html><head><style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #f0f2f5; font-family: 'Inter', sans-serif; }.card { width: 350px; height: 550px; background: white; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); overflow: hidden; position: relative; display: flex; flex-direction: column; }.header { background: #0A3327; height: 140px; display: flex; flex-direction: column; align-items: center; padding-top: 30px; color: white; box-sizing: border-box; }.header h2 { margin: 0; font-size: 22px; letter-spacing: 4px; font-weight: 800; }.header p { margin: 6px 0 0; font-size: 10px; opacity: 0.7; letter-spacing: 2px; }.qr-container { width: 160px; height: 160px; background: white; margin: -60px auto 0; border-radius: 24px; padding: 15px; box-shadow: 0 12px 24px rgba(0,0,0,0.1); z-index: 10; display: flex; align-items: center; justify-content: center; box-sizing: border-box; }.content { padding: 30px; text-align: center; flex-grow: 1; }.name { font-size: 28px; font-weight: 800; color: #1a1a1a; margin: 10px 0 6px; }.id-tag { font-size: 18px; font-weight: 700; color: #0A3327; margin-bottom: 30px; }.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; text-align: left; }.info-item label { display: block; font-size: 10px; font-weight: 700; color: #999; text-transform: uppercase; margin-bottom: 6px; }.info-item span { display: block; font-size: 15px; font-weight: 700; color: #333; }.footer { background: #f8fafc; padding: 24px 30px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }.footer-info { text-align: left; }.footer-label { font-size: 10px; font-weight: 700; color: #999; margin-bottom: 6px; }.footer-value { font-size: 18px; font-weight: 800; color: #D32F2F; }.org-stamp { font-size: 9px; font-weight: 700; color: #cbd5e1; transform: rotate(-10deg); border: 1.5px solid #e2e8f0; padding: 6px 12px; border-radius: 8px; text-transform: uppercase; letter-spacing: 1px; }</style></head><body><div class="card"><div class="header"><h2>SMART ANGAN</h2><p>OFFICIAL STUDENT PASS</p></div><div class="qr-container"><img src="${qrData}" style="width: 100%; height: 100%;" /></div><div class="content"><div class="name">${student.first_name} ${student.last_name}</div><div class="id-tag">${student.student_id}</div><div class="info-grid"><div class="info-item"><label>Gender</label><span>${student.gender}</span></div><div class="info-item"><label>Date of Birth</label><span>${student.dob}</span></div><div class="info-item"><label>Village</label><span>${student.village || 'N/A'}</span></div><div class="info-item"><label>Zone</label><span>${student.zone || 'N/A'}</span></div></div></div><div class="footer"><div class="footer-info"><div class="footer-label">EMERGENCY CONTACT</div><div class="footer-value">${student.emergency_contact || student.father_mobile || 'N/A'}</div></div><div class="org-stamp">VALID SESSION 2026-27</div></div></div></body></html>
    `;
    try {
      const { uri } = await Print.printToFileAsync({ html });
      if (Platform.OS === 'web') {
        const link = document.createElement('a'); link.href = uri; link.download = `${student.first_name}_${type}.pdf`; link.click();
        showToast('PDF downloaded successfully', 'success');
      } else {
        const fileName = `${student.first_name}_${type}.pdf`;
        const newPath = FileSystem.documentDirectory + fileName;
        await FileSystem.moveAsync({ from: uri, to: newPath });
        if (await Sharing.isAvailableAsync()) { await Sharing.shareAsync(newPath); }
        else { showToast('Sharing not available', 'error'); }
      }
    } catch (error) { console.error(error); showToast('Error generating PDF', 'error'); }
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
  if (!student) return <View style={styles.centered}><Text>Student not found</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}><Ionicons name="chevron-back" size={24} color={colors.text} /></TouchableOpacity>
        <Text style={styles.headerTitle}>{activeTab === 'Profile' ? 'Student Profile' : 'Health Dashboard'}</Text>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.push(`/(tabs)/students/edit/${id}`)}><Ionicons name="create-outline" size={24} color={colors.text} /></TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'Profile' && styles.activeTab]} onPress={() => setActiveTab('Profile')}><Text style={[styles.tabText, activeTab === 'Profile' && styles.activeTabText]}>Profile</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'Health' && styles.activeTab]} onPress={() => setActiveTab('Health')}><Text style={[styles.tabText, activeTab === 'Health' && styles.activeTabText]}>Health</Text></TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'Profile' ? (
          <>
            <View style={styles.profileCard}>
              <View style={styles.avatarWrapper}>
                {student.profile_image ? <Image source={{ uri: student.profile_image }} style={styles.avatar} /> : <View style={styles.placeholderAvatar}><Ionicons name="person" size={50} color={colors.primary} /></View>}
              </View>
              <Text style={styles.name}>{student.first_name} {student.last_name}</Text>
              <Text style={styles.studentId}>{student.student_id}</Text>
              <View style={styles.badgeRow}>
                <View style={[styles.badge, { backgroundColor: '#E8F5E9' }]}><Text style={[styles.badgeText, { color: '#2E7D32' }]}>{student.gender}</Text></View>
                <View style={[styles.badge, { backgroundColor: '#E3F2FD' }]}><Text style={[styles.badgeText, { color: '#1565C0' }]}>Grade A</Text></View>
              </View>
            </View>
            <View style={styles.qrSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Digital ID</Text>
                <View style={styles.downloadActions}>
                  <TouchableOpacity style={styles.miniButton} onPress={() => downloadAsPDF('QR')}><Ionicons name="download-outline" size={16} color={colors.primary} /><Text style={styles.miniButtonText}>QR PDF</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.miniButton} onPress={() => downloadAsPDF('ID')}><Ionicons name="card-outline" size={16} color={colors.primary} /><Text style={styles.miniButtonText}>ID PDF</Text></TouchableOpacity>
                </View>
              </View>
              <View style={styles.qrCard}><QRCode getRef={(c) => (qrRef.current = c)} value={student.student_id || ''} size={150} color="#000" backgroundColor="white" /></View>
            </View>
            <View style={styles.detailsContainer}>
              <DetailSection title="Personal Information">
                <DetailItem icon="calendar-outline" label="Date of Birth" value={student.dob} />
                <DetailItem icon="male-female-outline" label="Gender" value={student.gender} />
                <DetailItem icon="location-outline" label="Address" value={`${student.door_number || ''} ${student.street || ''}`} />
                <DetailItem icon="map-outline" label="Village/Zone" value={`${student.village || ''} - ${student.zone || ''}`} />
              </DetailSection>
              <DetailSection title="Guardian Information">
                <DetailItem icon="man-outline" label="Father Name" value={student.father_name || 'N/A'} />
                <DetailItem icon="woman-outline" label="Mother Name" value={student.mother_name || 'N/A'} />
                <DetailItem icon="alert-circle-outline" label="Emergency" value={student.emergency_contact || 'N/A'} />
              </DetailSection>
            </View>
          </>
        ) : (
          <View style={styles.healthContainer}>
            <View style={styles.healthHeader}>
              <TouchableOpacity style={styles.viewAnalysisButton} onPress={() => setShowAnalysisModal(true)}><Ionicons name="bar-chart-outline" size={18} color={colors.primary} /><Text style={styles.analysisText}>Analysis</Text></TouchableOpacity>
              <TouchableOpacity style={styles.viewAnalysisButton} onPress={() => setShowAddModal(true)}><Ionicons name="fitness-outline" size={18} color={colors.primary} /><Text style={styles.analysisText}>Growth</Text></TouchableOpacity>
              <TouchableOpacity style={styles.viewAnalysisButton} onPress={() => setShowVaccineModal(true)}><Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} /><Text style={styles.analysisText}>Vaccine</Text></TouchableOpacity>
              <TouchableOpacity style={styles.viewAnalysisButton} onPress={handleProvideMeal}><Ionicons name="restaurant-outline" size={18} color={colors.primary} /><Text style={styles.analysisText}>Meal</Text></TouchableOpacity>
            </View>

            <Text style={styles.historyTitle}>Nutrition History</Text>
            {mealRecords.slice(0, 3).map((record) => (
              <View key={record.id} style={styles.historyItem}>
                <View style={[styles.historyIcon, { backgroundColor: '#FFF3E0' }]}><Ionicons name="restaurant" size={24} color="#EF6C00" /></View>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyDate}>{new Date(record.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                  <Text style={styles.historyMetrics}>{record.meal_type}</Text>
                </View>
                <View style={[styles.statusTag, { backgroundColor: '#FFF3E0' }]}><Text style={[styles.statusTagText, { color: '#EF6C00' }]}>Provided</Text></View>
              </View>
            ))}
            {mealRecords.length === 0 && <View style={styles.emptyCard}><Text style={styles.emptyText}>No meals recorded for this student</Text></View>}

            <Text style={[styles.historyTitle, { marginTop: 20 }]}>Growth History</Text>
            {healthRecords.slice(0, 3).map((record) => {
              const { color } = calculateStatus(record.height, record.weight);
              return (
                <View key={record.id} style={styles.historyItem}>
                  <View style={styles.historyIcon}><Ionicons name="fitness-outline" size={24} color={color} /></View>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyDate}>{new Date(record.date).toLocaleDateString()}</Text>
                    <Text style={styles.historyMetrics}>H: {record.height}cm • W: {record.weight}kg</Text>
                  </View>
                  <View style={[styles.statusTag, { backgroundColor: color + '15' }]}><Text style={[styles.statusTagText, { color }]}>{record.status}</Text></View>
                </View>
              );
            })}

            <Text style={[styles.historyTitle, { marginTop: 20 }]}>Vaccination Records</Text>
            {vaccinationRecords.map((record) => (
              <View key={record.id} style={styles.historyItem}>
                <View style={[styles.historyIcon, { backgroundColor: '#F0F9F6' }]}><Ionicons name="shield-checkmark" size={24} color="#0A3327" /></View>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyDate}>{record.vaccine_name}</Text>
                  <Text style={styles.historyMetrics}>{new Date(record.date).toLocaleDateString()} {record.notes ? `• ${record.notes}` : ''}</Text>
                </View>
                <View style={[styles.statusTag, { backgroundColor: '#E8F5E9' }]}><Text style={[styles.statusTagText, { color: '#2E7D32' }]}>Administered</Text></View>
              </View>
            ))}
            {vaccinationRecords.length === 0 && (
              <View style={styles.emptyCard}><Text style={styles.emptyText}>No vaccination records found</Text></View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Add Health Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}><TouchableOpacity onPress={() => setShowAddModal(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity></View>
            <TouchableOpacity style={styles.datePickerTrigger} onPress={() => setShowDatePicker(true)}><Ionicons name="calendar-outline" size={20} color={colors.primary} /><Text style={styles.datePickerText}>{recordDate.toLocaleDateString()}</Text></TouchableOpacity>
            <TextInput style={styles.modalInput} value={newHeight} onChangeText={setNewHeight} keyboardType="numeric" placeholder="Height (cm)" />
            <TextInput style={styles.modalInput} value={newWeight} onChangeText={setNewWeight} keyboardType="numeric" placeholder="Weight (kg)" />
            <TouchableOpacity style={styles.saveHealthButton} onPress={handleAddHealthData}><Text style={styles.saveHealthButtonText}>Save</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Vaccine Modal */}
      <Modal visible={showVaccineModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}><TouchableOpacity onPress={() => setShowVaccineModal(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity></View>
            <TouchableOpacity style={styles.datePickerTrigger} onPress={() => setShowDatePicker(true)}><Ionicons name="calendar-outline" size={20} color={colors.primary} /><Text style={styles.datePickerText}>{recordDate.toLocaleDateString()}</Text></TouchableOpacity>
            <TextInput style={styles.modalInput} value={vaccineName} onChangeText={setVaccineName} placeholder="Vaccine Name (e.g. BCG, Polio)" />
            <TextInput style={styles.modalInput} value={vaccineNotes} onChangeText={setVaccineNotes} placeholder="Notes (Optional)" multiline />
            <TouchableOpacity style={[styles.saveHealthButton, { backgroundColor: '#0A3327' }]} onPress={handleAddVaccination}><Text style={styles.saveHealthButtonText}>Save</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Analysis Modal */}
      <Modal visible={showAnalysisModal} transparent animationType="fade">
        <View style={styles.anaModalOverlay}>
          <View style={styles.anaModalContent}>
            <View style={styles.anaModalHeader}>
              <Text style={styles.anaModalTitle}>Growth Analysis</Text>
              <TouchableOpacity onPress={() => setShowAnalysisModal(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.anaProfileCard}>
                <View style={styles.anaAvatarWrapper}>
                  {student.profile_image ? <Image source={{ uri: student.profile_image }} style={styles.anaAvatar} /> : <View style={styles.anaPlaceholderAvatar}><Ionicons name="person" size={24} color={colors.primary} /></View>}
                </View>
                <View style={styles.anaProfileInfo}>
                  <Text style={styles.anaName}>{student.first_name} {student.last_name[0]}.</Text>
                  <Text style={styles.anaDetails}>Age: {calculateAge(student.dob)} | ID: #{student.student_id}</Text>
                  <View style={styles.anaStatusBadge}><Ionicons name="checkmark-circle" size={12} color="#2E7D32" /><Text style={styles.anaStatusText}>{healthRecords[0]?.status || 'Normal'}</Text></View>
                </View>
              </View>
              <View style={styles.anaHistoryCard}>
                <View style={styles.anaHistoryHeader}><Text style={styles.anaHistoryTitle}>GROWTH HISTORY</Text></View>
                <View style={styles.anaChartContainer}>
                  {healthRecords.slice(0, 4).reverse().map((r, i) => (
                    <View key={i} style={styles.anaBarWrapper}>
                      <View style={[styles.anaBar, { height: (r.weight / 40) * 100, backgroundColor: i === 3 ? '#0A3327' : '#E8F5E9' }]} />
                      <Text style={styles.anaBarLabel}>{new Date(r.date).toLocaleDateString('en-US', { month: 'short' })}</Text>
                    </View>
                  ))}
                  <View style={styles.anaBarWrapper}><View style={[styles.anaBar, { height: 80, backgroundColor: 'transparent', borderWidth: 1, borderColor: '#CCC', borderStyle: 'dashed' }]} /><Text style={styles.anaBarLabel}>Est.</Text></View>
                </View>
              </View>
              <View style={styles.anaMetricsRow}>
                <View style={[styles.anaMetricCard, { backgroundColor: '#0A3327' }]}><Text style={[styles.anaMetricLabel, { color: '#8BA19A' }]}>HEIGHT-FOR-AGE</Text><Text style={[styles.anaMetricValue, { color: colors.white }]}>+0.8</Text><Text style={[styles.anaMetricStatus, { color: '#8BA19A' }]}>Excellent Progress</Text></View>
                <View style={[styles.anaMetricCard, { backgroundColor: '#F1F5F9' }]}><Text style={[styles.anaMetricLabel, { color: colors.textSecondary }]}>WEIGHT-FOR-AGE</Text><Text style={[styles.anaMetricValue, { color: colors.text }]}>{healthRecords[0]?.weight || 0} kg</Text><View style={styles.anaMetricTrend}><Ionicons name="trending-up" size={14} color="#2E7D32" /><Text style={styles.anaMetricTrendText}>+0.4kg</Text></View></View>
              </View>
              <View style={styles.anaWhoCard}>
                <View style={styles.anaWhoIconContainer}><Ionicons name="shield-checkmark" size={20} color="#2E7D32" /></View>
                <View style={styles.anaWhoInfo}><Text style={styles.anaWhoTitle}>WHO Growth Standard</Text><Text style={styles.anaWhoSubtitle}>Classified as: Green (Healthy)</Text></View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {showDatePicker && <DateTimePicker value={recordDate} mode="date" display="default" onChange={(e,d)=>{setShowDatePicker(false);if(d)setRecordDate(d);}} />}
    </View>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.sectionWrapper}><Text style={styles.sectionTitle}>{title}</Text><View style={styles.sectionCard}>{children}</View></View>
  );
}

function DetailItem({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.detailItem}><View style={styles.iconContainer}><Ionicons name={icon} size={20} color={colors.primary} /></View><View style={styles.detailTextContainer}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View></View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40, backgroundColor: colors.white, paddingBottom: 20 },
  headerTitle: { ...typography.h3, color: colors.text },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  tabContainer: { flexDirection: 'row', backgroundColor: colors.white, paddingHorizontal: 20, paddingBottom: 15 },
  tab: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, marginRight: 10, backgroundColor: '#F1F5F9' },
  activeTab: { backgroundColor: colors.primary },
  tabText: { fontSize: 14, fontWeight: '700', color: colors.textSecondary },
  activeTabText: { color: colors.white },
  scrollContent: { padding: 20, paddingBottom: 40 },
  profileCard: { backgroundColor: colors.white, borderRadius: 24, padding: 24, alignItems: 'center', elevation: 3, marginBottom: 24 },
  avatarWrapper: { width: 100, height: 100, borderRadius: 50, padding: 4, backgroundColor: '#E8F5E9', marginBottom: 16 },
  avatar: { width: '100%', height: '100%', borderRadius: 50 },
  placeholderAvatar: { width: '100%', height: '100%', borderRadius: 50, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  name: { ...typography.h2, color: colors.text, marginBottom: 4 },
  studentId: { ...typography.caption, color: colors.primary, fontWeight: '800', letterSpacing: 1, marginBottom: 16 },
  badgeRow: { flexDirection: 'row', gap: 8 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  qrSection: { marginBottom: 24 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  miniButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F9F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, gap: 4 },
  miniButtonText: { fontSize: 10, fontWeight: '800', color: colors.primary },
  sectionTitle: { ...typography.h3, fontSize: 18, color: colors.text },
  qrCard: { backgroundColor: colors.white, borderRadius: 24, padding: 30, alignItems: 'center', elevation: 2 },
  detailsContainer: { gap: 24 },
  sectionWrapper: {},
  sectionCard: { backgroundColor: colors.white, borderRadius: 24, padding: 20, elevation: 2 },
  detailItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconContainer: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F0F9F6', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  detailTextContainer: { flex: 1 },
  detailLabel: { fontSize: 12, color: colors.textSecondary },
  detailValue: { fontSize: 15, fontWeight: '600', color: colors.text },
  healthContainer: { gap: 20 },
  healthHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  viewAnalysisButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0F9F6', paddingVertical: 10, borderRadius: 16, gap: 4 },
  analysisText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  historyTitle: { ...typography.h3, fontSize: 18, color: colors.text, marginTop: 10 },
  historyItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, padding: 16, borderRadius: 20, marginBottom: 12, elevation: 2 },
  historyIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  historyInfo: { flex: 1 },
  historyDate: { fontSize: 15, fontWeight: '700', color: colors.text },
  historyMetrics: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  statusTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  statusTagText: { fontSize: 11, fontWeight: '800' },
  emptyCard: { backgroundColor: colors.white, padding: 20, borderRadius: 20, alignItems: 'center' },
  emptyText: { color: colors.textSecondary, fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.white, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, gap: 16 },
  anaModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  anaModalContent: { backgroundColor: '#F8FAFC', borderRadius: 32, padding: 20, maxHeight: '90%' },
  anaModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  anaModalTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  anaProfileCard: { backgroundColor: colors.white, borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  anaAvatarWrapper: { width: 60, height: 60, borderRadius: 30, overflow: 'hidden', marginRight: 16 },
  anaAvatar: { width: '100%', height: '100%' },
  anaPlaceholderAvatar: { width: '100%', height: '100%', backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  anaProfileInfo: { flex: 1 },
  anaName: { fontSize: 18, fontWeight: '800', color: colors.text },
  anaDetails: { fontSize: 12, color: colors.textSecondary, marginVertical: 4 },
  anaStatusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  anaStatusText: { fontSize: 10, fontWeight: '700', color: '#2E7D32' },
  anaHistoryCard: { backgroundColor: colors.white, borderRadius: 24, padding: 20, marginBottom: 16 },
  anaHistoryHeader: { marginBottom: 20 },
  anaHistoryTitle: { fontSize: 12, fontWeight: '800', color: colors.textSecondary, letterSpacing: 1 },
  anaChartContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 120 },
  anaBarWrapper: { alignItems: 'center', gap: 8 },
  anaBar: { width: 12, borderRadius: 6 },
  anaBarLabel: { fontSize: 10, color: colors.textSecondary },
  anaMetricsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  anaMetricCard: { flex: 1, borderRadius: 24, padding: 20, gap: 8 },
  anaMetricLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  anaMetricValue: { fontSize: 20, fontWeight: '800' },
  anaMetricStatus: { fontSize: 12, fontWeight: '600' },
  anaMetricTrend: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  anaMetricTrendText: { fontSize: 12, fontWeight: '700', color: '#2E7D32' },
  anaWhoCard: { backgroundColor: '#F1F5F9', borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16 },
  anaWhoIconContainer: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' },
  anaWhoInfo: { flex: 1 },
  anaWhoTitle: { fontSize: 14, fontWeight: '800', color: '#0A3327' },
  anaWhoSubtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  datePickerTrigger: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', padding: 16, borderRadius: 16, gap: 12 },
  datePickerText: { fontSize: 16, fontWeight: '600', color: colors.text },
  modalInput: { backgroundColor: '#F1F5F9', borderRadius: 16, padding: 16, fontSize: 18, fontWeight: '600', color: colors.text },
  saveHealthButton: { backgroundColor: colors.primary, paddingVertical: 18, borderRadius: 20, alignItems: 'center', marginTop: 10 },
  saveHealthButtonText: { color: colors.white, fontSize: 16, fontWeight: '800' },
});
