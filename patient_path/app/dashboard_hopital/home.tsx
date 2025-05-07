import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.96.83';

type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled';

interface Patient {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
}

interface HospitalAppointment {
  _id: string;
  status: AppointmentStatus;
  specialty: string;
  createdAt: string;
  appointmentDate?: string;
  requiredDocuments?: string;
  patientId: Patient;
}

const HospitalDashboard = () => {
  const [appointments, setAppointments] = useState<HospitalAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [activeFilter, setActiveFilter] = useState<AppointmentStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<HospitalAppointment | null>(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [requiredDocuments, setRequiredDocuments] = useState('');
  const [showPlanningForm, setShowPlanningForm] = useState(false);

  useEffect(() => {
    const hospitalId = localStorage.getItem('userId');
    if (hospitalId) {
      fetchAppointments(hospitalId);
    }
  }, []);

  const fetchAppointments = async (hospitalId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/hospital-appointments/hospital/${hospitalId}`);
      setAppointments(response.data);
    } catch (error) {
      console.error('Erreur de récupération:', error);
      setMessage("Erreur lors de la récupération des rendez-vous.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/api/hospital-appointments/${appointmentId}/status`, {
        status: newStatus,
      });

      const appointment = appointments.find(apt => apt._id === appointmentId);
      if (newStatus === 'confirmed' && appointment) {
        setSelectedAppointment(appointment);
        setShowPlanningForm(true);
      } else {
        setAppointments(prev =>
          prev.map(apt =>
            apt._id === appointmentId ? { ...apt, status: newStatus } : apt
          )
        );
        setMessage(`Rendez-vous ${newStatus === 'confirmed' ? 'confirmé' : 'annulé'}`);
      }
    } catch (error) {
      console.error('Erreur de mise à jour:', error);
      setMessage("Erreur lors de la mise à jour du statut.");
    }
  };

  const handlePlanningSubmit = async () => {
    if (!selectedAppointment) return;
    try {
      await axios.put(`${API_BASE_URL}/api/hospital-appointments/${selectedAppointment._id}/planning`, {
        appointmentDate,
        requiredDocuments,
        status: 'confirmed',
      });

      setAppointments(prev =>
        prev.map(apt =>
          apt._id === selectedAppointment._id
            ? { ...apt, status: 'confirmed', appointmentDate, requiredDocuments }
            : apt
        )
      );

      setMessage("Planification confirmée !");
      setShowPlanningForm(false);
      setSelectedAppointment(null);
      setAppointmentDate('');
      setRequiredDocuments('');
    } catch (error) {
      console.error('Erreur planification:', error);
      setMessage("Erreur lors de la planification.");
    }
  };

  const filteredAppointments = appointments
    .filter(apt => activeFilter === 'all' || apt.status === activeFilter)
    .filter(apt => {
      const q = searchTerm.toLowerCase();
      return (
        apt.patientId?.nom?.toLowerCase().includes(q) ||
        apt.patientId?.prenom?.toLowerCase().includes(q) ||
        apt.specialty?.toLowerCase().includes(q)
      );
    });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏥 Tableau de bord Hôpital</Text>

      <TextInput
        style={styles.input}
        placeholder="Rechercher un patient ou spécialité"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      <View style={styles.filterRow}>
        {['all', 'pending', 'confirmed', 'cancelled'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.filterBtn, activeFilter === status && styles.filterActive]}
            onPress={() => setActiveFilter(status as AppointmentStatus | 'all')}
          >
            <Text style={styles.filterText}>{status.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <Text style={styles.info}>Chargement...</Text>
      ) : filteredAppointments.length === 0 ? (
        <Text style={styles.info}>Aucun rendez-vous trouvé.</Text>
      ) : (
        <FlatList
          data={filteredAppointments}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.specialty}</Text>
              <Text>Patient: {item.patientId.nom} {item.patientId.prenom}</Text>
              <Text>Status: {item.status}</Text>
              <Text>Demandé le: {new Date(item.createdAt).toLocaleString('fr-FR')}</Text>
              {item.appointmentDate && (
                <Text>Rendez-vous: {new Date(item.appointmentDate).toLocaleString('fr-FR')}</Text>
              )}
              {item.requiredDocuments && (
                <Text>Docs requis: {item.requiredDocuments}</Text>
              )}
              {item.status === 'pending' && (
                <View style={styles.actions}>
                  <Button title="Confirmer" onPress={() => handleStatusChange(item._id, 'confirmed')} />
                  <Button title="Annuler" color="red" onPress={() => handleStatusChange(item._id, 'cancelled')} />
                </View>
              )}
            </View>
          )}
        />
      )}

      {showPlanningForm && selectedAppointment && (
        <View style={styles.planningBox}>
          <Text style={styles.planningTitle}>Planifier RDV avec {selectedAppointment.patientId.nom}</Text>
          <TextInput
            style={styles.input}
            placeholder="Date et heure (AAAA-MM-JJTHH:mm)"
            value={appointmentDate}
            onChangeText={setAppointmentDate}
          />
          <TextInput
            style={styles.input}
            placeholder="Documents requis"
            value={requiredDocuments}
            onChangeText={setRequiredDocuments}
          />
          <Button title="Confirmer" onPress={handlePlanningSubmit} />
          <Button title="Annuler" color="gray" onPress={() => setShowPlanningForm(false)} />
        </View>
      )}

      {message !== '' && <Text style={styles.alert}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#f0f4f8' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: {
    backgroundColor: 'white',
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    backgroundColor: '#e2e8f0',
  },
  filterActive: { backgroundColor: '#3b82f6' },
  filterText: { color: '#111' },
  info: { textAlign: 'center', marginTop: 20 },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  cardTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  alert: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
    textAlign: 'center',
  },
  planningBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    elevation: 4,
    marginTop: 20,
  },
  planningTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 10 },
});

export default HospitalDashboard;
