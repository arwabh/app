import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';

const API_BASE_URL = 'http://192.168.93.83:5001';

interface Message {
  _id?: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  isRead?: boolean;
}

const PatientMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const { patientId, appointmentId } = useLocalSearchParams();
  const [doctorId, setDoctorId] = useState('');

  useEffect(() => {
    const loadUserId = async () => {
      const storedId = await AsyncStorage.getItem('userId');
      if (storedId) setDoctorId(storedId);
    };
    loadUserId();
  }, []);

  useEffect(() => {
    if (doctorId && appointmentId) fetchMessages();
  }, [doctorId, appointmentId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/messages/${appointmentId}?userId=${doctorId}`);
      setMessages(res.data);

      const unreadMessages = res.data
        .filter((msg: Message) => msg.receiverId === doctorId && !msg.isRead)
        .map((msg: Message) => msg._id);

      if (unreadMessages.length > 0) {
        await axios.put(`${API_BASE_URL}/api/messages/read`, { messageIds: unreadMessages });
      }
    } catch (err) {
      setError("Erreur lors du chargement des messages");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/api/messages`, {
        senderId: doctorId,
        receiverId: patientId,
        appointmentId,
        content: newMessage,
      });

      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (err) {
      setError("Erreur lors de l'envoi du message");
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.message,
      item.senderId === doctorId ? styles.sent : styles.received,
    ]}>
      <Text style={styles.messageText}>{item.content}</Text>
      <Text style={styles.messageTime}>{new Date(item.createdAt).toLocaleTimeString('fr-FR')}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => item._id || index.toString()}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        contentContainerStyle={styles.list}
      />
      <View style={styles.inputContainer}>
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Message..."
          style={styles.input}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  list: { padding: 10 },
  message: {
    marginVertical: 6,
    padding: 10,
    borderRadius: 8,
    maxWidth: '75%',
  },
  sent: {
    backgroundColor: '#1976d2',
    alignSelf: 'flex-end',
  },
  received: {
    backgroundColor: '#e0e0e0',
    alignSelf: 'flex-start',
  },
  messageText: { color: '#000' },
  messageTime: { fontSize: 10, color: '#555', marginTop: 4 },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#1976d2',
    paddingHorizontal: 20,
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendButtonText: { color: '#fff', fontWeight: 'bold' },
  error: { color: 'red', textAlign: 'center' },
});

export default PatientMessages;
