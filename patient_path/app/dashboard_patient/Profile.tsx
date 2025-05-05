import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Image } from 'react-native';
import axios from 'axios';
import { colors } from '../../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.135.83:5001';

const Profile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const id = await AsyncStorage.getItem('userId');
      const response = await axios.get(`${API_BASE_URL}/api/users/${id}`);
      setProfile(response.data);
    } catch (err) {
      setError("Erreur lors du chargement du profil.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />;
  if (error) return <Text style={styles.error}>{error}</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>👤 Mon Profil</Text>
      {profile?.photo && (
        <Image source={{ uri: `${API_BASE_URL}${profile.photo}` }} style={styles.profileImage} />
      )}
      <View style={styles.info}>
        <Text style={styles.label}>Nom:</Text>
        <Text style={styles.value}>{profile.nom}</Text>

        <Text style={styles.label}>Prénom:</Text>
        <Text style={styles.value}>{profile.prenom}</Text>

        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{profile.email}</Text>

        <Text style={styles.label}>Téléphone:</Text>
        <Text style={styles.value}>{profile.telephone}</Text>

        <Text style={styles.label}>Adresse:</Text>
        <Text style={styles.value}>{profile.adresse}</Text>

        <Text style={styles.label}>CIN:</Text>
        <Text style={styles.value}>{profile.cin}</Text>

        <Text style={styles.label}>Téléphone d'urgence:</Text>
        <Text style={styles.value}>{profile.emergencyPhone}</Text>

        <Text style={styles.label}>Groupe sanguin:</Text>
        <Text style={styles.value}>{profile.bloodType || '-'}</Text>

        <Text style={styles.label}>Maladies chroniques:</Text>
        <Text style={styles.value}>{profile.chronicDiseases || '-'}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 20,
  },
  info: {
    marginTop: 10,
  },
  label: {
    fontWeight: 'bold',
    color: colors.accent,
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    color: colors.text,
  },
  error: {
    color: 'red',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default Profile;
