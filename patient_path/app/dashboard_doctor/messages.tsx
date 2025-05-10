import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.93.83:5001';

interface Conversation {
  _id: string;
  otherUserId: string;
  otherUserName: string;
  lastMessage: string;
  lastMessageAt: string;
  appointmentId?: string;
  otherUserRole: string;
}

export default function Chat() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) return;

        const res = await axios.get(`${API_BASE_URL}/api/messages/conversations/${userId}`);
        const uniqueMap: Record<string, Conversation> = {};
        for (const convo of res.data) {
          if (!uniqueMap[convo.otherUserId] ||
              new Date(convo.lastMessageAt) > new Date(uniqueMap[convo.otherUserId].lastMessageAt)) {
            uniqueMap[convo.otherUserId] = convo;
          }
        }
        const sorted = Object.values(uniqueMap).sort(
          (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        );
        setConversations(sorted);
      } catch (err) {
        console.error('Erreur chargement des conversations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  const handlePress = (conversation: Conversation) => {
    router.push({
      pathname: '/dashboard_doctor/ChatScreen', // remplacez par dashboard_doctor/ChatScreen ou dashboard_labo/ChatScreen si besoin
      params: {
        receiverId: conversation.otherUserId,
        receiverName: conversation.otherUserName,
        appointmentId: conversation.appointmentId || '',
      },
    });
  };

  const renderItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity style={styles.chatItem} onPress={() => handlePress(item)}>
      <Text style={styles.chatName}>{item.otherUserName} ({item.otherUserRole})</Text>
      <Text style={styles.preview}>{item.lastMessage}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>💬 Conversations</Text>
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => router.push('/dashboard_doctor/ChatScreen?bot=true')}
      >
        <Text style={styles.chatName}>🤖 Chatbot Médical</Text>
      </TouchableOpacity>
      {loading ? (
        <ActivityIndicator size="large" color="#038A91" />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#FAFAFA', flex: 1 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  chatItem: {
    padding: 12,
    backgroundColor: '#F0F4F8',
    borderRadius: 10,
    marginBottom: 10,
  },
  chatName: { fontSize: 16, fontWeight: '600', color: '#038A91' },
  preview: { color: '#555', marginTop: 4 },
});
