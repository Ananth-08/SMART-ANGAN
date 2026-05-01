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

    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_db_id INTEGER,
      date TEXT NOT NULL,
      status TEXT NOT NULL,
      UNIQUE(student_db_id, date),
      FOREIGN KEY (student_db_id) REFERENCES students (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS health_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_db_id INTEGER,
      date TEXT NOT NULL,
      height REAL NOT NULL,
      weight REAL NOT NULL,
      z_score REAL,
      status TEXT,
      FOREIGN KEY (student_db_id) REFERENCES students (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS vaccination_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_db_id INTEGER,
      vaccine_name TEXT NOT NULL,
      date TEXT NOT NULL,
      notes TEXT,
      FOREIGN KEY (student_db_id) REFERENCES students (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_db_id INTEGER,
      date TEXT,
      meal_type TEXT,
      FOREIGN KEY(student_db_id) REFERENCES students(id)
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

export const getStudentById = async (id: number) => {
  if (Platform.OS === 'web') return webMockStudents.find(s => s.id === id) || null;

  const db = await getDb();
  return await db.getFirstAsync<Student>('SELECT * FROM students WHERE id = ?', [id]);
};

export const saveAttendance = async (attendanceRecords: { student_db_id: number, date: string, status: string }[]) => {
  if (Platform.OS === 'web') {
    // Mock web attendance if needed
    return;
  }

  const db = await getDb();
  for (const record of attendanceRecords) {
    await db.runAsync(
      'INSERT OR REPLACE INTO attendance (student_db_id, date, status) VALUES (?, ?, ?)',
      [record.student_db_id, record.date, record.status]
    );
  }
};

export const getAttendanceByDate = async (date: string) => {
  if (Platform.OS === 'web') return [];

  const db = await getDb();
  return await db.getAllAsync<{ student_db_id: number, status: string }>(
    'SELECT student_db_id, status FROM attendance WHERE date = ?',
    [date]
  );
};

export const addHealthRecord = async (record: { student_db_id: number, date: string, height: number, weight: number, z_score?: number, status?: string }) => {
  if (Platform.OS === 'web') return;
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO health_records (student_db_id, date, height, weight, z_score, status) VALUES (?, ?, ?, ?, ?, ?)',
    [record.student_db_id, record.date, record.height, record.weight, record.z_score || null, record.status || null]
  );
};

export const getHealthRecords = async (student_db_id: number) => {
  if (Platform.OS === 'web') return [];
  const db = await getDb();
  return await db.getAllAsync<{ id: number, date: string, height: number, weight: number, z_score: number, status: string }>(
    'SELECT * FROM health_records WHERE student_db_id = ? ORDER BY date DESC',
    [student_db_id]
  );
};

export const addVaccinationRecord = async (record: { student_db_id: number, vaccine_name: string, date: string, notes?: string }) => {
  if (Platform.OS === 'web') return;
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO vaccination_records (student_db_id, vaccine_name, date, notes) VALUES (?, ?, ?, ?)',
    [record.student_db_id, record.vaccine_name, record.date, record.notes || null]
  );
};

export const getVaccinationRecords = async (student_db_id: number) => {
  if (Platform.OS === 'web') return [];
  const db = await getDb();
  return await db.getAllAsync<{ id: number, vaccine_name: string, date: string, notes: string }>(
    'SELECT * FROM vaccination_records WHERE student_db_id = ? ORDER BY date DESC',
    [student_db_id]
  );
};

export const addMeal = async (student_db_id: number, meal_type: string) => {
  if (Platform.OS === 'web') return;
  const db = await getDb();
  const dateStr = new Date().toISOString().split('T')[0];
  await db.runAsync(
    'INSERT INTO meals (student_db_id, date, meal_type) VALUES (?, ?, ?)',
    [student_db_id, dateStr, meal_type]
  );
};

export const getMeals = async (student_db_id: number) => {
  if (Platform.OS === 'web') return [];
  const db = await getDb();
  return await db.getAllAsync<{ id: number, date: string, meal_type: string }>(
    'SELECT * FROM meals WHERE student_db_id = ? ORDER BY date DESC',
    [student_db_id]
  );
};

export const getMealsCountByDate = async (date: string) => {
  if (Platform.OS === 'web') return 0;
  const db = await getDb();
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM meals WHERE date = ?',
    [date]
  );
  return result?.count || 0;
};

export const getHealthAlertsCount = async () => {
  if (Platform.OS === 'web') return 0;
  const db = await getDb();
  const result = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM health_records WHERE status IN ('SAM', 'MAM')"
  );
  return result?.count || 0;
};

export const getRecentActivity = async () => {
  if (Platform.OS === 'web') return [];
  const db = await getDb();
  
  const activities = await db.getAllAsync<any>(`
    SELECT 'health' as type, s.first_name || ' ' || s.last_name as student_name, h.date, h.status as detail
    FROM health_records h
    JOIN students s ON h.student_db_id = s.id
    UNION ALL
    SELECT 'vaccine' as type, s.first_name || ' ' || s.last_name as student_name, v.date, v.vaccine_name as detail
    FROM vaccination_records v
    JOIN students s ON v.student_db_id = s.id
    UNION ALL
    SELECT 'meal' as type, s.first_name || ' ' || s.last_name as student_name, m.date, m.meal_type as detail
    FROM meals m
    JOIN students s ON m.student_db_id = s.id
    ORDER BY date DESC LIMIT 8
  `);
  return activities;
};
