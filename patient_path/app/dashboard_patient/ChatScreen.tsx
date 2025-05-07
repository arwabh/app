import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.96.83:5001';

type Message = {
  _id?: string;
  senderId: string;
  receiverId: string;
  appointmentId: string;
  content: string;
  createdAt?: string;
};

const ChatScreen = () => {
  const { appointmentId, receiverId, receiverName, bot } = useLocalSearchParams();
  const userId = localStorage.getItem('userId');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollViewRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    if (bot === 'true') {
      // Message fictif pour le chatbot
      setMessages([
        {
          senderId: 'bot',
          receiverId: userId || '',
          appointmentId: 'chatbot',
          content: 'Bonjour 👋 Je suis votre assistant médical. Décrivez-moi vos symptômes.',
        }
      ]);
    } else {
      fetchMessages();
    }
  }, [appointmentId]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get<Message[]>(
        `${API_BASE_URL}/api/messages/${appointmentId}?userId=${userId}`
      );
      const sorted = res.data.sort((a, b) =>
        new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime()
      );
      setMessages(sorted);
    } catch (error) {
      console.error('Erreur chargement messages', error);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    if (bot === 'true') {
      setMessages((prev) => [
        ...prev,
        {
          senderId: userId || '',
          receiverId: 'bot',
          appointmentId: 'chatbot',
          content: newMessage
        },
        {
          senderId: 'bot',
          receiverId: userId || '',
          appointmentId: 'chatbot',
          content: 'Merci, je vais analyser cela...'
        }
      ]);
      setNewMessage('');
    } else {
      try {
        await axios.post(`${API_BASE_URL}/api/messages`, {
          senderId: userId,
          receiverId,
          appointmentId,
          content: newMessage
        });
        setNewMessage('');
        fetchMessages();
      } catch (error) {
        console.error('Erreur envoi message', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {bot === 'true' ? '🤖 Chatbot Médical' : `💬 ${receiverName}`}
      </Text>

      <ScrollView
        style={styles.messages}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.messageBubble,
              msg.senderId === userId ? styles.myMessage : styles.otherMessage,
            ]}
          >
            <Text style={styles.messageText}>{msg.content}</Text>
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
        <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
          <Text style={styles.sendText}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#fff' },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#038A91'
  },
  messages: { flex: 1 },
  messageBubble: {
    padding: 10,
    borderRadius: 12,
    marginVertical: 4,
    maxWidth: '75%',
  },
  myMessage: {
    backgroundColor: '#DCF8C5',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#E5E5E5',
    alignSelf: 'flex-start',
  },
  messageText: { fontSize: 16 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    paddingTop: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#03C490',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});
