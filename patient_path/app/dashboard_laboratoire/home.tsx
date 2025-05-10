import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.93.83:5001'; // replace with your backend IP

interface Appointment {
  _id: string;
  date: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  patient: {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
  };
}

interface Doctor {
  _id: string;
  nom: string;
  prenom: string;
  specialty: string;
}

export default function LabsDashboard() {
  const [activeSection, setActiveSection] = useState<'appointments' | 'chat'>('appointments');
  const [labId, setLabId] = useState<string>('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const loadLabId = async () => {
      const id = await AsyncStorage.getItem('userId');
      if (id) {
        setLabId(id);
        fetchAppointments(id);
        fetchDoctors();
      }
    };
    loadLabId();
  }, []);

  const fetchAppointments = async (id: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/lab-appointments/lab/${id}`);
      setAppointments(res.data);
    } catch (error) {
      console.error('Erreur chargement rdv', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (appointment: Appointment) => {
    try {
      await axios.put(`${API_BASE_URL}/api/lab-appointments/${appointment._id}/status`, {
        status: 'confirmed',
      });
      fetchAppointments(labId);
    } catch (err) {
      console.error('Erreur confirmation:', err);
    }
  };

  const handleCancel = async (appointment: Appointment) => {
    try {
      await axios.put(`${API_BASE_URL}/api/lab-appointments/${appointment._id}/status`, {
        status: 'cancelled',
      });
      fetchAppointments(labId);
    } catch (err) {
      console.error('Erreur annulation:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage || !selectedDoctor) return;
    try {
      const res = await axios.post(`${API_BASE_URL}/api/lab-doctor-messages`, {
        senderId: labId,
        receiverId: selectedDoctor._id,
        content: newMessage,
      });
      setMessages([...messages, res.data.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Erreur envoi message:', err);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/doctors-for-labs`);
      setDoctors(res.data);
    } catch (err) {
      console.error('Erreur chargement médecins:', err);
    }
  };

  const fetchMessages = async (doctorId: string) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/lab-doctor-messages/${labId}/${doctorId}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Erreur chargement messages:', err);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🔬 Tableau de bord Laboratoire</Text>
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabButton, activeSection === 'appointments' && styles.activeTab]}
          onPress={() => setActiveSection('appointments')}
        >
          <Text style={styles.tabText}>📅 Rendez-vous</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeSection === 'chat' && styles.activeTab]}
          onPress={() => setActiveSection('chat')}
        >
          <Text style={styles.tabText}>💬 Chat</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" />
      ) : activeSection === 'appointments' ? (
        <>
          {appointments.length === 0 ? (
            <Text style={styles.empty}>Aucun rendez-vous.</Text>
          ) : (
            appointments.map((apt) => (
              <View key={apt._id} style={styles.card}>
                <Text style={styles.date}>🗓 {new Date(apt.date).toLocaleString()}</Text>
                <Text>👤 {apt.patient.nom} {apt.patient.prenom}</Text>
                <Text>📧 {apt.patient.email}</Text>
                <Text>📞 {apt.patient.telephone}</Text>
                <Text>📝 {apt.reason}</Text>
                <Text style={styles.status}>Statut: {apt.status}</Text>
                {apt.status === 'pending' && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.confirmBtn} onPress={() => handleConfirm(apt)}>
                      <Text style={styles.btnText}>Confirmer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancel(apt)}>
                      <Text style={styles.btnText}>Annuler</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </>
      ) : (
        <>
          <FlatList
            data={doctors}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id}
            style={{ marginBottom: 16 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.doctorCard,
                  selectedDoctor?._id === item._id && styles.selectedDoctor,
                ]}
                onPress={() => {
                  setSelectedDoctor(item);
                  fetchMessages(item._id);
                }}
              >
                <Text>Dr {item.prenom} {item.nom}</Text>
                <Text style={styles.specialty}>{item.specialty}</Text>
              </TouchableOpacity>
            )}
          />
          {selectedDoctor && (
            <View style={styles.chatBox}>
              <Text style={styles.chatHeader}>
                💬 Avec Dr. {selectedDoctor.prenom} {selectedDoctor.nom}
              </Text>
              <ScrollView style={styles.messageList}>
                {messages.map((msg) => (
                  <View
                    key={msg._id}
                    style={[
                      styles.messageBubble,
                      msg.senderId === labId ? styles.sent : styles.received,
                    ]}
                  >
                    <Text>{msg.content}</Text>
                    <Text style={styles.msgTime}>
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </Text>
                  </View>
                ))}
              </ScrollView>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={newMessage}
                  onChangeText={setNewMessage}
                  placeholder="Votre message..."
                />
                <TouchableOpacity style={styles.sendBtn} onPress={handleSendMessage}>
                  <Text style={styles.btnText}>Envoyer</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9fafb',
    flexGrow: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 10,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#3b82f6',
  },
  tabText: {
    color: '#fff',
    fontWeight: '600',
  },
  empty: {
    textAlign: 'center',
    color: '#777',
    marginTop: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    marginBottom: 14,
    borderRadius: 8,
    elevation: 1,
  },
  date: {
    fontWeight: 'bold',
    marginBottom: 6,
  },
  status: {
    marginTop: 6,
    fontWeight: '600',
    color: '#374151',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#4caf50',
    padding: 10,
    borderRadius: 6,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 6,
  },
  btnText: {
    color: '#fff',
    textAlign: 'center',
  },
  doctorCard: {
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  selectedDoctor: {
    backgroundColor: '#c7d2fe',
  },
  specialty: {
    fontSize: 12,
    color: '#64748b',
  },
  chatBox: {
    marginTop: 10,
  },
  chatHeader: {
    fontWeight: '600',
    marginBottom: 10,
  },
  messageList: {
    maxHeight: 250,
    marginBottom: 10,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 6,
    marginBottom: 6,
  },
  sent: {
    backgroundColor: '#3b82f6',
    alignSelf: 'flex-end',
    color: '#fff',
  },
  received: {
    backgroundColor: '#e5e7eb',
    alignSelf: 'flex-start',
  },
  msgTime: {
    fontSize: 10,
    opacity: 0.6,
    marginTop: 2,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
  },
  sendBtn: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: 6,
  },
});
