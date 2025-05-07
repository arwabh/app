import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Patient {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
}

interface Appointment {
  _id: string;
  patient: Patient;
  date: string;
  status: string;
}

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

export default function PatientMessages() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [groupedPatients, setGroupedPatients] = useState<Record<string, Patient>>({});
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const messagesEndRef = useRef<FlatList<any>>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      const id = await AsyncStorage.getItem('userId');
      setDoctorId(id);

      const res = await axios.get(`http://192.168.96.83:5001/api/doctor/appointments/${id}`);
      const confirmed = res.data.filter((apt: Appointment) => apt.status === 'confirmed');

      const grouped: Record<string, Patient> = {};
      confirmed.forEach((apt) => {
        grouped[apt.patient._id] = apt.patient;
      });

      setAppointments(confirmed);
      setGroupedPatients(grouped);
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedAppointment && doctorId) {
      fetchMessages(selectedAppointment._id);
    }
  }, [selectedAppointment]);

  const fetchMessages = async (appointmentId: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`http://192.168.96.83:5001/api/messages/${appointmentId}?userId=${doctorId}`);
      setMessages(res.data);
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !doctorId || !selectedAppointment) return;

    try {
      const payload = {
        senderId: doctorId,
        receiverId: selectedAppointment.patient._id,
        appointmentId: selectedAppointment._id,
        content: newMessage.trim(),
      };

      const res = await axios.post(`http://192.168.96.83:5001/api/messages`, payload);
      setMessages((prev) => [...prev, res.data]);
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
      <Text style={styles.title}>💬 Messages Patients</Text>

      <ScrollView horizontal style={styles.patientList} showsHorizontalScrollIndicator={false}>
        {Object.values(groupedPatients).map((patient) => {
          const appointment = appointments.find((apt) => apt.patient._id === patient._id);
          if (!appointment) return null;

          return (
            <TouchableOpacity
              key={patient._id}
              style={[
                styles.patientItem,
                selectedAppointment?.patient._id === patient._id && styles.patientItemSelected,
              ]}
              onPress={() => setSelectedAppointment(appointment)}
            >
              <Text style={styles.patientName}>{patient.prenom} {patient.nom}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {selectedAppointment ? (
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
          <Text style={styles.emptyText}>👈 Sélectionnez un patient pour commencer la discussion</Text>
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
  patientList: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  patientItem: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 10,
  },
  patientItemSelected: {
    backgroundColor: '#1976d2',
  },
  patientName: {
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
