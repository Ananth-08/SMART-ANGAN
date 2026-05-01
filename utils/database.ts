import { Platform } from 'react-native';
import { getMonthCode, getYearCode, generateStudentId } from './studentIdUtils';

const DATABASE_NAME = 'smart_angan.db';

// Conditional import for native only
let SQLite: any = null;
if (Platform.OS !== 'web') {
  SQLite = require('expo-sqlite');
}

export interface Student {
  id?: number;
  student_id?: string;
  first_name: string;
  last_name: string;
  dob: string;
  gender: string;
  profile_image?: string;
  door_number?: string;
  street?: string;
  village?: string;
  zone?: string;
  city?: string;
  state: string;
  pincode?: string;
  father_name?: string;
  father_mobile?: string;
  father_dob?: string;
  father_aadhar?: string;
  mother_name?: string;
  mother_mobile?: string;
  mother_dob?: string;
  mother_aadhar?: string;
  emergency_contact?: string;
  qr_code_data?: string;
  month_code?: string;
  year_code?: string;
  serial_number?: number;
  created_at?: string;
}

// Mock storage for Web to prevent crashes
let webMockStudents: Student[] = [];
let dbInstance: any = null;

const getDb = async () => {
  if (Platform.OS === 'web') return null;
  if (dbInstance) return dbInstance;
  dbInstance = await SQLite.openDatabaseAsync(DATABASE_NAME);
  return dbInstance;
};

export const initDatabase = async () => {
  const db = await getDb();
  if (!db) {
    console.log('SQLite not supported on Web. Using mock storage.');
    return null;
  }

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT UNIQUE,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      dob TEXT,
      gender TEXT,
      profile_image TEXT,
      door_number TEXT,
      street TEXT,
      village TEXT,
      zone TEXT,
      city TEXT,
      state TEXT,
      pincode TEXT,
      father_name TEXT,
      father_mobile TEXT,
      father_dob TEXT,
      father_aadhar TEXT,
      mother_name TEXT,
      mother_mobile TEXT,
      mother_dob TEXT,
      mother_aadhar TEXT,
      emergency_contact TEXT,
      qr_code_data TEXT,
      month_code TEXT,
      year_code TEXT,
      serial_number INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  return db;
};

export const addStudent = async (student: Student) => {
  const now = new Date();
  const monthCode = getMonthCode(now.getMonth());
  const yearCode = getYearCode(now.getFullYear());

  if (Platform.OS === 'web') {
    const newSerial = webMockStudents.length + 1;
    const studentId = generateStudentId(monthCode, yearCode, newSerial);
    const newStudent = { 
      ...student, 
      id: Date.now(), 
      student_id: studentId,
      created_at: now.toISOString()
    };
    webMockStudents.push(newStudent);
    return { id: newStudent.id, student_id: studentId };
  }

  const db = await getDb();
  const latestRecord = await db.getFirstAsync<{ serial_number: number }>(
    'SELECT serial_number FROM students WHERE month_code = ? AND year_code = ? ORDER BY serial_number DESC LIMIT 1',
    [monthCode, yearCode]
  );
  
  const newSerial = (latestRecord?.serial_number || 0) + 1;
  const studentId = generateStudentId(monthCode, yearCode, newSerial);
  
  const values = [
    studentId, 
    student.first_name || '', 
    student.last_name || '', 
    student.dob || null, 
    student.gender || 'Other', 
    student.profile_image || null,
    student.door_number || null, 
    student.street || null, 
    student.village || null, 
    student.zone || null, 
    student.city || null, 
    student.state || 'Tamil Nadu', 
    student.pincode || null,
    student.father_name || null, 
    student.father_mobile || null, 
    student.father_dob || null, 
    student.father_aadhar || null,
    student.mother_name || null, 
    student.mother_mobile || null, 
    student.mother_dob || null, 
    student.mother_aadhar || null,
    student.emergency_contact || null, 
    studentId, 
    monthCode, 
    yearCode, 
    newSerial
  ];

  const safeValues = values.map(v => v === undefined ? null : v);

  try {
    const result = await db.runAsync(
      `INSERT INTO students (
        student_id, first_name, last_name, dob, gender, profile_image,
        door_number, street, village, zone, city, state, pincode,
        father_name, father_mobile, father_dob, father_aadhar,
        mother_name, mother_mobile, mother_dob, mother_aadhar,
        emergency_contact, qr_code_data, month_code, year_code, serial_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      safeValues
    );
    return { id: result.lastInsertRowId, student_id: studentId };
  } catch (error) {
    console.error('Database Insertion Error:', error);
    throw error;
  }
};

export const getStudents = async () => {
  if (Platform.OS === 'web') return [...webMockStudents].reverse();

  const db = await getDb();
  return await db.getAllAsync<Student>('SELECT * FROM students ORDER BY created_at DESC');
};

export const deleteStudent = async (id: number) => {
  if (Platform.OS === 'web') {
    webMockStudents = webMockStudents.filter(s => s.id !== id);
    return;
  }

  const db = await getDb();
  await db.runAsync('DELETE FROM students WHERE id = ?', [id]);
};

export const updateStudent = async (id: number, student: Student) => {
  if (Platform.OS === 'web') {
    const index = webMockStudents.findIndex(s => s.id === id);
    if (index !== -1) {
      webMockStudents[index] = { ...webMockStudents[index], ...student };
    }
    return;
  }

  const db = await getDb();
  await db.runAsync(
    `UPDATE students SET 
      first_name = ?, last_name = ?, dob = ?, gender = ?, profile_image = ?,
      door_number = ?, street = ?, village = ?, zone = ?, city = ?, state = ?, pincode = ?,
      father_name = ?, father_mobile = ?, father_dob = ?, father_aadhar = ?,
      mother_name = ?, mother_mobile = ?, mother_dob = ?, mother_aadhar = ?,
      emergency_contact = ?
    WHERE id = ?`,
    [
      student.first_name, student.last_name, student.dob, student.gender, student.profile_image || null,
      student.door_number || null, student.street || null, student.village || null, student.zone || null, student.city || null, student.state, student.pincode || null,
      student.father_name || null, student.father_mobile || null, student.father_dob || null, student.father_aadhar || null,
      student.mother_name || null, student.mother_mobile || null, student.mother_dob || null, student.mother_aadhar || null,
      student.emergency_contact || null, id
    ]
  );
};
