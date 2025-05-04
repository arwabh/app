import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { colors } from '../../theme';

const API_BASE_URL = 'http://192.168.135.83:5001'; // ou ton IP locale exacte

interface Appointment {
  _id: string;
  date: string;
  doctorName: string;
}

interface Doctor {
  _id: string;
  nom: string;
  prenom: string;
  specialty: string;
}

const Home = () => {
  const [userName, setUserName] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const fetchData = async () => {
      try {
        const profileRes = await axios.get(`${API_BASE_URL}/api/users/${userId}`);
        const userData = profileRes.data as { nom: string; prenom: string };
        setUserName(`${userData.prenom} ${userData.nom}`);

        const appointmentRes = await axios.get(`${API_BASE_URL}/api/appointments?patientId=${userId}`);
        setAppointments(appointmentRes.data as Appointment[]);

        const doctorRes = await axios.get(`${API_BASE_URL}/api/medecins-consultes/${userId}`);
        setDoctors(doctorRes.data as Doctor[]);
      } catch (err) {
        console.error('❌ Erreur chargement dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Bienvenue, {userName.split(' ')[0]}</Text>

      {/* Rendez-vous */}
      <Text style={styles.sectionTitle}>📅 Prochains rendez-vous</Text>
      {appointments.length === 0 ? (
        <Text style={styles.empty}>Aucun rendez-vous à venir.</Text>
      ) : (
        <FlatList
          data={appointments.slice(0, 3)}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardText}>👨‍⚕️ {item.doctorName}</Text>
              <Text style={styles.cardSub}>🕒 {new Date(item.date).toLocaleString('fr-FR')}</Text>
            </View>
          )}
        />
      )}

      {/* Médecins consultés */}
      <Text style={styles.sectionTitle}>👨‍⚕️ Mes médecins consultés</Text>
      {doctors.length === 0 ? (
        <Text style={styles.empty}>Aucun médecin trouvé.</Text>
      ) : (
        <FlatList
          data={doctors}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.doctorCard}
              onPress={() => router.push(`/dashboard_patient/DoctorProfile?id=${item._id}`)}
            >
              <Text style={styles.cardText}>{item.prenom} {item.nom}</Text>
              <Text style={styles.cardSub}>{item.specialty}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    padding: 20,
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: colors.accent,
    marginTop: 10,
    marginBottom: 8,
    fontWeight: '600',
  },
  empty: {
    color: colors.muted,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  card: {
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderColor: colors.border,
    borderWidth: 1,
  },
  doctorCard: {
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    borderColor: colors.border,
    borderWidth: 1,
  },
  cardText: {
    color: colors.text,
    fontWeight: '600',
  },
  cardSub: {
    color: colors.muted,
    marginTop: 4,
  },
});

export default Home;
