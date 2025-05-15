import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import WelcomeSection from '../../components/WelcomeSection';

const API_BASE_URL = 'http://192.168.122.83:5001';

interface Appointment {
  doctorId: string;
  date: string;
  status: string;
}

interface UserInfo {
  _id: string;
  nom: string;
  prenom: string;
  adresse: string;
  photo?: string;
  roles: string[] | string;
}

export default function HomeScreen() {
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [userInfos, setUserInfos] = useState<Record<string, UserInfo>>({});
  const [confirmedProviders, setConfirmedProviders] = useState<UserInfo[]>([]);
  const router = useRouter();
  const [userName, setUserName] = useState('Utilisateur');
  const [userPhoto, setUserPhoto] = useState('https://cdn-icons-png.flaticon.com/512/149/149071.png');

  

  useEffect(() => {
    const fetchUserData = async () => {
      const storedName = await AsyncStorage.getItem('userName');
      const storedPhoto = await AsyncStorage.getItem('userPhoto');
      setUserName(storedName || 'Utilisateur');
      setUserPhoto(storedPhoto || '');
    };
    fetchUserData();
  
    const fetchAppointments = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) return console.warn('🛑 Aucun ID utilisateur trouvé.');

        const today = new Date();
        const res = await axios.get(`${API_BASE_URL}/api/patient/appointments/${userId}`);
        const appointmentsData: Appointment[] = res.data;

        const futureAppointments = appointmentsData.filter((a) => new Date(a.date) >= today);
        setUpcomingAppointments(futureAppointments.slice(0, 3));

        const confirmed = appointmentsData.filter((a) => a.status === 'confirmed');
        const uniqueIds = [...new Set(confirmed.map((a) => a.doctorId))] as string[];

        const userMap: Record<string, UserInfo> = {};
        await Promise.all(
          uniqueIds.map(async (id) => {
            try {
              const response = await axios.get(`${API_BASE_URL}/api/users/${id}`);
              userMap[id] = response.data;
            } catch (err) {
              console.warn(`Utilisateur non trouvé : ${id}`);
            }
          })
        );

        setUserInfos(userMap);
        setConfirmedProviders(Object.values(userMap));
      } catch (err) {
        console.error('Erreur chargement rendez-vous :', err);
      }
    };

    fetchAppointments();
  }, []);

  const normalizeRoles = (roles: string[] | string): string[] =>
    Array.isArray(roles) ? roles : typeof roles === 'string' ? [roles] : [];

  const mapRoleLabel = (roles: string[]) => {
    const lower = roles.map((r) => r.toLowerCase());
    if (lower.includes('doctor')) return { icon: 'stethoscope', label: 'Médecin', prefix: 'Dr.' };
    if (lower.includes('labs')) return { icon: 'flask', label: 'Laboratoire', prefix: 'Laboratoire' };
    if (lower.includes('hospital')) return { icon: 'hospital-building', label: 'Hôpital', prefix: 'Hôpital' };
    if (lower.includes('cabinet')) return { icon: 'office-building', label: 'Cabinet', prefix: 'Cabinet' };
    if (lower.includes('ambulancier')) return { icon: 'ambulance', label: 'Ambulancier', prefix: 'Ambulancier' };
    return { icon: 'account', label: 'Autre', prefix: '' };
  };

  const renderLabel = (provider: UserInfo) => {
    const roles = normalizeRoles(provider.roles);
    const roleData = mapRoleLabel(roles);
    return roleData.prefix ? `${roleData.prefix} ${provider.nom} ${provider.prenom}` : `${provider.nom} ${provider.prenom}`;
  };

  const renderRole = (provider: UserInfo) => {
    const roles = normalizeRoles(provider.roles);
    const roleData = mapRoleLabel(roles);
    return roleData.label;
  };

  return (

    
    <ScrollView contentContainerStyle={styles.container}>
<WelcomeSection />

      <Text style={styles.sectionTitle}>
        <Icon name="calendar-check" size={24} color="#226D68" /> Prochains rendez-vous
      </Text>

      {upcomingAppointments.map((appointment, index) => {
        const provider = userInfos[appointment.doctorId];
        if (!provider) return null;
        const date = new Date(appointment.date).toLocaleDateString('fr-FR');
        const label = renderLabel(provider);
        const role = renderRole(provider);

        return (
          <View key={index} style={styles.card}>
            <Text style={styles.cardTitle}>{label}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
  <Icon name="map-marker" size={16} color="#226D68" />
  <Text style={styles.cardText}> {provider.adresse}</Text>
</View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
  <Icon name="calendar" size={16} color="#226D68" />
  <Text style={styles.cardText}> {date}</Text>
</View>
            <Text style={styles.cardRole}>{role}</Text>
          </View>
        );
      })}

      <Text style={[styles.sectionTitle, { marginTop: 30 }]}>
        <Icon name="account-group" size={24} color="#226D68" /> Mes professionnels
      </Text>

      {confirmedProviders.map((provider, idx) => (
        <TouchableOpacity
          key={idx}
          style={styles.providerCard}
          onPress={() => router.push(`/dashboard_patient/unifiedProfile?id=${provider._id}`)}
        >
          <Text style={styles.cardTitle}>{renderLabel(provider)}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
  <Icon name="map-marker" size={16} color="#226D68" />
  <Text style={styles.cardText}> {provider.adresse}</Text>
</View>
          <Text style={styles.cardRole}>{renderRole(provider)}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#F9FCFC' },

  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#226D68',
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  card: {
    backgroundColor: '#E6F4F1',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: 'column',
    gap: 6,
    borderLeftWidth: 5,
    borderLeftColor: '#226D68',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  providerCard: {
    backgroundColor: '#F1F9F7',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: 'column',
    gap: 6,
    borderLeftWidth: 5,
    borderLeftColor: '#2E7D32',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C3E57',
  },

  cardText: {
    color: '#4A4A4A',
    fontSize: 14,
    marginTop: 2,
  },

  cardRole: {
    color: '#607D8B',
    fontSize: 13,
    marginTop: 2,
    fontStyle: 'italic',
  },
});
