import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import WelcomeSection from '../../components/WelcomeSection';

const API_BASE_URL = 'http://192.168.122.83:5001';

export default function CabinetHome() {
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const id = await AsyncStorage.getItem('userId');
      if (!id) return;
      try {
        const res = await axios.get(`${API_BASE_URL}/api/users/${id}`);
        const userData = res.data;

        if (userData.linkedDoctorId) {
          const appointmentsRes = await axios.get(`${API_BASE_URL}/api/doctor/appointments/${userData.linkedDoctorId}`);
          const today = new Date();
          const todayFormatted = today.toISOString().split('T')[0]; // format AAAA-MM-JJ

          const todayFiltered = appointmentsRes.data.filter((apt: any) => 
            apt.status === 'confirmed' && apt.date.startsWith(todayFormatted)
          );

          setTodayAppointments(todayFiltered);
        }
      } catch (err) {
        console.error('Erreur chargement rendez-vous', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#0a3d62" style={{ marginTop: 50 }} />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <WelcomeSection />
      
      <Text style={styles.title}>Rendez-vous d'aujourd'hui</Text>
      {todayAppointments.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.noData}>Aucun rendez-vous programmé aujourd'hui.</Text>
        </View>
      ) : (
        todayAppointments.map((apt) => (
          <View key={apt._id} style={styles.card}>
            <Text style={styles.cardTitle}>
              <Icon name="account" size={18} color="#0a3d62" /> {apt.patient?.prenom} {apt.patient?.nom}
            </Text>
            <Text><Icon name="clock-outline" size={16} color="#0a3d62" /> {new Date(apt.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</Text>
            <Text><Icon name="email-outline" size={16} color="#0a3d62" /> {apt.patient?.email}</Text>
            <Text><Icon name="phone-outline" size={16} color="#0a3d62" /> {apt.patient?.telephone}</Text>
            {apt.reason && <Text><Icon name="file-document-outline" size={16} color="#0a3d62" /> {apt.reason}</Text>}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f0faf9', flexGrow: 1 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0a3d62', marginBottom: 20 },
  card: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 20,
  },
  cardTitle: { fontWeight: 'bold', fontSize: 16, color: '#0a3d62', marginBottom: 8 },
  noData: { textAlign: 'center', color: '#888', fontSize: 16 },
});
