import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
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

export default function UpcomingAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const doctorId = await AsyncStorage.getItem('userId');
        const res = await axios.get(`http://192.168.96.83:5001/api/doctor/appointments/${doctorId}`);
        const now = new Date();

        const upcoming = res.data
          .filter((apt: Appointment) => new Date(apt.date) > now && apt.status === 'confirmed')
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setAppointments(upcoming);
      } catch (err) {
        console.error('Erreur chargement rendez-vous à venir:', err);
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

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await axios.put(`http://192.168.96.83:5001/api/appointments/${id}/status`, {
        status: newStatus,
      });

      setAppointments(prev => prev.filter(apt => apt._id !== id));
      Alert.alert("Succès", `Rendez-vous ${newStatus === 'completed' ? 'terminé' : 'annulé'}`);
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut du rendez-vous.');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#1976d2" style={{ marginTop: 100 }} />;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📆 Rendez-vous à venir</Text>

      {appointments.length === 0 ? (
        <Text style={styles.noData}>Aucun rendez-vous à venir</Text>
      ) : (
        appointments.map((apt) => (
          <View key={apt._id} style={styles.card}>
            <Text style={styles.name}>👤 {apt.patient.prenom} {apt.patient.nom}</Text>
            <Text style={styles.text}>📧 {apt.patient.email}</Text>
            <Text style={styles.text}>📞 {apt.patient.telephone}</Text>
            <Text style={styles.text}>🗓️ {formatDate(apt.date)}</Text>
            {apt.reason && <Text style={styles.text}>📝 {apt.reason}</Text>}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.complete]}
                onPress={() => handleStatusChange(apt._id, 'completed')}
              >
                <Text style={styles.buttonText}>✔️ Terminer</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.cancel]}
                onPress={() => handleStatusChange(apt._id, 'cancelled')}
              >
                <Text style={styles.buttonText}>❌ Annuler</Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 5,
    borderLeftColor: '#1976d2',
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
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  complete: {
    backgroundColor: '#4caf50',
  },
  cancel: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  noData: {
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
    color: '#777',
  },
});
