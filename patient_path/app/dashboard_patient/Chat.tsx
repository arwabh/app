// app/dashboard_patient/chat.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.122.83:5001';

interface Appointment {
  _id: string;
  doctorId: {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
    photo?: string;
  };
  date: string;
}

export default function Chat() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      const id = await AsyncStorage.getItem('userId');
      if (!id) return;
      setUserId(id);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/appointments?patientId=${id}`);
        const confirmed = res.data.filter((apt: any) => apt.status === 'confirmed' && apt.doctorId);
  
        // ✅ Filtrer pour ne garder que le plus ancien par médecin
        const uniqueAppointmentsMap = new Map<string, Appointment>();
        confirmed.forEach((apt: Appointment) => {
          const existing = uniqueAppointmentsMap.get(apt.doctorId._id);
          if (!existing || new Date(apt.date) < new Date(existing.date)) {
            uniqueAppointmentsMap.set(apt.doctorId._id, apt);
          }
        });
  
        const uniqueAppointments = Array.from(uniqueAppointmentsMap.values());
        setAppointments(uniqueAppointments);
  
      } catch (error) {
        console.error("Erreur chargement rendez-vous :", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);
  

  const renderItem = ({ item }: { item: Appointment }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => router.push({ pathname: '/dashboard_patient/ChatScreen', params: { appointmentId: item._id } })}
    >
      <Text style={styles.name}>Dr. {item.doctorId.nom} {item.doctorId.prenom}</Text>
      <Text style={styles.date}>RDV: {new Date(item.date).toLocaleString('fr-FR')}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💬 Conversations</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#2e86de" />
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>Aucun rendez-vous trouvé</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  item: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  name: { fontSize: 16, fontWeight: '600' },
  date: { fontSize: 14, color: '#666', marginTop: 4 },
  empty: { textAlign: 'center', marginTop: 32, color: '#888' }
});
