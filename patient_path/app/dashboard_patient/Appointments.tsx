import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';

interface Appointment {
  _id: string;
  type: 'medecin' | 'laboratoire' | 'hopital';
  nomMedecin?: string;
  nomLabo?: string;
  nomHopital?: string;
  date: string;
  statut: 'confirmé' | 'en attente' | 'refusé';
}

const AppointmentsScreen = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    axios
      .get(`http://192.168.135.83:5001/api/patient/appointments/${userId}`)
      .then((res) => {
        setAppointments(res.data);
      })
      .catch((err) => {
        console.error('Erreur lors du chargement des rendez-vous :', err);
      });
  }, []);

  const renderAppointmentLabel = (item: Appointment) => {
    if (item.type === 'medecin') return item.nomMedecin;
    if (item.type === 'laboratoire') return item.nomLabo;
    if (item.type === 'hopital') return item.nomHopital;
    return 'Professionnel';
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Historique des rendez-vous</Text>

      {appointments.length === 0 ? (
        <Text style={styles.emptyText}>Aucun rendez-vous trouvé.</Text>
      ) : (
        appointments.map((appointment) => (
          <View key={appointment._id} style={styles.card}>
            <Text style={styles.type}>
              {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)}
            </Text>
            <Text style={styles.label}>{renderAppointmentLabel(appointment)}</Text>
            <Text style={styles.date}>
              📅 {new Date(appointment.date).toLocaleDateString('fr-FR')}
            </Text>
            <Text style={[styles.status, getStatusStyle(appointment.statut)]}>
              Statut : {appointment.statut}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const getStatusStyle = (statut: string) => {
  switch (statut) {
    case 'confirmé':
      return { color: 'green' };
    case 'refusé':
      return { color: 'red' };
    default:
      return { color: 'orange' };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5FCFF',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  type: {
    fontSize: 18,
    fontWeight: '600',
    color: '#038A91',
  },
  label: {
    fontSize: 16,
    marginTop: 4,
    color: '#444',
  },
  date: {
    marginTop: 6,
    color: '#666',
  },
  status: {
    marginTop: 8,
    fontWeight: 'bold',
  },
});

export default AppointmentsScreen;
