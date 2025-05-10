import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';

const API_BASE_URL = 'http://192.168.93.83:5001';

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
  const userId = '6810978472b19ca6b13aafde'; // à rendre dynamique

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const today = new Date();
        const res = await axios.get(`${API_BASE_URL}/api/patient/appointments/${userId}`);
        const futureAppointments = res.data.filter((a: Appointment) => new Date(a.date) >= today);
        setUpcomingAppointments(futureAppointments.slice(0, 3));

        const confirmed = res.data.filter((a: Appointment) => a.status === 'confirmed');

        const uniqueIds: string[] = Array.from(
          new Set(confirmed.map((a: Appointment) => a.doctorId))
        );

        const userMap: Record<string, UserInfo> = {};

        await Promise.all(
          uniqueIds.map(async (id: string) => {
            try {
              const response = await axios.get(`${API_BASE_URL}/api/users/${id}`);
              userMap[id] = response.data;
            } catch (err) {
              console.warn(`Utilisateur non trouvé: ${id}`);
            }
          })
        );

        setUserInfos(userMap);
        setConfirmedProviders(Object.values(userMap));
      } catch (err) {
        console.error('Erreur lors du chargement des rendez-vous :', err);
      }
    };

    fetchAppointments();
  }, []);

  const normalizeRoles = (roles: string[] | string): string[] => {
    if (Array.isArray(roles)) return roles;
    if (typeof roles === 'string') return [roles];
    return [];
  };

  const mapRoleLabel = (roles: string[]) => {
    const lower = roles.map(r => r.toLowerCase());

    if (lower.includes('doctor')) return { icon: '🩺', label: 'Médecin', prefix: 'Dr.' };
    if (lower.includes('labs')) return { icon: '🧪', label: 'Laboratoire', prefix: 'Laboratoire de :' };
    if (lower.includes('hospital')) return { icon: '🏥', label: 'Hôpital', prefix: 'HÔPITAL' };
    if (lower.includes('cabinet')) return { icon: '🏛️', label: 'Cabinet', prefix: 'Cabinet :' };
    if (lower.includes('ambulancier')) return { icon: '🚑', label: 'Ambulancier', prefix: 'Ambulancier :' };

    return { icon: '👤', label: 'Autre', prefix: '' };
  };

  const renderLabel = (provider: UserInfo) => {
    const roles = normalizeRoles(provider.roles);
    const roleData = mapRoleLabel(roles);

    if (roleData.prefix === 'Dr.') return `Dr. ${provider.nom} ${provider.prenom}`;
    if (roleData.prefix === 'HÔPITAL') return 'HÔPITAL';
    return `${roleData.prefix} ${provider.nom} ${provider.prenom}`;
  };

  const renderRole = (provider: UserInfo) => {
    const roles = normalizeRoles(provider.roles);
    const roleData = mapRoleLabel(roles);
    return `${roleData.icon} ${roleData.label}`;
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#009688', marginBottom: 10 }}>
        📅 Prochains rendez-vous
      </Text>

      {upcomingAppointments.map((appointment, index) => {
        const provider = userInfos[appointment.doctorId];
        if (!provider) return null;

        const date = new Date(appointment.date).toLocaleDateString('fr-FR');
        const label = renderLabel(provider);
        const role = renderRole(provider);

        return (
          <View key={index} style={{
            backgroundColor: '#e7fdfc',
            padding: 12,
            borderRadius: 12,
            marginBottom: 10,
            borderLeftColor: '#03C490',
            borderLeftWidth: 4
          }}>
            <Text style={{ fontWeight: 'bold', color: '#006666', fontSize: 15 }}>
              {label}
            </Text>
            <Text style={{ color: '#444', marginTop: 4 }}>
              📍 {provider.adresse}
            </Text>
            <Text style={{ color: '#444', marginTop: 2 }}>
              📅 Date : {date}
            </Text>
            <Text style={{ color: '#888', marginTop: 2, fontStyle: 'italic' }}>
              {role}
            </Text>
          </View>
        );
      })}

      <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#009688', marginTop: 30 }}>
        👩‍⚕️ Mes professionnels
      </Text>

      {confirmedProviders.map((provider, idx) => (
        <TouchableOpacity
          key={idx}
          style={{
            backgroundColor: '#eefaf1',
            padding: 12,
            borderRadius: 12,
            marginTop: 10,
            borderLeftColor: '#4caf50',
            borderLeftWidth: 4
          }}
          onPress={() => router.push(`/dashboard_patient/unifiedProfile?id=${provider._id}`)}
        >
          <Text style={{ fontWeight: 'bold', color: '#2e7d32', fontSize: 15 }}>
            {renderLabel(provider)}
          </Text>
          <Text style={{ color: '#444', marginTop: 4 }}>
            📍 {provider.adresse}
          </Text>
          <Text style={{ color: '#888', marginTop: 2, fontStyle: 'italic' }}>
            {renderRole(provider)}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
