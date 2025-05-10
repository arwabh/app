import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

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

interface Doctor {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  specialty: string;
  region: string;
}

export default function DoctorHome() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
          setError("ID utilisateur non trouvé");
          return;
        }

        const [doctorRes, aptRes] = await Promise.all([
          axios.get(`http://192.168.93.83:5001/api/User/${userId}`),
          axios.get(`http://192.168.93.83:5001/api/doctor/appointments/${userId}`)
        ]);

        setDoctor(doctorRes.data);

        const now = new Date();
        const confirmedFutureAppointments = aptRes.data
          .filter((apt: Appointment) =>
            apt.status === 'confirmed' && new Date(apt.date) >= now
          )
          .sort((a: Appointment, b: Appointment) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
          );

        setAppointments(confirmedFutureAppointments);
      } catch (err) {
        console.error("❌ Erreur:", err);
        setError("Impossible de charger les données");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCardPress = async (patientId: string) => {
    try {
      await AsyncStorage.setItem('patientId', patientId);
      router.push('/dashboard_doctor/PatientProfileDoctor');
    } catch (err) {
      console.error("Erreur lors de la sauvegarde du patientId :", err);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#1976d2" style={styles.loader} />;
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>👨‍⚕️ Tableau de bord du Médecin</Text>

      {doctor && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dr. {doctor.prenom} {doctor.nom}</Text>
          <Text style={styles.text}>🏥 Spécialité : {doctor.specialty}</Text>
          <Text style={styles.text}>📍 Région : {doctor.region}</Text>
          <Text style={styles.text}>📧 Email : {doctor.email}</Text>
          <Text style={styles.text}>📞 Téléphone : {doctor.telephone}</Text>
        </View>
      )}

      <Text style={styles.subHeader}>📅 Rendez-vous Confirmés</Text>
      {appointments.length === 0 ? (
        <Text style={styles.noData}>Aucun rendez-vous confirmé</Text>
      ) : (
        appointments.map((apt) => (
          <TouchableOpacity
            key={apt._id}
            style={styles.appointmentCard}
            onPress={() => handleCardPress(apt.patient._id)}
          >
            <Text style={styles.appointmentTitle}>
              👤 Patient : {apt.patient.prenom} {apt.patient.nom}
            </Text>
            <Text style={styles.text}>📧 {apt.patient.email}</Text>
            <Text style={styles.text}>📞 {apt.patient.telephone}</Text>
            <Text style={styles.text}>🗓️ {formatDate(apt.date)}</Text>
            {apt.reason && <Text style={styles.text}>📝 Motif : {apt.reason}</Text>}
            <Text style={styles.status}>✅ Confirmé</Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f9fa',
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2c3e50',
  },
  subHeader: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
    color: '#2c3e50',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  text: {
    fontSize: 15,
    marginBottom: 4,
    color: '#34495e',
  },
  appointmentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderLeftColor: '#1976d2',
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#2c3e50',
  },
  status: {
    marginTop: 6,
    color: '#4caf50',
    fontWeight: 'bold',
  },
  noData: {
    color: '#777',
    fontStyle: 'italic',
    marginTop: 10,
  },
  loader: {
    flex: 1,
    marginTop: 100,
  },
  error: {
    color: 'red',
    padding: 20,
    textAlign: 'center',
  },
});
