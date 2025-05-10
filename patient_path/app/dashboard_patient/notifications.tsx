import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Notification {
  _id: string;
  message: string;
  date: string;
  read: boolean;
}

const API_BASE_URL = 'http://192.168.93.83:5001';

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const res = await axios.get(`${API_BASE_URL}/api/notifications/${userId}`);
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Erreur chargement des notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await axios.put(`${API_BASE_URL}/api/notifications/${id}`);
      setNotifications(prev =>
        prev.map(notif => notif._id === id ? { ...notif, read: true } : notif)
      );
    } catch (err) {
      console.error('Erreur mise à jour notification :', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n._id);
      await Promise.all(unreadIds.map(id =>
        axios.put(`${API_BASE_URL}/api/notifications/${id}`)
      ));

      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );

      Alert.alert('✅ Succès', 'Toutes les notifications sont maintenant marquées comme lues.');
    } catch (err) {
      console.error('Erreur lors du marquage des notifications :', err);
      Alert.alert('❌ Erreur', 'Impossible de marquer toutes les notifications comme lues.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text>Chargement des notifications...</Text>
      </View>
    );
  }

  if (notifications.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.noNotif}>📢 Aucune notification pour l’instant</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🔔 Notifications</Text>

      <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
        <Text style={styles.markAllText}>✅ Marquer tout comme lu</Text>
      </TouchableOpacity>

      {notifications.map((notif) => {
        const dateObj = new Date(notif.date);
        const isValidDate = !isNaN(dateObj.getTime());

        return (
          <TouchableOpacity
            key={notif._id}
            onPress={() => markAsRead(notif._id)}
            style={[
              styles.card,
              {
                borderLeftColor: notif.read ? '#2ecc71' : '#e74c3c',
                borderLeftWidth: 5
              }
            ]}
          >
            <Text style={styles.message}>📩 {notif.message}</Text>
            <Text style={styles.date}>
              📅 {isValidDate
                ? formatDistanceToNow(dateObj, { addSuffix: true, locale: fr })
                : 'Date inconnue'}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  noNotif: { fontSize: 18, color: '#333' },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  message: { fontSize: 16, marginBottom: 6 },
  date: { fontSize: 14, color: '#666' },
  markAllButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
    backgroundColor: '#2ecc71',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  markAllText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
