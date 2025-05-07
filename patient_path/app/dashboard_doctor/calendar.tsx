import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Calendar } from 'react-native-calendars';

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

export default function CalendarScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dayAppointments, setDayAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const doctorId = React.useRef<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        if (!id) return;
        doctorId.current = id;

        const res = await axios.get(`http://192.168.96.83:5001/api/doctor/appointments/${id}`);
        const confirmed = res.data.filter((apt: Appointment) => apt.status === 'confirmed');
        setAppointments(confirmed);
      } catch (err) {
        console.error('Erreur chargement rendez-vous :', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    filterAppointmentsByDate(selectedDate);
  }, [selectedDate, appointments]);

  const filterAppointmentsByDate = (date: string) => {
    const filtered = appointments.filter((apt) => {
      const aptDate = new Date(apt.date).toISOString().split('T')[0];
      return aptDate === date;
    });
    setDayAppointments(filtered);
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#1976d2" style={{ marginTop: 100 }} />;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📅 Calendrier des rendez-vous</Text>

      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: '#1976d2' },
          ...appointments.reduce((acc, apt) => {
            const dateKey = new Date(apt.date).toISOString().split('T')[0];
            acc[dateKey] = acc[dateKey] || { marked: true };
            return acc;
          }, {} as any),
        }}
        theme={{
          selectedDayBackgroundColor: '#1976d2',
          todayTextColor: '#1976d2',
          arrowColor: '#1976d2',
        }}
        firstDay={1}
      />

      <Text style={styles.subHeader}>
        Rendez-vous du {new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </Text>

      {dayAppointments.length === 0 ? (
        <Text style={styles.noData}>Aucun rendez-vous pour cette date</Text>
      ) : (
        dayAppointments.map((apt) => (
          <View key={apt._id} style={styles.card}>
            <Text style={styles.name}>
              👤 {apt.patient.prenom} {apt.patient.nom}
            </Text>
            <Text style={styles.text}>📧 {apt.patient.email}</Text>
            <Text style={styles.text}>📞 {apt.patient.telephone}</Text>
            <Text style={styles.text}>🕒 {formatTime(apt.date)}</Text>
            {apt.reason && <Text style={styles.text}>📝 {apt.reason}</Text>}
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
  subHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 16,
    color: '#2c3e50',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderLeftColor: '#1976d2',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
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
  noData: {
    textAlign: 'center',
    color: '#777',
    fontStyle: 'italic',
    marginTop: 10,
  },
});
