import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';

interface Appointment {
  _id: string;
  date: string;
  status: string;
  reason?: string;
  patient?: {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
  };
}

const API_BASE_URL = 'http://192.168.93.83:5001';

const CabinetDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
  const [cabinetInfo, setCabinetInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPlanningForm, setShowPlanningForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [requiredDocuments, setRequiredDocuments] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const cabinetId = await AsyncStorage.getItem('userId');
      if (cabinetId) fetchCabinetInfo(cabinetId);
    };
    fetchData();
  }, []);

  const fetchCabinetInfo = async (cabinetId: string) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/users/${cabinetId}`);
      const userData = res.data;

      if (!userData?.roles?.includes('Cabinet')) {
        setError("Ce compte n'est pas un cabinet.");
        setLoading(false);
        return;
      }

      setCabinetInfo(userData);
      if (userData.linkedDoctorId) {
        fetchAppointments(userData.linkedDoctorId);
      } else {
        setError('Aucun médecin lié à ce cabinet');
        setLoading(false);
      }
    } catch (err) {
      setError('Erreur chargement cabinet');
      setLoading(false);
    }
  };

  const fetchAppointments = async (doctorId: string) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/doctor/appointments/${doctorId}`);
      const data = res.data;
      setAppointments(data.filter((a: Appointment) => a.status === 'confirmed'));
      setPendingAppointments(data.filter((a: Appointment) => a.status === 'pending'));
      setLoading(false);
    } catch (err) {
      setError('Erreur chargement rendez-vous');
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await axios.put(`${API_BASE_URL}/api/appointments/${id}/status`, { status });
      if (cabinetInfo?.linkedDoctorId) fetchAppointments(cabinetInfo.linkedDoctorId);
    } catch {
      setError('Erreur mise à jour statut');
    }
  };

  const handlePlanningSubmit = async () => {
    if (!selectedAppointment) return;
    try {
      await axios.put(`${API_BASE_URL}/api/appointments/${selectedAppointment._id}/planning`, {
        appointmentDate,
        requiredDocuments,
        status: 'confirmed',
      });
      setShowPlanningForm(false);
      setSelectedAppointment(null);
      setAppointmentDate('');
      setRequiredDocuments('');
      if (cabinetInfo?.linkedDoctorId) fetchAppointments(cabinetInfo.linkedDoctorId);
    } catch {
      setError('Erreur planification rendez-vous');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace('/login');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🏥 Tableau de bord du Cabinet</Text>
      <View style={{ alignItems: 'flex-end', marginBottom: 10 }}>
  <TouchableOpacity
    onPress={handleLogout}
    style={{
      backgroundColor: '#e63946',
      padding: 10,
      borderRadius: 8,
    }}
  >
    <Text style={{ color: 'white', fontWeight: 'bold' }}>🔒 Se déconnecter</Text>
  </TouchableOpacity>
</View>

      {error && <Text style={{ color: 'red' }}>{error}</Text>}

      {cabinetInfo && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 {cabinetInfo.nom}</Text>
          <Text>Spécialité : {cabinetInfo.specialty}</Text>
          <Text>Adresse : {cabinetInfo.adresse}</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>⏳ Demandes en attente</Text>
      {pendingAppointments.length === 0 ? (
        <Text style={styles.noData}>Aucune demande</Text>
      ) : (
        pendingAppointments.map((apt) => (
          <View key={apt._id} style={styles.card}>
            <Text style={styles.cardTitle}>
              👤 {apt.patient?.prenom} {apt.patient?.nom}
            </Text>
            <Text>📅 {formatDate(apt.date)}</Text>
            <Text>📧 {apt.patient?.email}</Text>
            <Text>📞 {apt.patient?.telephone}</Text>
            {apt.reason && <Text>📝 {apt.reason}</Text>}
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={() => {
                  setSelectedAppointment(apt);
                  setShowPlanningForm(true);
                }}
              >
                <Text style={styles.btnText}>Planifier</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => handleStatusChange(apt._id, 'cancelled')}
              >
                <Text style={styles.btnText}>Refuser</Text>
              </TouchableOpacity>
              

            </View>
          </View>
        ))
      )}

      <Text style={styles.sectionTitle}>📅 Rendez-vous Confirmés</Text>
      {appointments.length === 0 ? (
        <Text style={styles.noData}>Aucun rendez-vous confirmé</Text>
      ) : (
        appointments.map((apt) => (
          <View key={apt._id} style={styles.card}>
            <Text style={styles.cardTitle}>
              👤 {apt.patient?.prenom} {apt.patient?.nom}
            </Text>
            <Text>📅 {formatDate(apt.date)}</Text>
            <Text>📧 {apt.patient?.email}</Text>
            <Text>📞 {apt.patient?.telephone}</Text>
            {apt.reason && <Text>📝 {apt.reason}</Text>}
            <Text style={styles.confirmed}>✅ Confirmé</Text>
          </View>
        ))
      )}

      <Modal visible={showPlanningForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📅 Planifier le rendez-vous</Text>
            <TextInput
              placeholder="Date et heure (AAAA-MM-JJTHH:mm)"
              value={appointmentDate}
              onChangeText={setAppointmentDate}
              style={styles.input}
            />
            <TextInput
              placeholder="Documents requis"
              value={requiredDocuments}
              onChangeText={setRequiredDocuments}
              style={[styles.input, { height: 100 }]}
              multiline
            />
            <View style={styles.row}>
              <TouchableOpacity style={styles.confirmBtn} onPress={handlePlanningSubmit}>
                <Text style={styles.btnText}>Confirmer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setShowPlanningForm(false);
                  setSelectedAppointment(null);
                }}
              >
                <Text style={styles.btnText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 30, marginBottom: 10 },
  noData: { color: '#666' },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  cardTitle: { fontWeight: 'bold', marginBottom: 5 },
  confirmed: { marginTop: 8, color: '#2e7d32', fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  confirmBtn: {
    backgroundColor: '#4caf50',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
  },
  cancelBtn: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
  },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 4,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
});

export default CabinetDashboard;
