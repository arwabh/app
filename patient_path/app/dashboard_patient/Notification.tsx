
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { colors } from '../../theme';

const API_BASE_URL = 'http://192.168.135.83:5001';

interface Notification {
  _id: string;
  message: string;
  createdAt: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const storedId = localStorage.getItem('userId');
    if (storedId) {
      setUserId(storedId);
      fetchNotifications(storedId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchNotifications = async (id: string) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/notifications/${id}`);
      setNotifications(res.data as Notification[]);
    } catch (error) {
      console.error("❌ Erreur notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <View style={styles.card}>
      <Text style={styles.message}>{item.message}</Text>
      <Text style={styles.date}>{new Date(item.createdAt).toLocaleString('fr-FR')}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔔 Mes notifications</Text>
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : notifications.length === 0 ? (
        <Text style={styles.empty}>Aucune notification pour l'instant.</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderColor: colors.border,
    borderWidth: 1,
  },
  message: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: colors.muted,
  },
  empty: {
    textAlign: 'center',
    color: colors.muted,
    marginTop: 20,
  },
});
