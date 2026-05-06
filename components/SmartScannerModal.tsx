import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface SmartScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScanComplete: (scannedHeight: string) => void;
}

export default function SmartScannerModal({ visible, onClose, onScanComplete }: SmartScannerModalProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [scanAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible && isScanning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnimation, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnimation, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          })
        ])
      ).start();
    } else {
      scanAnimation.setValue(0);
    }
  }, [visible, isScanning]);

  if (!visible) return null;

  if (!permission) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.content}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </View>
      </Modal>
    );
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.permissionCard}>
            <Ionicons name="camera-outline" size={48} color={colors.primary} />
            <Text style={styles.permissionTitle}>Camera Access Required</Text>
            <Text style={styles.permissionDesc}>We need camera access to scan the height chart.</Text>
            <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  const handleCapture = () => {
    setIsScanning(true);
    
    // Simulate OCR processing delay (2 seconds)
    setTimeout(() => {
      setIsScanning(false);
      // Simulate reading a height from the wall chart (e.g., 85.5 cm)
      // In a real app, the ML model would extract this from the frame
      const mockScannedHeight = (Math.random() * (110 - 70) + 70).toFixed(1); 
      onScanComplete(mockScannedHeight);
    }, 2500);
  };

  const translateY = scanAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300] // Height of the scanning box
  });

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
            <Ionicons name="close" size={28} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Height Scanner</Text>
          <View style={{ width: 28 }} />
        </View>

        <CameraView style={styles.camera} facing="back">
          <View style={styles.overlayContainer}>
            <View style={styles.targetBox}>
              {/* Corner brackets */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />

              {isScanning && (
                <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />
              )}
            </View>
            <Text style={styles.instructionText}>
              {isScanning ? "Extracting measurements..." : "Align the top of the child's head with the chart number"}
            </Text>
          </View>
        </CameraView>

        <View style={styles.footer}>
          {isScanning ? (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color={colors.white} />
              <Text style={styles.processingText}>Processing OCR & AR data...</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
              <View style={styles.captureInner} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
  },
  closeIcon: {
    padding: 8,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.white,
  },
  camera: {
    flex: 1,
  },
  overlayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)', // Dim the background
  },
  targetBox: {
    width: 250,
    height: 300,
    backgroundColor: 'transparent',
    position: 'relative',
    marginBottom: 40,
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#00FF00',
  },
  topLeft: {
    top: 0, left: 0,
    borderTopWidth: 4, borderLeftWidth: 4,
  },
  topRight: {
    top: 0, right: 0,
    borderTopWidth: 4, borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0, left: 0,
    borderBottomWidth: 4, borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0, right: 0,
    borderBottomWidth: 4, borderRightWidth: 4,
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 3,
    backgroundColor: '#00FF00',
    shadowColor: '#00FF00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  instructionText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 40,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 10,
    borderRadius: 8,
  },
  footer: {
    height: 150,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.white,
  },
  processingContainer: {
    alignItems: 'center',
  },
  processingText: {
    color: colors.white,
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 40,
    backgroundColor: colors.white,
    borderRadius: 20,
  },
  permissionCard: {
    backgroundColor: colors.white,
    padding: 30,
    borderRadius: 24,
    alignItems: 'center',
    width: '85%',
  },
  permissionTitle: {
    ...typography.h3,
    marginTop: 16,
    marginBottom: 8,
  },
  permissionDesc: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  permissionButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  cancelButton: {
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontWeight: '600',
  }
});
