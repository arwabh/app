import React, { useEffect, useState, useRef } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, KeyboardAvoidingView, StyleSheet, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.122.83:5001';

interface Message {
  _id: string;
  senderId: string;
  content: string;
  sentAt: string;
  appointmentId: string;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userId, setUserId] = useState<string>('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const id = await AsyncStorage.getItem('userId');
      if (!id) return;
      setUserId(id);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/messages/user/${id}`);
        setMessages(res.data);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } catch (error) {
        console.error("Erreur chargement messages :", error);
      }
    };

    fetchMessages();
  }, []);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      // Ici il faudrait spécifier à quel appointmentId appartient le message
      // Si tu veux gérer sans appointmentId fixe, tu dois adapter ton modèle backend à des messages directs par userId
      // Ici je laisse volontairement vide (à adapter selon ta logique)
      await axios.post(`${API_BASE_URL}/api/messages`, {
        senderId: userId,
        content: newMessage.trim(),
      });
      setNewMessage('');
      const res = await axios.get(`${API_BASE_URL}/api/messages/user/${userId}`);
      setMessages(res.data);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Erreur envoi message :', error);
    }
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View style={[styles.message, item.senderId === userId ? styles.sent : styles.received]}>
      <Text style={styles.messageText}>{item.content}</Text>
      <Text style={styles.time}>{new Date(item.sentAt).toLocaleString('fr-FR')}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Écrire un message..."
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
          <Text style={styles.sendText}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fefefe' },
  message: { padding: 10, marginVertical: 4, maxWidth: '80%', borderRadius: 8 },
  sent: { backgroundColor: '#d1f0ff', alignSelf: 'flex-end' },
  received: { backgroundColor: '#eee', alignSelf: 'flex-start' },
  messageText: { fontSize: 15 },
  time: { fontSize: 11, marginTop: 4, color: '#666' },
  inputContainer: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderColor: '#ddd' },
  input: { flex: 1, backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, fontSize: 16, borderWidth: 1, borderColor: '#ccc' },
  sendButton: { marginLeft: 8, backgroundColor: '#2e86de', paddingHorizontal: 16, borderRadius: 8, justifyContent: 'center' },
  sendText: { color: '#fff', fontWeight: 'bold' },
});
