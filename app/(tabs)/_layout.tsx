import React from 'react';
import { Tabs, useRouter, usePathname, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { Platform, StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function TabLayout() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isSettings = pathname === '/settings';

  if (!isLoading && !user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0A3327', // Deep green from image
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: '#F0F0F0',
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginBottom: 2,
        },
        headerShown: true,
        headerTitle: 'SmartAngan',
        headerLeft: () => {
          if (pathname === '/') return null;
          return (
            <TouchableOpacity 
              style={{ marginLeft: 20 }} 
              onPress={() => router.push('/(tabs)')}
            >
              <Ionicons 
                name="chevron-back" 
                size={28} 
                color="#0A3327" 
              />
            </TouchableOpacity>
          );
        },
        headerRight: () => (
          <TouchableOpacity style={{ marginRight: 20 }}>
            <Image 
              source={{ uri: 'https://i.pravatar.cc/100?u=anjali' }} 
              style={{ width: 36, height: 36, borderRadius: 18 }} 
            />
          </TouchableOpacity>
        ),
        headerStyle: {
          backgroundColor: colors.white,
        },
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 20,
          color: '#0A3327',
        },
        headerShadowVisible: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="students"
        options={{
          title: 'Students',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'people' : 'people-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'chatbox' : 'chatbox-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}


