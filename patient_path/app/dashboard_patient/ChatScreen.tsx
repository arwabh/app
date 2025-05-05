import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { colors } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  _id: string;
  senderId: string;
  content: string;
  sentAt: string;
}

const API_BASE_URL = 'http://192.168.135.83:5001';

const ChatScreen = () => {
  const { appointmentId, receiverId } = useLocalSearchParams<{ appointmentId: string, receiverId: string }>();
  const [userId, setUserId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const storedId = localStorage.getItem('userId');
    if (storedId) {
      setUserId(storedId);
      fetchMessages(storedId);
    }
  }, []);

  const fetchMessages = async (id: string) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/messages/${appointmentId}`);
      setMessages(res.data as Message[]);
    } catch (err) {
      console.error('Erreur récupération messages', err);
    }
  };
  
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await axios.post(`${API_BASE_URL}/api/messages`, {
        senderId: userId,
        receiverId,
        appointmentId,
        content: newMessage
      });
      setNewMessage('');
      fetchMessages(userId);
    } catch (err) {
      console.error('Erreur envoi message', err);
    }
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.senderId === userId ? styles.messageRight : styles.messageLeft
      ]}
    >
      <Text style={styles.messageText}>{item.content}</Text>
      <Text style={styles.messageDate}>
        {new Date(item.sentAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        ref={flatListRef}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        contentContainerStyle={styles.chatContent}
      />

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Écrivez votre message..."
          placeholderTextColor={colors.muted}
          value={newMessage}
          onChangeText={setNewMessage}
          style={styles.input}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Ionicons name="send" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  chatContent: {
    padding: 12,
    paddingBottom: 80,
  },
  messageContainer: {
    maxWidth: '75%',
    borderRadius: 10,
    padding: 10,
    marginVertical: 6,
  },
  messageLeft: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
  },
  messageRight: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  messageText: {
    color: colors.text,
    fontSize: 16,
  },
  messageDate: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: colors.surface,
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    height: 45,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    color: colors.text,
    backgroundColor: colors.white,
  },
  sendButton: {
    backgroundColor: colors.primary,
    marginLeft: 8,
    borderRadius: 8,
    padding: 10,
    justifyContent: 'center',
  },
});
