import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';

const API_BASE_URL = 'http://192.168.93.83:5001';

type Appointment = {
  _id: string;
  specialty: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  appointmentDate?: string;
  requiredDocuments?: string;
  createdAt: string;
  patientId: {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
  };
};

export default function HospitalDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filtered, setFiltered] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [requiredDocuments, setRequiredDocuments] = useState('');

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const hospitalId = await AsyncStorage.getItem('userId');
      if (hospitalId) fetchAppointments(hospitalId);
    };
    fetchData();
  }, []);

  useEffect(() => {
    let list = [...appointments];
    if (filter !== 'all') {
      list = list.filter(a => a.status === filter);
    }
    if (search) {
      list = list.filter(a =>
        a.patientId?.nom.toLowerCase().includes(search.toLowerCase()) ||
        a.patientId?.prenom.toLowerCase().includes(search.toLowerCase()) ||
        a.specialty.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(list);
  }, [appointments, filter, search]);

  const fetchAppointments = async (id: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/hospital-appointments/hospital/${id}`);
      setAppointments(res.data);
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de charger les rendez-vous');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await axios.put(`${API_BASE_URL}/api/hospital-appointments/${id}/status`, { status });
      if (status === 'confirmed') {
        const selectedApp = appointments.find(a => a._id === id);
        setSelected(selectedApp || null);
        setShowModal(true);
      } else {
        setAppointments(prev =>
          prev.map(a => a._id === id ? { ...a, status: status as 'confirmed' | 'pending' | 'cancelled' } : a)
        );
        
      }
    } catch {
      Alert.alert('Erreur', "Échec de mise à jour");
    }
  };

  const confirmPlanning = async () => {
    if (!selected) return;
    try {
      await axios.put(`${API_BASE_URL}/api/hospital-appointments/${selected._id}/planning`, {
        appointmentDate,
        requiredDocuments,
        status: 'confirmed',
      });

      setAppointments(prev =>
        prev.map(a =>
          a._id === selected._id
            ? { ...a, appointmentDate, requiredDocuments, status: 'confirmed' }
            : a
        )
      );
      setShowModal(false);
      setSelected(null);
      setAppointmentDate('');
      setRequiredDocuments('');
    } catch (err) {
      Alert.alert('Erreur', "Échec de planification");
    }
  };

  const logout = () => {
    AsyncStorage.clear();
    router.replace('/login');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>🏥 Tableau de bord Hôpital</Text>

      <View style={styles.filterRow}>
        {['all', 'pending', 'confirmed', 'cancelled'].map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f as any)}
            style={[styles.filterBtn, filter === f && styles.activeFilter]}
          >
            <Text style={styles.filterText}>
              {f === 'all' ? 'Tous' : f === 'pending' ? 'En attente' : f === 'confirmed' ? 'Confirmés' : 'Annulés'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        placeholder="Rechercher par patient ou spécialité"
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />

      <TouchableOpacity onPress={logout} style={styles.logout}>
        <Text style={{ color: 'white', textAlign: 'center' }}>Déconnexion</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" />
      ) : (
        filtered.map(apt => (
          <View key={apt._id} style={styles.card}>
            <Text style={styles.specialty}>{apt.specialty}</Text>
            <Text>👤 {apt.patientId?.prenom} {apt.patientId?.nom}</Text>
            <Text>📧 {apt.patientId?.email}</Text>
            <Text>📞 {apt.patientId?.telephone}</Text>
            <Text>📅 Créé le: {new Date(apt.createdAt).toLocaleString()}</Text>
            {apt.appointmentDate && <Text>📆 RDV: {new Date(apt.appointmentDate).toLocaleString()}</Text>}
            {apt.requiredDocuments && <Text>📄 Docs: {apt.requiredDocuments}</Text>}

            {apt.status === 'pending' && (
              <View style={styles.btnRow}>
                <TouchableOpacity style={styles.confirmBtn} onPress={() => updateStatus(apt._id, 'confirmed')}>
                  <Text style={styles.btnText}>Confirmer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => updateStatus(apt._id, 'cancelled')}>
                  <Text style={styles.btnText}>Refuser</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))
      )}

      {/* Modal Planning */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Planifier le rendez-vous</Text>
            <Text>👤 {selected?.patientId.nom} {selected?.patientId.prenom}</Text>
            <Text>🩺 {selected?.specialty}</Text>

            <TextInput
              placeholder="Date/heure du RDV"
              value={appointmentDate}
              onChangeText={setAppointmentDate}
              style={styles.input}
            />
            <TextInput
              placeholder="Documents requis"
              value={requiredDocuments}
              onChangeText={setRequiredDocuments}
              style={styles.input}
              multiline
            />

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.confirmBtn} onPress={confirmPlanning}>
                <Text style={styles.btnText}>Valider</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.btnText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8fafc',
    flexGrow: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
  },
  activeFilter: {
    backgroundColor: '#2563eb',
  },
  filterText: {
    color: '#fff',
  },
  searchInput: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 6,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
  },
  logout: {
    backgroundColor: '#dc2626',
    padding: 10,
    borderRadius: 6,
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 1,
  },
  specialty: {
    fontWeight: 'bold',
    marginBottom: 6,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#22c55e',
    padding: 10,
    borderRadius: 6,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#ef4444',
    padding: 10,
    borderRadius: 6,
  },
  btnText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    width: '90%',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    borderColor: '#ccc',
    borderWidth: 1,
  },
});
