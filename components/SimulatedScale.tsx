import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface SimulatedScaleProps {
  onDataReceived: (height: number, weight: number) => void;
  isConnected: boolean;
}

export default function SimulatedScale({ onDataReceived, isConnected }: SimulatedScaleProps) {
  const [isSimulating, setIsSimulating] = useState(false);

  const simulateReading = () => {
    setIsSimulating(true);
    // Simulate real-world delay of a child stepping on scale and it stabilizing
    setTimeout(() => {
      // Generate some realistic numbers
      const mockHeight = parseFloat((Math.random() * (120 - 70) + 70).toFixed(1));
      const mockWeight = parseFloat((Math.random() * (25 - 8) + 8).toFixed(1));
      
      setIsSimulating(false);
      onDataReceived(mockHeight, mockWeight);
    }, 2000);
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
      
      <Text style={styles.instruction}>
        {isSimulating ? "Waiting for stability..." : "Ready for next child"}
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
            <Ionicons name="footsteps" size={20} color={colors.white} style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>Simulate Child on Scale</Text>
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
  }
});
