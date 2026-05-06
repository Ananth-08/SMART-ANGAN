import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import SimulatedScale from '../components/SimulatedScale';
import { getStudentByStudentId, Student, addHealthRecord } from '../utils/database';
import { calculateWHOZScore, calculateAgeInMonths } from '../utils/zScore';
import { useToast } from '../context/ToastContext';

export default function HealthDriveScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [permission, requestPermission] = useCameraPermissions();
  
  const [isScaleConnected, setIsScaleConnected] = useState(false);
  const [scannedStudent, setScannedStudent] = useState<Student | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>We need your permission to show the camera to scan Student IDs.</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}><Text style={styles.btnText}>Grant Permission</Text></TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (!isScanning) return;
    setIsScanning(false);
    
    // Attempt to lookup student by the scanned QR string
    const student = await getStudentByStudentId(data);
    if (student) {
      setScannedStudent(student);
      showToast(`Student Identified: ${student.first_name}`, 'success');
    } else {
      Alert.alert('Not Found', 'This QR code does not belong to any student in the local database.', [
        { text: 'Try Again', onPress: () => setIsScanning(true) }
      ]);
    }
  };

  const handleDataReceived = async (height: number, weight: number) => {
    if (!scannedStudent) {
      Alert.alert('No Student', 'Please scan a student ID before taking a measurement.');
      return;
    }

    // Calculate Z-Score
    let ageInMonths = 24;
    if (scannedStudent.dob) {
      ageInMonths = calculateAgeInMonths(scannedStudent.dob);
    }
    
    const { status, zScore } = calculateWHOZScore(height, weight, ageInMonths, scannedStudent.gender || 'Other');
    
    // Save to Database
    const today = new Date().toISOString().split('T')[0];
    
    try {
      await addHealthRecord({
        student_db_id: scannedStudent.id!,
        date: today,
        height,
        weight,
        status,
        z_score: zScore
      });

      Alert.alert(
        'Success!', 
        `Recorded for ${scannedStudent.first_name}\nHeight: ${height}cm\nWeight: ${weight}kg\nStatus: ${status}`,
        [{ text: 'Next Child', onPress: () => {
          setScannedStudent(null);
          setIsScanning(true);
        }}]
      );

    } catch (error) {
      showToast('Failed to save health record', 'error');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Mass Health Drive</Text>
        <TouchableOpacity 
          style={[styles.connectBtn, isScaleConnected && styles.connectedBtn]}
          onPress={() => setIsScaleConnected(!isScaleConnected)}
        >
          <Ionicons name="bluetooth" size={16} color={isScaleConnected ? colors.white : colors.primary} />
          <Text style={[styles.connectBtnText, isScaleConnected && styles.connectedBtnText]}>
            {isScaleConnected ? "Disconnect" : "Connect"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* QR Scanner Section */}
      <View style={styles.scannerSection}>
        {scannedStudent ? (
          <View style={styles.studentCard}>
            <View style={styles.studentAvatar}>
              <Ionicons name="person" size={40} color="#0A3327" />
            </View>
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>{scannedStudent.first_name} {scannedStudent.last_name}</Text>
              <Text style={styles.studentDetails}>ID: {scannedStudent.student_id}</Text>
            </View>
            <TouchableOpacity style={styles.rescanBtn} onPress={() => { setScannedStudent(null); setIsScanning(true); }}>
              <Ionicons name="scan" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cameraWrapper}>
            <CameraView 
              style={styles.camera} 
              facing="back"
              onBarcodeScanned={isScanning ? handleBarCodeScanned : undefined}
              barcodeScannerSettings={{
                barcodeTypes: ["qr"],
              }}
            />
            <View style={styles.overlay} pointerEvents="none">
              <View style={styles.scanBox} />
              <Text style={styles.scanText}>Scan Student ID Card</Text>
            </View>
          </View>
        )}
      </View>

      {/* Scale Interface Section */}
      <View style={styles.scaleSection}>
        <SimulatedScale 
          isConnected={isScaleConnected} 
          onDataReceived={handleDataReceived} 
        />
        
        {/* Placeholder for BLE code */}
        {/* 
          TODO FOR REAL HARDWARE:
          1. Install react-native-ble-plx
          2. Connect to ESP32 UUID
          3. Subscribe to Characteristic Notifications
          4. Call handleDataReceived(bleHeight, bleWeight) here automatically
        */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  connectedBtn: {
    backgroundColor: '#0A3327',
  },
  connectBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  connectedBtnText: {
    color: colors.white,
  },
  permissionText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
    paddingHorizontal: 20,
  },
  btn: {
    backgroundColor: colors.primary,
    padding: 15,
    margin: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  scannerSection: {
    flex: 1,
    padding: 20,
  },
  cameraWrapper: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanBox: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: '#00FF00',
    backgroundColor: 'transparent',
    borderRadius: 12,
  },
  scanText: {
    color: colors.white,
    marginTop: 20,
    fontWeight: '700',
    fontSize: 16,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 20,
    elevation: 3,
  },
  studentAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  studentDetails: {
    color: colors.textSecondary,
    marginTop: 4,
  },
  rescanBtn: {
    padding: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
  },
  scaleSection: {
    padding: 20,
    backgroundColor: colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  }
});
