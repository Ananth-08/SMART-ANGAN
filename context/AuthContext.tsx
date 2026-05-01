import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { encryptData, decryptData } from '../utils/encryption';

interface AuthContextType {
  user: any;
  signIn: (username: string, password: string) => Promise<void>;
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
    // Hardcoded credentials as requested for the demo
    const validUser = 'ananth';
    const validPass = 'Ananth98765';

    if (usernameInput === validUser && passwordInput === validPass) {
      const userData = { username: usernameInput };
      setUser(userData);
      
      // Persist the session using simple encryption
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
