import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const API_BASE_URL = 'http://192.168.122.83:5001';

export default function ConfirmedAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const cabinetId = await AsyncStorage.getItem('userId');
      if (!cabinetId) return;
      const res = await axios.get(`${API_BASE_URL}/api/users/${cabinetId}`);
      if (res.data.linkedDoctorId) {
        const appointmentsRes = await axios.get(`${API_BASE_URL}/api/doctor/appointments/${res.data.linkedDoctorId}`);
        setAppointments(appointmentsRes.data.filter((a: any) => a.status === 'confirmed'));
      }
    };
    fetchData();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Rendez-vous Confirmés</Text>
      {appointments.length === 0 ? (
        <Text style={styles.noData}>Aucun rendez-vous confirmé</Text>
      ) : (
        appointments.map((apt) => (
          <View key={apt._id} style={styles.card}>
            <Text style={styles.cardTitle}>
              <Icon name="account" size={18} color="#0a3d62" /> {apt.patient?.prenom} {apt.patient?.nom}
            </Text>
            <Text><Icon name="calendar" size={16} color="#0a3d62" /> {new Date(apt.date).toLocaleString('fr-FR')}</Text>
            <Text><Icon name="email-outline" size={16} color="#0a3d62" /> {apt.patient?.email}</Text>
            <Text><Icon name="phone-outline" size={16} color="#0a3d62" /> {apt.patient?.telephone}</Text>
            {apt.reason && <Text><Icon name="file-document-outline" size={16} color="#0a3d62" /> {apt.reason}</Text>}
            <View style={styles.statusBox}>
              <Icon name="check-circle-outline" size={20} color="#28a745" />
              <Text style={styles.confirmed}> Confirmé</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f0faf9' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0a3d62', marginBottom: 20 },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  cardTitle: { fontWeight: 'bold', fontSize: 18, color: '#0a3d62', marginBottom: 8 },
  statusBox: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  confirmed: { color: '#28a745', fontWeight: 'bold', fontSize: 15 },
  noData: { textAlign: 'center', color: '#888' },
});
