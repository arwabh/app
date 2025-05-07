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

export default function PendingAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const doctorId = React.useRef<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        if (!id) return;
        doctorId.current = id;

        const res = await axios.get(`http://192.168.96.83:5001/api/doctor/appointments/${id}`);
        const pending = res.data
          .filter((apt: Appointment) => apt.status === 'pending')
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setAppointments(pending);
      } catch (err) {
        console.error("❌ Erreur chargement:", err);
        setError("Erreur lors du chargement des demandes.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      await axios.put(`http://192.168.96.83:5001/api/appointments/${appointmentId}/status`, {
        status: newStatus,
      });

      setAppointments(prev =>
        prev.filter(apt => apt._id !== appointmentId)
      );

      Alert.alert("Succès", `Rendez-vous ${newStatus === 'confirmed' ? 'accepté' : 'refusé'}`);
    } catch (error) {
      console.error("❌ Erreur changement statut:", error);
      Alert.alert("Erreur", "Impossible de mettre à jour le statut.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#1976d2" style={{ marginTop: 100 }} />;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>⏳ Demandes de rendez-vous en attente</Text>

      {appointments.length === 0 ? (
        <Text style={styles.noData}>Aucune demande en attente</Text>
      ) : (
        appointments.map(apt => (
          <View key={apt._id} style={styles.card}>
            <Text style={styles.name}>👤 {apt.patient.prenom} {apt.patient.nom}</Text>
            <Text style={styles.text}>📧 {apt.patient.email}</Text>
            <Text style={styles.text}>📞 {apt.patient.telephone}</Text>
            <Text style={styles.text}>🗓️ {formatDate(apt.date)}</Text>
            {apt.reason && <Text style={styles.text}>📝 Motif : {apt.reason}</Text>}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.accept]}
                onPress={() => handleStatusChange(apt._id, 'confirmed')}
              >
                <Text style={styles.buttonText}>✅ Accepter</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.reject]}
                onPress={() => handleStatusChange(apt._id, 'cancelled')}
              >
                <Text style={styles.buttonText}>❌ Refuser</Text>
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 5,
    borderLeftColor: '#ff9800',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 6,
  },
  text: {
    color: '#34495e',
    fontSize: 14,
    marginBottom: 4,
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
  accept: {
    backgroundColor: '#4caf50',
  },
  reject: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  noData: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#777',
    marginTop: 20,
  },
});
