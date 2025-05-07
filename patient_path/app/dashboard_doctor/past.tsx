import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
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
  reason?: string;
  status: string;
}

export default function PastAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const doctorId = await AsyncStorage.getItem('userId');
        const res = await axios.get(`http://192.168.96.83:5001/api/doctor/appointments/${doctorId}`);
        const now = new Date();

        const past = res.data
          .filter((apt: Appointment) =>
            new Date(apt.date) < now ||
            apt.status === 'cancelled' ||
            apt.status === 'completed'
          )
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setAppointments(past);
      } catch (err) {
        console.error('Erreur chargement historique:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return '✅ Terminé';
      case 'cancelled': return '❌ Annulé';
      default: return '📅 Passé';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'cancelled': return '#f44336';
      default: return '#1976d2';
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#1976d2" style={{ marginTop: 100 }} />;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📚 Historique des rendez-vous</Text>

      {appointments.length === 0 ? (
        <Text style={styles.noData}>Aucun rendez-vous passé</Text>
      ) : (
        appointments.map((apt) => (
          <View key={apt._id} style={styles.card}>
            <Text style={styles.name}>👤 {apt.patient.prenom} {apt.patient.nom}</Text>
            <Text style={styles.text}>📧 {apt.patient.email}</Text>
            <Text style={styles.text}>📞 {apt.patient.telephone}</Text>
            <Text style={styles.text}>🗓️ {formatDate(apt.date)}</Text>
            {apt.reason && <Text style={styles.text}>📝 {apt.reason}</Text>}
            <Text style={[styles.status, { color: getStatusColor(apt.status) }]}>
              {getStatusLabel(apt.status)}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f9fa',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2c3e50',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 5,
    borderLeftColor: '#ccc',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#2c3e50',
  },
  text: {
    fontSize: 14,
    marginBottom: 4,
    color: '#34495e',
  },
  status: {
    marginTop: 6,
    fontWeight: 'bold',
    fontSize: 14,
  },
  noData: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#777',
    marginTop: 20,
  },
});
