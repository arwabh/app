import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Lab {
  _id: string;
  nom: string;
  adresse: string;
}

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

export default function LabMessages() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const messagesEndRef = useRef<FlatList<any>>(null);

  useEffect(() => {
    const fetchData = async () => {
      const id = await AsyncStorage.getItem('userId');
      setDoctorId(id);

      const res = await axios.get('http://192.168.135.83:5001/api/labs-valides');
      setLabs(res.data);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedLab && doctorId) {
      fetchMessages(selectedLab._id);
    }
  }, [selectedLab]);

  const fetchMessages = async (labId: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`http://192.168.135.83:5001/api/lab-doctor-messages/${labId}/${doctorId}`);
      setMessages(res.data);

      await axios.put(`http://192.168.135.83:5001/api/lab-doctor-messages/read`, {
        receiverId: doctorId,
        senderId: labId,
      });
    } catch (err) {
      console.error('Erreur chargement messages labo:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !doctorId || !selectedLab) return;

    try {
      const payload = {
        senderId: doctorId,
        receiverId: selectedLab._id,
        content: newMessage.trim(),
      };

      const res = await axios.post(`http://192.168.135.83:5001/api/lab-doctor-messages`, payload);
      setMessages((prev) => [...prev, res.data.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Erreur envoi message:', err);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const isDoctorMessage = (msg: Message) => msg.senderId === doctorId;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>🔬 Messages Laboratoires</Text>

      <ScrollView horizontal style={styles.labList} showsHorizontalScrollIndicator={false}>
        {labs.map((lab) => (
          <TouchableOpacity
            key={lab._id}
            style={[
              styles.labItem,
              selectedLab?._id === lab._id && styles.labItemSelected,
            ]}
            onPress={() => setSelectedLab(lab)}
          >
            <Text style={styles.labName}>{lab.nom}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedLab ? (
        <>
          <FlatList
            ref={messagesEndRef}
            data={messages}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.messageList}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.messageBubble,
                  isDoctorMessage(item) ? styles.messageSent : styles.messageReceived,
                ]}
              >
                <Text style={styles.messageText}>{item.content}</Text>
                <Text style={styles.messageTime}>{formatDate(item.createdAt)}</Text>
              </View>
            )}
            onContentSizeChange={() =>
              messagesEndRef.current?.scrollToEnd({ animated: true })
            }
          />

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Écrivez un message..."
              value={newMessage}
              onChangeText={setNewMessage}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
              <Text style={styles.sendButtonText}>Envoyer</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>👈 Sélectionnez un laboratoire</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f9fa',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2c3e50',
  },
  labList: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  labItem: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 10,
  },
  labItemSelected: {
    backgroundColor: '#1976d2',
  },
  labName: {
    color: '#fff',
    fontWeight: '600',
  },
  messageList: {
    flexGrow: 1,
    paddingVertical: 10,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 10,
    marginVertical: 6,
    borderRadius: 12,
  },
  messageSent: {
    backgroundColor: '#1976d2',
    alignSelf: 'flex-end',
  },
  messageReceived: {
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
    borderColor: '#ccc',
    borderWidth: 1,
  },
  messageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 10,
    color: '#ddd',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 20,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  sendButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
});
