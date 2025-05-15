import React, { useEffect, useState } from 'react';
import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const API_BASE_URL = 'http://192.168.122.83:5001';

export default function CabinetLayout() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace('/login');
  };

  
  const menuItems = [
    { name: 'home', label: 'Accueil', icon: 'home-outline' },
    { name: 'pendingRequests', label: 'Demandes en attente', icon: 'clock-alert-outline' },
    { name: 'confirmedAppointments', label: 'Rendez-vous confirmés', icon: 'calendar-check-outline' },
    { name: 'settings/SettingsScreen', label: 'Paramètres', icon: 'cog-outline' },
  ];

  return (
    <Drawer
      screenOptions={{
        drawerStyle: { backgroundColor: '#0a3d62' },
        headerTintColor: '#fff',
        headerStyle: { backgroundColor: '#0a3d62' },
        drawerActiveTintColor: '#fff',
        drawerInactiveTintColor: '#d1d1d1',
      }}
      drawerContent={(props) => (
        <DrawerContentScrollView {...props} style={{ backgroundColor: '#0a3d62' }}>
          {menuItems.map((item) => (
            <DrawerItem
              key={item.name}
              label={item.label}
              labelStyle={styles.label}
              icon={({ color, size }) => <Icon name={item.icon} size={size} color={color} />}
              onPress={() => {
                
                  router.push(`/dashboard_cabinet/${item.name}`);
                
              }}
            />
          ))}
          <DrawerItem
            label="Se déconnecter"
            labelStyle={[styles.label, { color: '#FF4D4D' }]}
            icon={({ size }) => <Icon name="logout" size={size} color="#FF4D4D" />}
            onPress={handleLogout}
          />
        </DrawerContentScrollView>
      )}
    >
      {menuItems.map((item) => (
        <Drawer.Screen key={item.name} name={item.name} options={{ title: item.label }} />
      ))}
    </Drawer>
  );
}

const styles = StyleSheet.create({
  label: {
    fontWeight: 'bold',
    color: '#fff',
  },
});
