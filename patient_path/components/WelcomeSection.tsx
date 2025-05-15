import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const API_BASE_URL = 'http://192.168.122.83:5001';

export default function WelcomeSection() {
  const [userName, setUserName] = useState<string>('Utilisateur');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      try {
        const res = await axios.get(`${API_BASE_URL}/api/users/${userId}`);
        const user = res.data;
        setUserName(`${user.nom} ${user.prenom}`);
        setUserPhoto(user.photo);
      } catch (error) {
        console.error('Erreur chargement utilisateur:', error);
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Icon name="calendar" size={16} color="white" />
        <Text style={styles.date}>{new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</Text>
      </View>

      <View style={styles.row}>
      {userPhoto ? (
  <Image source={{ uri: userPhoto }} style={styles.avatar} />
) : (
  <Icon name="account-circle" size={60} color="white" />
)}

        <View style={styles.textContainer}>
          <Text style={styles.greeting}>Hi, {userName}!</Text>
    
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#0a3d62', borderRadius: 12, padding: 16, marginBottom: 20 },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  date: { color: 'white', marginLeft: 8 },
  row: { flexDirection: 'row', alignItems: 'center' },

    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      borderWidth: 2,
      borderColor: 'white',
      backgroundColor: '#ccc',
    },

    textContainer: { marginLeft: 12 },
  greeting: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  statusText: { color: 'white', marginLeft: 4 },
  
  
});

