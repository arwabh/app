import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import HeaderBack from '../../../components/HeaderBack';

const API_BASE_URL = 'http://192.168.122.83:5001';

export default function EditProfile() {
  const [user, setUser] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;
      try {
        const res = await axios.get(`${API_BASE_URL}/api/users/${userId}`);
        setUser({
          nom: res.data.nom || '',
          prenom: res.data.prenom || '',
          email: res.data.email || '',
          telephone: res.data.telephone || '',
        });
      } catch (error) {
        Alert.alert('Erreur', 'Chargement du profil impossible');
      }
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    const userId = await AsyncStorage.getItem('userId');
    try {
      await axios.put(`${API_BASE_URL}/api/users/${userId}`, user);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.replace('/dashboard_cabinet/settings/SettingsScreen');
      }, 1500);
    } catch (error) {
      Alert.alert('Erreur', 'Mise à jour échouée');
    }
  };

  return (
    <View style={styles.container}>
      <HeaderBack title="Modifier Profil" />

      <View style={styles.formGroup}>
        <Text style={styles.label}>Nom</Text>
        <TextInput
          style={styles.input}
          placeholder="Nom"
          value={user.nom}
          onChangeText={(t) => setUser({ ...user, nom: t })}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Prénom</Text>
        <TextInput
          style={styles.input}
          placeholder="Prénom"
          value={user.prenom}
          onChangeText={(t) => setUser({ ...user, prenom: t })}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={user.email}
          onChangeText={(t) => setUser({ ...user, email: t })}
          keyboardType="email-address"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Téléphone</Text>
        <TextInput
          style={styles.input}
          placeholder="Téléphone"
          value={user.telephone}
          onChangeText={(t) => setUser({ ...user, telephone: t })}
          keyboardType="phone-pad"
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Sauvegarder</Text>
      </TouchableOpacity>

      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.successText}>Profil mis à jour avec succès</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  formGroup: { marginBottom: 16 },
  label: { fontWeight: 'bold', color: '#0a3d62', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#0a3d62',
    padding: 14,
    borderRadius: 10,
    marginTop: 30,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 10,
  },
  successText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
    textAlign: 'center',
  },
});
