import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { encryptData, decryptData } from '../utils/encryption';
import { findStudentByParentMobile } from '../utils/database';

interface AuthContextType {
  user: any;
  signIn: (username: string, password: string) => Promise<void>;
  signInAsParent: (mobile: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved user on app start
    const loadStorageData = async () => {
      try {
        const authDataSerialized = await AsyncStorage.getItem('@AuthData');
        if (authDataSerialized) {
          const decryptedUser = decryptData(authDataSerialized);
          if (decryptedUser) {
            setUser(JSON.parse(decryptedUser));
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    loadStorageData();
  }, []);

  const signIn = async (usernameInput: string, passwordInput: string) => {
    // Hardcoded credentials for Admin/Staff
    const validUser = 'ananth';
    const validPass = 'Ananth98765';

    if (usernameInput === validUser && passwordInput === validPass) {
      const userData = { 
        username: usernameInput, 
        role: 'admin',
        name: 'Ananth M'
      };
      setUser(userData);
      
      const encryptedUserData = encryptData(JSON.stringify(userData));
      await AsyncStorage.setItem('@AuthData', encryptedUserData);
    } else {
      throw new Error('Invalid username or password');
    }
  };

  const signInAsParent = async (mobile: string) => {
    const student = await findStudentByParentMobile(mobile);
    if (student) {
      const userData = {
        username: mobile,
        role: 'parent',
        studentId: student.id,
        studentName: `${student.first_name} ${student.last_name}`,
        name: student.father_name || student.mother_name || 'Parent'
      };
      setUser(userData);
      
      const encryptedUserData = encryptData(JSON.stringify(userData));
      await AsyncStorage.setItem('@AuthData', encryptedUserData);
    } else {
      throw new Error('Mobile number not registered with any student');
    }
  };

  const signOut = async () => {
    setUser(null);
    await AsyncStorage.removeItem('@AuthData');
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signInAsParent, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
