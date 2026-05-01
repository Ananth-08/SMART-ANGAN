import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { getStudents, Student, deleteStudent } from '../../../utils/database';
import { useToast } from '../../../context/ToastContext';
import QRCode from 'react-native-qrcode-svg';
import { useTranslation } from 'react-i18next';

export default function StudentsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { showToast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchStudents = async () => {
    try {
      const data = await getStudents();
      setStudents(data);
      setFilteredStudents(data);
    } catch (error) {
      console.error(error);
      showToast(t('common.no_data'), 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

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

  const onRefresh = () => {
    setRefreshing(true);
    fetchStudents();
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteStudent(id);
      showToast(t('students.delete'), 'info');
      fetchStudents();
    } catch (error) {
      showToast('Delete failed', 'error');
    }
  };

  const renderStudentItem = ({ item }: { item: Student }) => (
    <View style={styles.studentCard}>
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={() => router.push(`/(tabs)/students/${item.id}`)}
      >
        <View style={styles.cardMain}>
          <View style={styles.avatarContainer}>
            {item.profile_image ? (
              <Image source={{ uri: item.profile_image }} style={styles.avatar} />
            ) : (
              <Ionicons name="person" size={30} color={colors.primary} />
            )}
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.nameText}>{item.first_name} {item.last_name}</Text>
            <Text style={styles.idText}>{item.student_id}</Text>
            <View style={styles.tagRow}>
              <View style={styles.genderTag}>
                <Text style={styles.tagText}>{item.gender}</Text>
              </View>
              <View style={styles.cityTag}>
                <Text style={styles.tagText}>{item.city || 'No City'}</Text>
              </View>
            </View>
          </View>
          <View style={styles.qrContainer}>
            <QRCode
              value={item.student_id || ''}
              size={40}
              color="#000"
              backgroundColor="transparent"
            />
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.cardFooter}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item.id!)}>
          <Ionicons name="trash-outline" size={18} color={colors.error} />
          <Text style={[styles.actionText, { color: colors.error }]}>{t('students.delete')}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push(`/(tabs)/students/edit/${item.id}`)}
        >
          <Ionicons name="create-outline" size={18} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>{t('students.edit')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('students.search_placeholder')}
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
          <FlatList
            data={filteredStudents}
            renderItem={renderStudentItem}
            keyExtractor={(item) => item.id!.toString()}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={80} color="#DDD" />
                <Text style={styles.emptyText}>{searchQuery ? t('common.no_data') : t('common.no_data')}</Text>
                {!searchQuery && (
                  <TouchableOpacity
                    style={styles.emptyAddButton}
                    onPress={() => router.push('/(tabs)/students/add')}
                  >
                    <Text style={styles.emptyAddText}>{t('students.add_student')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />

          {/* FAB */}
          <TouchableOpacity
            style={styles.fab}
            onPress={() => router.push('/(tabs)/students/add')}
          >
            <Ionicons name="add" size={30} color={colors.white} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    height: 50,
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
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#0A3327',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  studentCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  infoContainer: {
    flex: 1,
  },
  nameText: {
    ...typography.body,
    fontWeight: '700',
    fontSize: 17,
    color: colors.text,
  },
  idText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  tagRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  genderTag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cityTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  qrContainer: {
    padding: 4,
    backgroundColor: colors.white,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    gap: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 20,
  },
  emptyAddButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  emptyAddText: {
    color: colors.primary,
    fontWeight: '700',
  },
});
