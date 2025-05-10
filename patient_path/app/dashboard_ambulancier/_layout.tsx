import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AmbulancierLayout() {
  const router = useRouter();

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace('/login');
  };

  const menuItems = [
    { name: 'home', label: 'Accueil' },
    { name: 'vehicule', label: 'Véhicule' },
    { name: 'position', label: 'Position' },
  ];

  return (
    <Drawer
      drawerContent={(props) => (
        <DrawerContentScrollView {...props}>
          {menuItems.map((item) => (
            <DrawerItem
              key={item.name}
              label={item.label}
              onPress={() => router.push(`/dashboard_ambulancier/${item.name}`)}
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
