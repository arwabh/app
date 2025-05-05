import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { colors } from '../../theme';

interface Conversation {
  _id: string;
  doctorId?: {
    _id: string;
    nom: string;
    prenom: string;
    specialty?: string;
  };
  type: 'chatbot' | 'doctor';
}

const API_URL = 'http://192.168.135.83:5001'; // adapte à ton IP mobile si besoin

const Chat = () => {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      const storedId = await AsyncStorage.getItem('userId');
      if (!storedId) return;
      setUserId(storedId);

      try {
        const res = await axios.get(`${API_URL}/api/conversations/${storedId}`);
        setConversations([
          { _id: 'chatbot', type: 'chatbot' },
          ...(res.data as Conversation[]),
        ]);
      } catch (err) {
        console.error('Erreur chargement conversations :', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const goToChat = (conv: Conversation) => {
    if (conv.type === 'chatbot') {
     
    } else {
      router.push({
        pathname: '/dashboard_patient/ChatScreen',
        params: { doctorId: conv.doctorId?._id },
      });
    }
  };

  const renderItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => goToChat(item)}
    >
      <Text style={styles.name}>
        {item.type === 'chatbot'
          ? '🤖 Chatbot Médical'
          : `${item.doctorId?.prenom} ${item.doctorId?.nom}`}
      </Text>
      {item.type === 'doctor' && (
        <Text style={styles.specialty}>
          {item.doctorId?.specialty || 'Spécialité inconnue'}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>💬 Messagerie</Text>
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

export default Chat;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  header: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderColor: colors.border,
    borderWidth: 1,
  },
  name: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '600',
  },
  specialty: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 4,
  },
});
