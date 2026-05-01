import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Platform, Modal, TextInput, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { getStudentById, Student, addHealthRecord, getHealthRecords } from '../../../utils/database';
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [newHeight, setNewHeight] = useState('');
  const [newWeight, setNewWeight] = useState('');
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
          const records = await getHealthRecords(Number(id));
          setHealthRecords(records);
        }
      }
    } catch (error) {
      console.error('Error fetching student:', error);
    } finally {
      setLoading(false);
    }
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
      await addHealthRecord({
        student_db_id: Number(id),
        date, height: h, weight: w, status, z_score: 0
      });
      showToast('Health data saved', 'success');
      setShowAddModal(false);
      setNewHeight(''); setNewWeight('');
      setRecordDate(new Date());
      fetchStudentData();
    } catch (error) {
      showToast('Failed to add data', 'error');
    }
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
    } else {
      generatePDF('', type);
    }
  };

  const generatePDF = async (qrData: string, type: 'QR' | 'ID') => {
    if (!student) return;

    const html = type === 'QR' ? `
      <html>
        <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
          <h1 style="color: #0A3327;">Student Attendance QR</h1>
          <p style="font-size: 24px; margin-bottom: 40px;">${student.first_name} ${student.last_name}</p>
          <img src="${qrData}" style="width: 300px; height: 300px; border: 10px solid #f0f0f0; padding: 20px; border-radius: 20px;" />
          <p style="margin-top: 40px; color: #666;">ID: ${student.student_id}</p>
        </body>
      </html>
    ` : `
      <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
            body { 
              margin: 0; 
              padding: 0; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              height: 100vh; 
              background-color: #f0f2f5; 
              font-family: 'Inter', sans-serif; 
            }
            .card {
              width: 350px;
              height: 550px;
              background: white;
              border-radius: 24px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.08);
              overflow: hidden;
              position: relative;
              display: flex;
              flex-direction: column;
            }
            .header {
              background: #0A3327;
              height: 120px;
              position: relative;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              color: white;
            }
            .header h2 {
              margin: 0;
              font-size: 20px;
              letter-spacing: 3px;
              font-weight: 800;
            }
            .header p {
              margin: 4px 0 0;
              font-size: 10px;
              opacity: 0.7;
              letter-spacing: 1px;
            }
            .qr-container {
              width: 140px;
              height: 140px;
              background: white;
              margin-top: -70px;
              align-self: center;
              border-radius: 20px;
              padding: 10px;
              box-shadow: 0 8px 20px rgba(0,0,0,0.1);
              z-index: 10;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .content {
              padding: 20px 30px;
              text-align: center;
              flex-grow: 1;
            }
            .name {
              font-size: 24px;
              font-weight: 800;
              color: #1a1a1a;
              margin: 10px 0 4px;
            }
            .id-tag {
              font-size: 16px;
              font-weight: 600;
              color: #0A3327;
              margin-bottom: 24px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              text-align: left;
              margin-bottom: 24px;
            }
            .info-item label {
              display: block;
              font-size: 9px;
              font-weight: 600;
              color: #999;
              text-transform: uppercase;
              margin-bottom: 4px;
            }
            .info-item span {
              display: block;
              font-size: 13px;
              font-weight: 600;
              color: #333;
            }
            .footer {
              background: #f8f9fa;
              padding: 20px;
              border-top: 1px solid #eee;
              text-align: left;
            }
            .footer-label {
              font-size: 9px;
              font-weight: 600;
              color: #999;
              margin-bottom: 4px;
            }
            .footer-value {
              font-size: 14px;
              font-weight: 700;
              color: #D32F2F;
            }
            .org-stamp {
              position: absolute;
              bottom: 20px;
              right: 20px;
              font-size: 8px;
              color: #ccc;
              transform: rotate(-15deg);
              border: 1px solid #eee;
              padding: 4px 8px;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h2>SMART ANGAN</h2>
              <p>OFFICIAL STUDENT PASS</p>
            </div>
            <div class="qr-container">
              <img src="${qrData}" style="width: 100%; height: 100%;" />
            </div>
            <div class="content">
              <div class="name">${student.first_name} ${student.last_name}</div>
              <div class="id-tag">${student.student_id}</div>
              
              <div class="info-grid">
                <div class="info-item">
                  <label>Gender</label>
                  <span>${student.gender}</span>
                </div>
                <div class="info-item">
                  <label>Date of Birth</label>
                  <span>${student.dob}</span>
                </div>
                <div class="info-item">
                  <label>Village</label>
                  <span>${student.village || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <label>Zone</label>
                  <span>${student.zone || 'N/A'}</span>
                </div>
              </div>
            </div>
            <div class="footer">
              <div class="footer-label">EMERGENCY CONTACT</div>
              <div class="footer-value">${student.emergency_contact || student.father_mobile || 'N/A'}</div>
            </div>
            <div class="org-stamp">VALID SESSION 2026-27</div>
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      
      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = uri;
        link.download = `${student.first_name}_${type}.pdf`;
        link.click();
        showToast('PDF downloaded successfully', 'success');
      } else {
        const fileName = `${student.first_name}_${type}.pdf`;
        const newPath = FileSystem.documentDirectory + fileName;
        await FileSystem.moveAsync({
          from: uri,
          to: newPath,
        });
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(newPath);
        } else {
          showToast('Sharing not available', 'error');
        }
      }
    } catch (error) {
      console.error(error);
      showToast('Error generating PDF', 'error');
    }
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
  if (!student) return <View style={styles.centered}><Text>Student not found</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{activeTab === 'Profile' ? 'Student Profile' : 'Health Dashboard'}</Text>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.push(`/(tabs)/students/edit/${id}`)}>
          <Ionicons name="create-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'Profile' && styles.activeTab]} onPress={() => setActiveTab('Profile')}>
          <Text style={[styles.tabText, activeTab === 'Profile' && styles.activeTabText]}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'Health' && styles.activeTab]} onPress={() => setActiveTab('Health')}>
          <Text style={[styles.tabText, activeTab === 'Health' && styles.activeTabText]}>Health</Text>
        </TouchableOpacity>
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
            </View>

            <View style={styles.qrSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Digital ID</Text>
                <View style={styles.downloadActions}>
                  <TouchableOpacity style={styles.miniButton} onPress={() => downloadAsPDF('QR')}>
                    <Ionicons name="download-outline" size={16} color={colors.primary} />
                    <Text style={styles.miniButtonText}>QR PDF</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.miniButton} onPress={() => downloadAsPDF('ID')}>
                    <Ionicons name="card-outline" size={16} color={colors.primary} />
                    <Text style={styles.miniButtonText}>ID Card PDF</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.qrCard}>
                <QRCode getRef={(c) => (qrRef.current = c)} value={student.student_id || ''} size={150} color="#000" backgroundColor="white" />
              </View>
            </View>

            <View style={styles.detailsContainer}>
              <DetailSection title="Personal Information">
                <DetailItem icon="calendar-outline" label="Date of Birth" value={student.dob} />
                <DetailItem icon="male-female-outline" label="Gender" value={student.gender} />
                <DetailItem icon="location-outline" label="Address" value={`${student.door_number || ''} ${student.street || ''}`} />
                <DetailItem icon="map-outline" label="Village/Zone" value={`${student.village || ''} - ${student.zone || ''}`} />
                <DetailItem icon="business-outline" label="City & State" value={`${student.city || ''}, ${student.state || ''} ${student.pincode || ''}`} />
              </DetailSection>

              <DetailSection title="Guardian Information">
                <DetailItem icon="man-outline" label="Father Name" value={student.father_name || 'N/A'} />
                <DetailItem icon="call-outline" label="Father Mobile" value={student.father_mobile || 'N/A'} />
                <DetailItem icon="woman-outline" label="Mother Name" value={student.mother_name || 'N/A'} />
                <DetailItem icon="call-outline" label="Mother Mobile" value={student.mother_mobile || 'N/A'} />
                <DetailItem icon="alert-circle-outline" label="Emergency Contact" value={student.emergency_contact || 'N/A'} />
              </DetailSection>
            </View>
          </>
        ) : (
          <View style={styles.healthContainer}>
            <View style={styles.healthHeader}>
              <TouchableOpacity style={styles.viewAnalysisButton} onPress={() => setShowAnalysisModal(true)}>
                <Ionicons name="bar-chart-outline" size={20} color={colors.primary} />
                <Text style={styles.analysisText}>Analysis</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addDataButton} onPress={() => setShowAddModal(true)}>
                <Ionicons name="add" size={20} color={colors.white} />
                <Text style={styles.addDataText}>Add Data</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.historyTitle}>Health History</Text>
            {healthRecords.map((record) => {
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
          </View>
        )}
      </ScrollView>

      {/* Add Data Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>Add Data</Text><TouchableOpacity onPress={() => setShowAddModal(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity></View>
            <TouchableOpacity style={styles.datePickerTrigger} onPress={() => setShowDatePicker(true)}><Ionicons name="calendar-outline" size={20} color={colors.primary} /><Text style={styles.datePickerText}>{recordDate.toLocaleDateString()}</Text></TouchableOpacity>
            <TextInput style={styles.modalInput} value={newHeight} onChangeText={setNewHeight} keyboardType="numeric" placeholder="Height (cm)" />
            <TextInput style={styles.modalInput} value={newWeight} onChangeText={setNewWeight} keyboardType="numeric" placeholder="Weight (kg)" />
            <TouchableOpacity style={styles.saveHealthButton} onPress={handleAddHealthData}><Text style={styles.saveHealthButtonText}>Save</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Analysis Modal */}
      <Modal visible={showAnalysisModal} transparent animationType="fade">
        <View style={styles.fullModalOverlay}>
          <View style={styles.fullModalContent}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>Growth Analysis</Text><TouchableOpacity onPress={() => setShowAnalysisModal(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity></View>
            <ScrollView>
              <Text style={styles.chartTitle}>Weight Trend</Text>
              <View style={styles.chartContainer}>{healthRecords.slice(0,6).reverse().map((r,i)=>(<View key={i} style={styles.barWrapper}><View style={[styles.bar,{height:(r.weight/40)*150,backgroundColor:colors.primary}]}/><Text style={styles.barValue}>{r.weight}</Text></View>))}</View>
              <Text style={styles.chartTitle}>Height Trend</Text>
              <View style={styles.chartContainer}>{healthRecords.slice(0,6).reverse().map((r,i)=>(<View key={i} style={styles.barWrapper}><View style={[styles.bar,{height:(r.height/150)*150,backgroundColor:'#1565C0'}]}/><Text style={styles.barValue}>{r.height}</Text></View>))}</View>
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
    <View style={styles.sectionWrapper}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function DetailItem({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.detailItem}>
      <View style={styles.iconContainer}><Ionicons name={icon} size={20} color={colors.primary} /></View>
      <View style={styles.detailTextContainer}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 20, backgroundColor: colors.white },
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
  healthHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  viewAnalysisButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0F9F6', paddingVertical: 12, borderRadius: 16, gap: 8 },
  analysisText: { fontSize: 14, fontWeight: '700', color: colors.primary },
  addDataButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 16, gap: 8 },
  addDataText: { fontSize: 14, fontWeight: '700', color: colors.white },
  historyTitle: { ...typography.h3, fontSize: 18, color: colors.text, marginTop: 10 },
  historyItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, padding: 16, borderRadius: 20, marginBottom: 12, elevation: 2 },
  historyIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  historyInfo: { flex: 1 },
  historyDate: { fontSize: 15, fontWeight: '700', color: colors.text },
  historyMetrics: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  statusTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  statusTagText: { fontSize: 11, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.white, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, gap: 16 },
  fullModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  fullModalContent: { backgroundColor: colors.white, borderRadius: 32, padding: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  datePickerTrigger: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', padding: 16, borderRadius: 16, gap: 12 },
  datePickerText: { fontSize: 16, fontWeight: '600', color: colors.text },
  modalInput: { backgroundColor: '#F1F5F9', borderRadius: 16, padding: 16, fontSize: 18, fontWeight: '600', color: colors.text },
  saveHealthButton: { backgroundColor: colors.primary, paddingVertical: 18, borderRadius: 20, alignItems: 'center', marginTop: 10 },
  saveHealthButtonText: { color: colors.white, fontSize: 16, fontWeight: '800' },
  chartTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 16 },
  chartContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 200, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  barWrapper: { alignItems: 'center', width: (width - 80) / 6 },
  bar: { width: 12, borderRadius: 6 },
  barValue: { fontSize: 10, fontWeight: '700', color: colors.text, marginTop: 4 },
});
