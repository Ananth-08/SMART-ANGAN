import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { encryptData, decryptData } from '../utils/encryption';

interface AuthContextType {
  user: any;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

// Hardcoded encrypted credentials
const HARDCODED_USER_ENC = "U2FsdGVkX1/DtBaFPKCjTc/iWFLmBGEbYyvBZJACrSk=";
const HARDCODED_PASS_ENC = "U2FsdGVkX18Tr+rGjJ2w+gFsoFA7z9Xrmgc8wELnu9U=";

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

  const signIn = async (username: string, password: string) => {
    // Decrypt hardcoded credentials for comparison
    const validUser = decryptData(HARDCODED_USER_ENC);
    const validPass = decryptData(HARDCODED_PASS_ENC);

    if (username === validUser && password === validPass) {
      const userData = { username };
      setUser(userData);
      const encryptedUserData = encryptData(JSON.stringify(userData));
      await AsyncStorage.setItem('@AuthData', encryptedUserData);
    } else {
      throw new Error('Invalid username or password');
    }
  };

  const signOut = async () => {
    setUser(null);
    await AsyncStorage.removeItem('@AuthData');
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, isLoading }}>
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
