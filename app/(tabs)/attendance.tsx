import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, Platform, TextInput } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { getStudents, Student, saveAttendance, getAttendanceByDate } from '../../utils/database';
import { useToast } from '../../context/ToastContext';
import DateTimePicker from '@react-native-community/datetimepicker';

interface AttendanceRecord {
  student_db_id: number;
  status: 'Present' | 'Absent';
}

export default function AttendanceScreen() {
  const { showToast } = useToast();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<number, 'Present' | 'Absent'>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const dateString = selectedDate.toISOString().split('T')[0];

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [dateString])
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const studentList = await getStudents();
      const attendanceData = await getAttendanceByDate(dateString);
      
      const attendanceMap: Record<number, 'Present' | 'Absent'> = {};
      studentList.forEach(s => {
        attendanceMap[s.id!] = 'Absent';
      });
      
      attendanceData.forEach(record => {
        attendanceMap[record.student_db_id] = record.status as 'Present' | 'Absent';
      });

      setStudents(studentList);
      setFilteredStudents(studentList);
      setAttendance(attendanceMap);
    } catch (error) {
      console.error(error);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(s => 
        s.first_name.toLowerCase().includes(query.toLowerCase()) || 
        s.last_name.toLowerCase().includes(query.toLowerCase()) ||
        s.student_id.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  };

  const toggleAttendance = (id: number) => {
    setAttendance(prev => ({
      ...prev,
      [id]: prev[id] === 'Present' ? 'Absent' : 'Present'
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const records = Object.entries(attendance).map(([id, status]) => ({
        student_db_id: Number(id),
        date: dateString,
        status
      }));
      await saveAttendance(records);
      showToast('Attendance saved successfully', 'success');
    } catch (error) {
      showToast('Failed to save attendance', 'error');
    } finally {
      setSaving(false);
    }
  };

  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const renderStudentItem = ({ item }: { item: Student }) => {
    const isPresent = attendance[item.id!] === 'Present';
    return (
      <View style={styles.studentCard}>
        <View style={styles.studentInfo}>
          {item.profile_image ? (
            <Image source={{ uri: item.profile_image }} style={styles.avatar} />
          ) : (
            <View style={styles.placeholderAvatar}>
              <Ionicons name="person" size={20} color={colors.primary} />
            </View>
          )}
          <View style={styles.nameContainer}>
            <Text style={styles.nameText}>{item.first_name} {item.last_name}</Text>
            <Text style={styles.idText}>{item.student_id}</Text>
          </View>
        </View>
        
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={[styles.statusButton, isPresent ? styles.presentButton : styles.absentButton]}
            onPress={() => toggleAttendance(item.id!)}
          >
            <Text style={[styles.statusText, isPresent ? styles.presentText : styles.absentText]}>
              {isPresent ? 'Present' : 'Absent'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Custom Header in Screen */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.dateSelector} onPress={() => setShowDatePicker(true)}>
          <Ionicons name="calendar-outline" size={20} color={colors.primary} />
          <Text style={styles.dateText}>{selectedDate.toDateString()}</Text>
          <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.scanButton}
          onPress={() => router.push('/attendance/scan')}
        >
          <Ionicons name="qr-code-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search students..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#94A3B8"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <View style={{ flex: 1 }}>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Total</Text>
              <Text style={styles.statValue}>{students.length}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Present</Text>
              <Text style={[styles.statValue, { color: '#2E7D32' }]}>
                {Object.values(attendance).filter(v => v === 'Present').length}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Absent</Text>
              <Text style={[styles.statValue, { color: colors.error }]}>
                {Object.values(attendance).filter(v => v === 'Absent').length}
              </Text>
            </View>
          </View>

          <FlatList
            data={filteredStudents}
            renderItem={renderStudentItem}
            keyExtractor={item => item.id!.toString()}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={60} color="#DDD" />
                <Text style={styles.emptyText}>{searchQuery ? 'No matching students' : 'No students to show'}</Text>
              </View>
            }
          />

          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={20} color={colors.white} />
                  <Text style={styles.saveButtonText}>Save Attendance</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onDateChange}
          maximumDate={new Date()}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginTop: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    height: 44,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
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
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  scanButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F0F9F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  studentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  placeholderAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nameContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  idText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  actionContainer: {
    marginLeft: 12,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 85,
    alignItems: 'center',
  },
  presentButton: {
    backgroundColor: '#E8F5E9',
  },
  absentButton: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '800',
  },
  presentText: {
    color: '#2E7D32',
  },
  absentText: {
    color: colors.error,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  saveButton: {
    backgroundColor: '#0A3327',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
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
