import React from 'react';
import { Drawer } from 'expo-router/drawer';

export default function PatientLayout() {
  return (
    <Drawer>
      <Drawer.Screen name="home" options={{ title: 'Accueil' }} />
      <Drawer.Screen name="appointments" options={{ title: 'Rendez-vous' }} />
      <Drawer.Screen name="searchDoctor" options={{ title: 'Recherche' }} />
      <Drawer.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Drawer.Screen name="chat" options={{ title: 'Chat' }} />
      <Drawer.Screen name="profile" options={{ title: 'Profil' }} />
      <Drawer.Screen name="logout" options={{ title: 'Déconnexion' }} />
    </Drawer>
  );
}
