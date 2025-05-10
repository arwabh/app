import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, ActivityIndicator
} from 'react-native';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.93.83:5001';

type Message = {
  _id?: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt?: string;
};

const ChatScreen = () => {
  const scrollRef = useRef<ScrollView | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const { receiverId, receiverName } = useLocalSearchParams<{ receiverId: string; receiverName: string }>();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      const id = await AsyncStorage.getItem('userId');
      if (!id || !receiverId) return;

      setUserId(id);
      await fetchMessages(id, receiverId);
    };

    initialize();
  }, [receiverId]);

  const fetchMessages = async (senderId: string, receiverId: string) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/messages/${senderId}/${receiverId}`);
      const sorted = res.data.sort((a: Message, b: Message) =>
        new Date(a.createdAt ?? '').getTime() - new Date(b.createdAt ?? '').getTime()
      );
      setMessages(sorted);
    } catch (error) {
      console.error('Erreur chargement messages', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !userId || !receiverId) return;

    try {
      const res = await axios.post(`${API_BASE_URL}/api/messages`, {
        senderId: userId,
        receiverId,
        content: newMessage.trim(),
      });
      setMessages((prev) => [...prev, res.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Erreur envoi message', error);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text>Chargement des messages...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>💬 Discussion avec {receiverName}</Text>
      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg, i) => (
          <View
            key={i}
            style={[
              styles.messageBubble,
              msg.senderId === userId ? styles.sent : styles.received,
            ]}
          >
            <Text style={styles.messageText}>{msg.content}</Text>
            <Text style={styles.messageTime}>{formatDate(msg.createdAt ?? '')}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Votre message..."
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
          <Text style={styles.sendText}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#038A91' },
  messages: { flex: 1 },
  messageBubble: {
    padding: 10,
    borderRadius: 12,
    marginVertical: 6,
    maxWidth: '75%',
  },
  sent: { backgroundColor: '#DCF8C5', alignSelf: 'flex-end' },
  received: { backgroundColor: '#E5E5E5', alignSelf: 'flex-start' },
  messageText: { fontSize: 16 },
  messageTime: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end', color: '#555' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
  },
  sendBtn: {
    backgroundColor: '#03C490',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
