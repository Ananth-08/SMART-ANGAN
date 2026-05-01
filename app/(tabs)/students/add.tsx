import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { addStudent, Student } from '../../../utils/database';
import { useToast } from '../../../context/ToastContext';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddStudentScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // Date Picker States
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFatherDatePicker, setShowFatherDatePicker] = useState(false);
  const [showMotherDatePicker, setShowMotherDatePicker] = useState(false);

  const initialFormState: Student = {
    first_name: 'Ananth',
    last_name: 'Kumar',
    dob: '2018-05-15',
    gender: 'Male',
    door_number: '12/A',
    street: 'Gandhi Street',
    village: 'Kodambakkam',
    zone: 'Zone 5',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600024',
    father_name: 'Rajesh',
    father_mobile: '9876543210',
    father_dob: '1985-08-20',
    father_aadhar: '123456789012',
    mother_name: 'Sita',
    mother_mobile: '9876543211',
    mother_dob: '1988-10-12',
    mother_aadhar: '987654321098',
    emergency_contact: '9876543210',
  };

  // Form State
  const [formData, setFormData] = useState<Student>(initialFormState);

  const resetForm = () => {
    setFormData(initialFormState);
    scrollRef.current?.scrollTo({ x: 0, y: 0, animated: true });
  };

  const handleSave = async () => {
    if (!formData.first_name || !formData.last_name) {
      showToast('First and Last name are required', 'error');
      return;
    }

    // Basic Validation
    if (formData.father_mobile && formData.father_mobile.length !== 10) {
      showToast('Father mobile must be 10 digits', 'error');
      return;
    }
    if (formData.mother_mobile && formData.mother_mobile.length !== 10) {
      showToast('Mother mobile must be 10 digits', 'error');
      return;
    }

    setLoading(true);
    try {
      await addStudent(formData);
      showToast('Student added successfully', 'success');
      resetForm();
      router.push('/(tabs)/students');
    } catch (error) {
      console.error(error);
      showToast('Failed to save student', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date, field: keyof Student = 'dob') => {
    setShowDatePicker(false);
    setShowFatherDatePicker(false);
    setShowMotherDatePicker(false);
    
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      setFormData({ ...formData, [field]: dateString });
    }
  };

  const renderInput = (label: string, value: string, key: keyof Student, placeholder: string, keyboardType: any = 'default', maxLength?: number) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={(text) => {
          // Only allow digits for certain keyboards
          if (keyboardType === 'numeric' || keyboardType === 'phone-pad') {
            const cleanText = text.replace(/[^0-9]/g, '');
            setFormData({ ...formData, [key]: cleanText });
          } else {
            setFormData({ ...formData, [key]: text });
          }
        }}
        placeholder={placeholder}
        placeholderTextColor="#999"
        keyboardType={keyboardType}
        maxLength={maxLength}
      />
    </View>
  );

  const renderDatePickerTrigger = (label: string, value: string, onPress: () => void) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity style={styles.input} onPress={onPress}>
        <Text style={{ color: value ? colors.text : '#999', fontSize: 16 }}>
          {value || 'Select Date'}
        </Text>
        <Ionicons name="calendar-outline" size={20} color={colors.primary} style={styles.inputIcon} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Register Student</Text>
        <TouchableOpacity style={styles.backButton} onPress={resetForm}>
          <Ionicons name="refresh-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        ref={scrollRef}
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {/* Section 1: Basic Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Basic Details</Text>
          </View>
          {renderInput('First Name *', formData.first_name, 'first_name', 'Enter first name')}
          {renderInput('Last Name *', formData.last_name, 'last_name', 'Enter last name')}
          {renderDatePickerTrigger('Date of Birth', formData.dob, () => setShowDatePicker(true))}
          
          <Text style={styles.inputLabel}>Gender</Text>
          <View style={styles.genderRow}>
            {['Male', 'Female', 'Other'].map((g) => (
              <TouchableOpacity 
                key={g} 
                style={[styles.genderChip, formData.gender === g && styles.genderChipActive]}
                onPress={() => setFormData({ ...formData, gender: g })}
              >
                <Text style={[styles.genderText, formData.gender === g && styles.genderTextActive]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Section 2: Communication Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Communication Details</Text>
          </View>
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              {renderInput('Door No', formData.door_number || '', 'door_number', 'e.g. 12/A')}
            </View>
            <View style={{ flex: 2 }}>
              {renderInput('Street', formData.street || '', 'street', 'Enter street name')}
            </View>
          </View>
          {renderInput('Village', formData.village || '', 'village', 'Enter village')}
          {renderInput('City', formData.city || '', 'city', 'Enter city')}
          {renderInput('Pincode', formData.pincode || '', 'pincode', '600000', 'numeric', 6)}
        </View>

        {/* Section 3: Guardian Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Guardian Details</Text>
          </View>
          <Text style={styles.subSectionTitle}>Father's Details</Text>
          {renderInput('Name', formData.father_name || '', 'father_name', "Enter father's name")}
          {renderInput('Mobile', formData.father_mobile || '', 'father_mobile', '10 digit mobile', 'phone-pad', 10)}
          {renderDatePickerTrigger('Date of Birth', formData.father_dob || '', () => setShowFatherDatePicker(true))}
          {renderInput('Aadhar', formData.father_aadhar || '', 'father_aadhar', '12 digit aadhar', 'numeric', 12)}

          <View style={styles.divider} />
          
          <Text style={styles.subSectionTitle}>Mother's Details</Text>
          {renderInput('Name', formData.mother_name || '', 'mother_name', "Enter mother's name")}
          {renderInput('Mobile', formData.mother_mobile || '', 'mother_mobile', '10 digit mobile', 'phone-pad', 10)}
          {renderDatePickerTrigger('Date of Birth', formData.mother_dob || '', () => setShowMotherDatePicker(true))}
          {renderInput('Aadhar', formData.mother_aadhar || '', 'mother_aadhar', '12 digit aadhar', 'numeric', 12)}
        </View>

        {/* Section 4: Contact Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="call-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Emergency Contact</Text>
          </View>
          {renderInput('Emergency Number', formData.emergency_contact || '', 'emergency_contact', '10 digit mobile', 'phone-pad', 10)}
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.submitButtonText}>Register Student</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Date Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.dob ? new Date(formData.dob) : new Date()}
          mode="date"
          display="default"
          onChange={(e, d) => onDateChange(e, d, 'dob')}
        />
      )}
      {showFatherDatePicker && (
        <DateTimePicker
          value={formData.father_dob ? new Date(formData.father_dob) : new Date()}
          mode="date"
          display="default"
          onChange={(e, d) => onDateChange(e, d, 'father_dob')}
        />
      )}
      {showMotherDatePicker && (
        <DateTimePicker
          value={formData.mother_dob ? new Date(formData.mother_dob) : new Date()}
          mode="date"
          display="default"
          onChange={(e, d) => onDateChange(e, d, 'mother_dob')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 15,
    paddingBottom: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    ...typography.h3,
    fontSize: 18,
  },
  backButton: {
    padding: 4,
  },
  saveText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  scrollContent: {
    padding: 10,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.text,
    marginLeft: 10,
  },
  subSectionTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 12,
    marginTop: 10,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  genderChipActive: {
    backgroundColor: colors.primary,
  },
  genderText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  genderTextActive: {
    color: colors.white,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 15,
  },
  submitButton: {
    backgroundColor: '#0A3327',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: 16,
  },
});
