import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Home from './Home';
import Documents from './Documents';
import Appointments from './Appointments';
import Chat from './Chat';
import Notifications from './Notification';
import Profile from './Profile';

import { colors } from '../../theme'; // ta palette pastel

const DashboardIndex = () => {
  const [activeScreen, setActiveScreen] = useState<'home' | 'documents' | 'appointments' | 'chat' | 'notifications' | 'profile'>('home');
  const [menuVisible, setMenuVisible] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  const router = useRouter();

  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':
        return <Home />;
      case 'documents':
        return <Documents />;
      case 'appointments':
        return <Appointments />;
      case 'chat':
        return <Chat />;
      case 'notifications':
        return <Notifications />;
      case 'profile':
        return <Profile />;
      default:
        return <Home />;
    }
  };

  const handleLogout = () => {
    router.replace('/login'); // redirige vers login
  };

  return (
    <View style={styles.container}>
      {/* Drawer Button */}
      <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(true)}>
        <Ionicons name="menu" size={24} color={colors.primary} />
      </TouchableOpacity>

      {/* Main screen */}
      <View style={styles.screenContainer}>{renderScreen()}</View>

      {/* Drawer Menu */}
      <Modal visible={menuVisible} transparent animationType="slide">
        <View style={styles.drawerOverlay}>
          <View style={styles.drawer}>
          <TouchableOpacity
  onPress={() => setShowDrawer(true)}
  style={{
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 999,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    elevation: 4,
  }}
>
  <Ionicons name="menu" size={24} color={colors.primary} />
</TouchableOpacity>

            <TouchableOpacity onPress={() => setMenuVisible(false)} style={styles.closeButton}>
              <Ionicons name="close" size={26} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.drawerItem} onPress={() => { setActiveScreen('home'); setMenuVisible(false); }}>
              <Text style={styles.drawerText}>🏠 Accueil</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.drawerItem} onPress={() => { setActiveScreen('documents'); setMenuVisible(false); }}>
              <Text style={styles.drawerText}>📄 Documents</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.drawerItem} onPress={() => { setActiveScreen('appointments'); setMenuVisible(false); }}>
              <Text style={styles.drawerText}>📅 Rendez-vous</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.drawerItem} onPress={() => { setActiveScreen('chat'); setMenuVisible(false); }}>
              <Text style={styles.drawerText}>💬 Messagerie</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.drawerItem} onPress={() => { setActiveScreen('notifications'); setMenuVisible(false); }}>
              <Text style={styles.drawerText}>🔔 Notifications</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.drawerItem} onPress={() => { setActiveScreen('profile'); setMenuVisible(false); }}>
              <Text style={styles.drawerText}>👤 Mon Profil</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>🚪 Déconnexion</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Stack for status bar handling */}
      <Stack.Screen options={{ headerShown: false }} />
    </View>
  );
};

export default DashboardIndex;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenContainer: {
    flex: 1,
  },
  menuButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: 8,
    elevation: 5,
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: '#00000088',
    flexDirection: 'row',
  },
  drawer: {
    width: 250,
    backgroundColor: colors.surface,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  drawerItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  drawerText: {
    fontSize: 16,
    color: colors.text,
  },
  logoutButton: {
    marginTop: 30,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  logoutText: {
    color: 'red',
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: -10,
    padding: 10,
  },
});
