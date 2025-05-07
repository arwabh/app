import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.96.83:5001';

interface Appointment {
  _id: string;
  doctorId?: string;
  labId?: string;
  hospitalId?: string;
  date: string;
  status: 'pending' | 'confirmed' | 'refused';
  reason?: string;
}

interface UserInfo {
  _id: string;
  nom: string;
  prenom: string;
  roles: string[];
}

const AppointmentsScreen = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [userMap, setUserMap] = useState<Record<string, UserInfo>>({});
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadAppointments = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);
      if (!id) return;

      try {
        const res = await axios.get(`${API_BASE_URL}/api/patient/appointments/${id}`);
        const data: Appointment[] = res.data;
        setAppointments(data);

        const allIds = data.flatMap((a) => [a.doctorId, a.labId, a.hospitalId]).filter(Boolean);
        const uniqueIds = Array.from(new Set(allIds));

        const newMap: Record<string, UserInfo> = {};
        await Promise.all(
          uniqueIds.map(async (id) => {
            if (!id) return; // évite undefined/null
            try {
              const res = await axios.get(`${API_BASE_URL}/api/users/${id}`);
              newMap[id] = res.data;
            } catch (err) {
              console.warn(`Utilisateur introuvable: ${id}`);
            }
          })
        );
        

        setUserMap(newMap);
      } catch (err) {
        console.error('Erreur chargement rendez-vous :', err);
      }
    };

    loadAppointments();
  }, []);

  const getProviderInfo = (a: Appointment): UserInfo | null => {
    const id = a.doctorId || a.labId || a.hospitalId;
    return id && userMap[id] ? userMap[id] : null;
  };

  const getRoleLabel = (roles: string[]): string => {
    const role = roles[0]?.toLowerCase();
    switch (role) {
      case 'doctor':
        return '🩺 Médecin';
      case 'labs':
        return '🧪 Laboratoire';
      case 'hospital':
        return '🏥 Hôpital';
      default:
        return '👤 Professionnel';
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { color: 'green' };
      case 'refused':
        return { color: 'red' };
      default:
        return { color: 'orange' };
    }
  };

  const getFormattedDate = (date: string) => {
    if (!date) return 'Date non disponible';
    const parsed = Date.parse(date);
    if (isNaN(parsed)) return 'Date non disponible';
    return new Date(parsed).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Historique des rendez-vous</Text>

      {appointments.length === 0 ? (
        <Text style={styles.emptyText}>Aucun rendez-vous trouvé.</Text>
      ) : (
        appointments.map((a) => {
          const provider = getProviderInfo(a);
          const displayName = provider ? `${provider.nom} ${provider.prenom}` : 'Professionnel';
          const role = provider ? getRoleLabel(provider.roles) : '';

          return (
            <View key={a._id} style={styles.card}>
              <Text style={styles.type}>{displayName}</Text>
              <Text style={styles.date}>
                📅 {getFormattedDate(a.date)}
              </Text>
              <Text style={[styles.status, getStatusStyle(a.status)]}>
                Statut : {a.status}
              </Text>
              {a.reason && (
                <Text style={styles.reason}>Raison : {a.reason}</Text>
              )}
              <Text style={{ marginTop: 4, color: '#888', fontStyle: 'italic' }}>
                {role}
              </Text>
            </View>
          );
        })
      )}
    </ScrollView>
  );
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
  date: {
    marginTop: 6,
    color: '#666',
  },
  status: {
    marginTop: 8,
    fontWeight: 'bold',
  },
  reason: {
    marginTop: 4,
    color: '#444',
  },
});

export default AppointmentsScreen;
