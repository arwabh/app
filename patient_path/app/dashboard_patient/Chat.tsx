import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.96.83:5001';

type Conversation = {
  _id: string;
  otherUserId: string;
  otherUserName: string;
  lastMessage: string;
  lastMessageAt: string;
  appointmentId: string;
  otherUserRole: string;
};

const Chat = () => {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await axios.get<Conversation[]>(`${API_BASE_URL}/api/messages/conversations/${userId}`);

        // Supprimer les doublons par otherUserId
        const uniqueMap: Record<string, Conversation> = {};
        for (const convo of res.data) {
          if (!uniqueMap[convo.otherUserId] ||
              new Date(convo.lastMessageAt) > new Date(uniqueMap[convo.otherUserId].lastMessageAt)) {
            uniqueMap[convo.otherUserId] = convo;
          }
        }

        // Convertir en tableau et trier
        const uniqueConversations = Object.values(uniqueMap).sort((a, b) =>
          new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        );

        setConversations(uniqueConversations);
      } catch (error) {
        console.error('Erreur chargement des conversations', error);
      }
    };

    fetchConversations();
  }, []);

  const handleChatPress = (conversation: Conversation) => {
    router.push({
      pathname: '/dashboard_patient/chatScreen',
      params: {
        appointmentId: conversation.appointmentId,
        receiverId: conversation.otherUserId,
        receiverName: conversation.otherUserName,
      },
    });
  };

  const renderName = (c: Conversation) => {
    const role = c.otherUserRole?.toLowerCase();
    if (role === 'doctor') return `Dr. ${c.otherUserName}`;
    if (role === 'labs') return `Laboratoire de : ${c.otherUserName}`;
    return c.otherUserName;
  };

  const renderItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity style={styles.chatItem} onPress={() => handleChatPress(item)}>
      <Text style={styles.chatName}>{renderName(item)}</Text>
      <Text style={styles.preview}>{item.lastMessage}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>💬 Chatbot & Conversations</Text>

      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => router.push('/dashboard_patient/ChatScreen?bot=true')}
      >
        <Text style={styles.chatName}>🤖 Chatbot Médical</Text>
      </TouchableOpacity>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
      />
    </View>
  );
};

export default Chat;

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
