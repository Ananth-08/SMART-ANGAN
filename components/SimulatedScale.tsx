import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { speakInstruction } from '../utils/audio';

interface SimulatedScaleProps {
  onDataReceived: (height: number, weight: number) => void;
  isConnected: boolean;
  isInfantMode: boolean;
  onToggleInfantMode: (val: boolean) => void;
}

export default function SimulatedScale({ onDataReceived, isConnected, isInfantMode, onToggleInfantMode }: SimulatedScaleProps) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [motherWeight, setMotherWeight] = useState<number | null>(null);

  const simulateReading = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      
      if (!isInfantMode) {
        const mockHeight = parseFloat((Math.random() * (120 - 70) + 70).toFixed(1));
        const mockWeight = parseFloat((Math.random() * (25 - 8) + 8).toFixed(1));
        onDataReceived(mockHeight, mockWeight);
      } else {
        if (step === 1) {
          const mWeight = parseFloat((Math.random() * (80 - 50) + 50).toFixed(1));
          setMotherWeight(mWeight);
          setStep(2);
          speakInstruction('health_drive.infant_mode_baby');
        } else {
          const infantWeight = parseFloat((Math.random() * (15 - 3) + 3).toFixed(1));
          // Pass 0 for height because infant height (length) is measured manually via infantometer
          onDataReceived(0, parseFloat(infantWeight.toFixed(1)));
          setStep(1);
          setMotherWeight(null);
        }
      }
    }, 2000);
  };

  const handleToggleInfantMode = (val: boolean) => {
    onToggleInfantMode(val);
    setStep(1);
    setMotherWeight(null);
  };

  if (!isConnected) {
    return (
      <View style={[styles.container, styles.disconnected]}>
        <Ionicons name="bluetooth-outline" size={32} color="#94A3B8" />
        <Text style={styles.statusText}>Scale Not Connected</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.connected]}>
      <View style={styles.header}>
        <Ionicons name="bluetooth" size={24} color="#2E7D32" />
        <Text style={styles.connectedText}>Smart Scale Connected</Text>
      </View>
      <View style={styles.infantToggleContainer}>
        <Text style={styles.infantToggleText}>Infant Tare Mode (0-2 Yrs)</Text>
        <Switch 
          value={isInfantMode} 
          onValueChange={handleToggleInfantMode} 
          trackColor={{ false: '#CBD5E1', true: '#A5D6A7' }}
          thumbColor={isInfantMode ? '#2E7D32' : '#F8FAFC'}
        />
      </View>
      
      <Text style={styles.instruction}>
        {isSimulating ? "Waiting for stability..." : (isInfantMode ? (step === 1 ? "Step 1: Mother stands alone" : `Step 2: Mother holds infant (Mother: ${motherWeight}kg)`) : "Ready for next child")}
      </Text>

      <TouchableOpacity 
        style={[styles.simulateButton, isSimulating && styles.simulatingButton]} 
        onPress={simulateReading}
        disabled={isSimulating}
      >
        {isSimulating ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <>
            <Ionicons name={isInfantMode ? (step === 1 ? "woman" : "people") : "footsteps"} size={20} color={colors.white} style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>{isInfantMode ? (step === 1 ? "Simulate Mother Weight" : "Simulate Mother + Infant") : "Simulate Child on Scale"}</Text>
          </>
        )}
      </TouchableOpacity>
      <Text style={styles.mockNote}>
        *This simulates the BLE notification from the ESP32 HX711/VL53L0X
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginVertical: 10,
    borderWidth: 1,
  },
  disconnected: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  connected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#A5D6A7',
  },
  statusText: {
    marginTop: 8,
    color: '#64748B',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  connectedText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
    marginLeft: 8,
  },
  instruction: {
    color: '#1B5E20',
    marginBottom: 16,
  },
  simulateButton: {
    backgroundColor: '#0A3327',
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  simulatingButton: {
    backgroundColor: '#475569',
  },
  buttonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  mockNote: {
    fontSize: 10,
    color: '#2E7D32',
    marginTop: 12,
    opacity: 0.8,
    textAlign: 'center',
  },
  infantToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F1F5F9',
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  infantToggleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  }
});
