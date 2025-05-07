// app/dashboard_medecin/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function DoctorLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="home" options={{ title: 'Accueil', tabBarIcon: () => <Ionicons name="home" size={20} /> }} />
      <Tabs.Screen name="calendar" options={{ title: 'Calendrier', tabBarIcon: () => <Ionicons name="calendar" size={20} /> }} />
      <Tabs.Screen name="pending" options={{ title: 'En attente', tabBarIcon: () => <Ionicons name="time" size={20} /> }} />
      <Tabs.Screen name="upcoming" options={{ title: 'À venir', tabBarIcon: () => <Ionicons name="calendar-outline" size={20} /> }} />
      <Tabs.Screen name="past" options={{ title: 'Historique', tabBarIcon: () => <Ionicons name="archive" size={20} /> }} />
      <Tabs.Screen name="messages" options={{ title: 'Messages', tabBarIcon: () => <Ionicons name="chatbox-ellipses" size={20} /> }} />
      <Tabs.Screen name="labs" options={{ title: 'Laboratoires', tabBarIcon: () => <Ionicons name="flask" size={20} /> }} />
      <Tabs.Screen name="articles" options={{ title: 'Articles', tabBarIcon: () => <Ionicons name="document-text" size={20} /> }} />
      <Tabs.Screen name="reports" options={{ title: 'Rapports', tabBarIcon: () => <Ionicons name="medkit" size={20} /> }} />
    </Tabs>
  );
}
