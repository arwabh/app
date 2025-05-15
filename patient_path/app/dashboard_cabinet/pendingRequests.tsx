import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput, // ✅ Ajoute-le ici
} from 'react-native';

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import dayjs from 'dayjs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const API_BASE_URL = 'http://192.168.122.83:5001';

export default function PendingRequests() {
  const [pendingAppointments, setPendingAppointments] = useState<any[]>([]);
  const [showPlanningForm, setShowPlanningForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [appointmentDay, setAppointmentDay] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [requiredDocuments, setRequiredDocuments] = useState('');
  const [loading, setLoading] = useState(true);

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    const cabinetId = await AsyncStorage.getItem('userId');
    if (!cabinetId) return;
    const res = await axios.get(`${API_BASE_URL}/api/users/${cabinetId}`);
    if (res.data.linkedDoctorId) {
      const appointments = await axios.get(`${API_BASE_URL}/api/doctor/appointments/${res.data.linkedDoctorId}`);
      setPendingAppointments(appointments.data.filter((a: any) => a.status === 'pending'));
    }
    setLoading(false);
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await axios.put(`${API_BASE_URL}/api/appointments/${id}/status`, { status });
      fetchAppointments();
    } catch {
      console.error('Erreur mise à jour statut');
    }
  };

  const handlePlanningSubmit = async () => {
    if (!selectedAppointment || !appointmentDay || !appointmentTime) {
      console.error('Date ou heure manquante');
      return;
    }
    try {
      const formattedDateTime = `${appointmentDay}T${appointmentTime}`;
      await axios.put(`${API_BASE_URL}/api/appointments/${selectedAppointment._id}/planning`, {
        appointmentDate: formattedDateTime,
        requiredDocuments,
        status: 'confirmed',
      });
      setShowPlanningForm(false);
      setSelectedAppointment(null);
      setAppointmentDay('');
      setAppointmentTime('');
      setRequiredDocuments('');
      fetchAppointments();
    } catch {
      console.error('Erreur planification rendez-vous');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0a3d62" />
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Demandes en attente</Text>
      {pendingAppointments.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.noData}>Aucune demande</Text>
        </View>
      ) : (
        pendingAppointments.map((apt) => (
          <View key={apt._id} style={styles.card}>
            <Text style={styles.cardTitle}>
              <Icon name="account" size={18} color="#0a3d62" /> {apt.patient?.prenom} {apt.patient?.nom}
            </Text>
            <Text><Icon name="calendar" size={16} color="#0a3d62" /> {new Date(apt.date).toLocaleString('fr-FR')}</Text>
            <Text><Icon name="email-outline" size={16} color="#0a3d62" /> {apt.patient?.email}</Text>
            <Text><Icon name="phone-outline" size={16} color="#0a3d62" /> {apt.patient?.telephone}</Text>
            {apt.reason && <Text><Icon name="file-document-outline" size={16} color="#0a3d62" /> {apt.reason}</Text>}
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={() => {
                  setSelectedAppointment(apt);
                  setShowPlanningForm(true);
                }}>
                <Text style={styles.btnText}>Planifier</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => handleStatusChange(apt._id, 'cancelled')}>
                <Text style={styles.btnText}>Refuser</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <Modal visible={showPlanningForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Planifier le rendez-vous</Text>

            <TouchableOpacity onPress={() => setDatePickerVisibility(true)} style={styles.input}>
              <Text>{appointmentDay || 'Choisir la date (AAAA-MM-JJ)'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setTimePickerVisibility(true)} style={styles.input}>
              <Text>{appointmentTime || 'Choisir l\'heure (HH:mm)'}</Text>
            </TouchableOpacity>

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
                }}>
                <Text style={styles.btnText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={(date) => {
          setAppointmentDay(dayjs(date).format('YYYY-MM-DD'));
          setDatePickerVisibility(false);
        }}
        onCancel={() => setDatePickerVisibility(false)}
      />

      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={(time) => {
          setAppointmentTime(dayjs(time).format('HH:mm'));
          setTimePickerVisibility(false);
        }}
        onCancel={() => setTimePickerVisibility(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f0faf9', flexGrow: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0a3d62', marginBottom: 20 },
  card: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: { fontWeight: 'bold', fontSize: 16, color: '#0a3d62', marginBottom: 8 },
  noData: { textAlign: 'center', color: '#888', fontSize: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  confirmBtn: { backgroundColor: '#0a3d62', padding: 12, borderRadius: 8, flex: 1, marginRight: 6 },
  cancelBtn: { backgroundColor: '#d9534f', padding: 12, borderRadius: 8, flex: 1, marginLeft: 6 },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 4 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#0a3d62', textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 15, backgroundColor: '#f9f9f9' },
});
