import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import { colors } from '../../theme';
import { useRouter } from 'expo-router';

const API_BASE_URL = 'http://localhost:5001';

type Appointment = {
  _id: string;
  status: string;
  date: string;
  reason?: string;
  patient: {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
  };
};

export default function CabinetDashboard() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cabinetInfo, setCabinetInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cabinetId = localStorage.getItem('userId');
    if (cabinetId) {
      fetchCabinetInfo(cabinetId);
    }
  }, []);

  const fetchCabinetInfo = async (cabinetId: string) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/users/${cabinetId}`);
      const data = res.data as { linkedDoctorId?: string; nom?: string; specialty?: string; adresse?: string };
      setCabinetInfo(data);

      if (data.linkedDoctorId) {
        fetchAppointments(data.linkedDoctorId);
      } else {
        setError("Aucun médecin lié à ce cabinet.");
        setLoading(false);
      }
    } catch (err) {
      console.error("❌ Erreur info cabinet:", err);
      setError("Erreur récupération des données.");
      setLoading(false);
    }
  };

  const fetchAppointments = async (doctorId: string) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/doctor/appointments/${doctorId}`);
      const data = res.data as Appointment[];
      const confirmed = data.filter((apt) => apt.status === 'confirmed');
      setAppointments(confirmed);
    } catch (err) {
      console.error('Erreur chargement rendez-vous:', err);
      setError('Erreur chargement rendez-vous.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('fr-FR');
  };

  if (loading) {
    return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />;
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>👩‍⚕️ Tableau de bord du Cabinet</Text>

      {cabinetInfo && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>📍 {cabinetInfo.nom}</Text>
          <Text style={styles.infoText}>🏥 Spécialité : {cabinetInfo.specialty}</Text>
          <Text style={styles.infoText}>📌 Adresse : {cabinetInfo.adresse}</Text>
        </View>
      )}

      <Text style={styles.subtitle}>📅 Rendez-vous confirmés</Text>
      {appointments.length === 0 ? (
        <Text>Aucun rendez-vous confirmé.</Text>
      ) : (
        appointments.map((apt) => (
          <View key={apt._id} style={styles.card}>
            <Text style={styles.cardTitle}>
              👤 {apt.patient.prenom} {apt.patient.nom}
            </Text>
            <Text>🗓️ {formatDate(apt.date)}</Text>
            <Text>📧 {apt.patient.email}</Text>
            <Text>📞 {apt.patient.telephone}</Text>
            {apt.reason && <Text>📝 {apt.reason}</Text>}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    padding: 16,
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 12,
    color: colors.primary,
  },
  infoBox: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderColor: colors.border,
    borderWidth: 1,
  },
  infoText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  card: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderColor: colors.border,
    borderWidth: 1,
  },
  cardTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
    color: colors.primary,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 40,
  },
});
