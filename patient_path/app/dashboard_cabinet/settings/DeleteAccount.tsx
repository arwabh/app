import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import HeaderBack from '../../../components/HeaderBack';
const API_BASE_URL = 'http://192.168.122.83:5001';

export default function DeleteAccount() {
  const router = useRouter();

  const confirmDelete = async () => {
    Alert.alert(
      'Confirmer',
      'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: handleDelete },
      ]
    );
  };

  const handleDelete = async () => {
    const userId = await AsyncStorage.getItem('userId');
    try {
      await axios.delete(`${API_BASE_URL}/api/users/${userId}`);
      await AsyncStorage.clear();
      router.replace('/login');
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la suppression');
    }
  };

  return (
    <View style={styles.container}>
      <HeaderBack title=" Supprimer Mon Compte"/>
      <Text style={styles.warning}>Cette action est définitive et supprimera toutes vos données.</Text>
      <TouchableOpacity style={styles.button} onPress={confirmDelete}>
        <Text style={styles.buttonText}>Supprimer mon compte</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: 'red', textAlign: 'center' },
  warning: { textAlign: 'center', color: '#555', marginBottom: 20 },
  button: { backgroundColor: '#dc3545', padding: 12, borderRadius: 8, marginTop: 20 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});
