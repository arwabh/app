import React, { useEffect, useState } from 'react';
import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Text } from 'react-native';

const API_BASE_URL = 'http://192.168.93.83:5001';

export default function PatientLayout() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace('/login');
  };

  const fetchUnreadNotifications = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;
      const res = await axios.get(`${API_BASE_URL}/api/notifications/${userId}`);
      const unread = res.data.filter((n: any) => !n.read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Erreur badge notifications :', err);
    }
  };

  useEffect(() => {
    fetchUnreadNotifications();

    // Optionnel : mettre à jour toutes les 15 secondes
    const interval = setInterval(fetchUnreadNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { name: 'home', label: 'Accueil' },
    { name: 'profile', label: 'Documents' },
    { name: 'searchDoctor', label: 'Recherche' },
    { name: 'appointments', label: 'Rendez-vous' },
    {
      name: 'notifications',
      label: unreadCount > 0
        ? `Notifications (${unreadCount})`
        : 'Notifications'
    },
    { name: 'chat', label: 'Messages' },
  ];

  return (
    <Drawer
      drawerContent={(props) => (
        <DrawerContentScrollView {...props}>
          {menuItems.map((item) => (
            <DrawerItem
              key={item.name}
              label={item.label}
              onPress={() => router.push(`/dashboard_patient/${item.name}`)}
            />
          ))}
          <DrawerItem
            label="Déconnexion"
            onPress={handleLogout}
            labelStyle={{ color: 'red', fontWeight: 'bold' }}
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
