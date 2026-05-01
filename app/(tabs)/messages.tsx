import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, Alert, Linking, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { getStudents, Student, getAttendanceByDate } from '../../utils/database';
import { useToast } from '../../context/ToastContext';
import * as SMS from 'expo-sms';

export default function MessagesScreen() {
  const { showToast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<number, string>>({});
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  const fetchData = async () => {
    setLoading(true);
    try {
      const studentList = await getStudents();
      const attendanceData = await getAttendanceByDate(today);
      
      const attendanceMap: Record<number, string> = {};
      attendanceData.forEach(record => {
        attendanceMap[record.student_db_id] = record.status;
      });

      setStudents(studentList);
      setAttendance(attendanceMap);
    } catch (error) {
      console.error(error);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === students.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(students.map(s => s.id!)));
    }
  };

  const handleSendSMS = () => {
    if (selectedIds.size === 0) {
      showToast('Select at least one student', 'info');
      return;
    }

    Alert.alert(
      "Send SMS Update",
      "Which group would you like to message?",
      [
        {
          text: "Present Students",
          onPress: () => sendBulkSMS('Present')
        },
        {
          text: "Absent Students",
          onPress: () => sendBulkSMS('Absent')
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  const sendBulkSMS = async (status: 'Present' | 'Absent') => {
    const selectedStudents = students.filter(s => selectedIds.has(s.id!) && attendance[s.id!] === status);
    
    if (selectedStudents.length === 0) {
      showToast(`No selected students are marked as ${status}`, 'info');
      return;
    }

    const phoneNumbers = selectedStudents
      .map(s => s.father_mobile || s.mother_mobile)
      .filter(p => !!p) as string[];

    if (phoneNumbers.length === 0) {
      showToast('No phone numbers available for selected group', 'error');
      return;
    }

    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      const message = status === 'Present' 
        ? "Dear Parent, your child was present at SmartAngan today. Thank you!"
        : "Dear Parent, your child was absent at SmartAngan today. Please ensure regular attendance.";
      
      await SMS.sendSMSAsync(phoneNumbers, message);
    } else {
      showToast('SMS service not available on this device', 'error');
    }
  };

  const handleCall = (phoneNumber?: string) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    } else {
      showToast('Phone number not available', 'error');
    }
  };

  const renderStudentItem = ({ item }: { item: Student }) => {
    const isSelected = selectedIds.has(item.id!);
    const status = attendance[item.id!] || 'Not Marked';
    
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.first_name[0]}{item.last_name[0]}
            </Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{item.first_name} {item.last_name}</Text>
            <Text style={styles.guardian}>Guardian: {item.father_name || item.mother_name || 'N/A'}</Text>
            <View style={[styles.statusBadge, status === 'Present' ? styles.presentBadge : styles.absentBadge]}>
              <Text style={[styles.statusText, status === 'Present' ? styles.presentText : styles.absentText]}>
                {status}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => toggleSelect(item.id!)} style={styles.checkbox}>
            <Ionicons 
              name={isSelected ? "checkbox" : "square-outline"} 
              size={26} 
              color={isSelected ? colors.primary : colors.border} 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={styles.callButton} 
            onPress={() => handleCall(item.father_mobile || item.mother_mobile)}
          >
            <Ionicons name="call" size={18} color={colors.white} />
            <Text style={styles.callButtonText}>Call Parent</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.smsButton}
            onPress={async () => {
              const phone = item.father_mobile || item.mother_mobile;
              if (phone) {
                const isAvailable = await SMS.isAvailableAsync();
                if (isAvailable) {
                  await SMS.sendSMSAsync([phone], `Hello, update regarding ${item.first_name}...`);
                }
              } else {
                showToast('Phone number not available', 'error');
              }
            }}
          >
            <Ionicons name="mail-outline" size={18} color={colors.primary} />
            <Text style={styles.smsButtonText}>SMS</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.multiSelectRow} onPress={toggleSelectAll}>
          <Ionicons 
            name={selectedIds.size === students.length && students.length > 0 ? "checkbox" : "square-outline"} 
            size={24} 
            color={colors.primary} 
          />
          <Text style={styles.multiSelectText}>Select All</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sendSmsButton} onPress={handleSendSMS}>
          <Ionicons name="send" size={18} color={colors.white} />
          <Text style={styles.sendSmsText}>Send SMS</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={students}
          renderItem={renderStudentItem}
          keyExtractor={item => item.id!.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={60} color="#DDD" />
              <Text style={styles.emptyText}>No students to message</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  multiSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  multiSelectText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  sendSmsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A3327',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
  },
  sendSmsText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E7D32',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  guardian: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  checkbox: {
    padding: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 6,
  },
  presentBadge: {
    backgroundColor: '#E8F5E9',
  },
  absentBadge: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  presentText: {
    color: '#2E7D32',
  },
  absentText: {
    color: colors.error,
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A3327',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  callButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  smsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  smsButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: 15,
  },
});
