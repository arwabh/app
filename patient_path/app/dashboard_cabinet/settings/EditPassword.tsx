import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderBack from '../../../components/HeaderBack';
const API_BASE_URL = 'http://192.168.122.83:5001';

export default function EditPassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleChangePassword = async () => {
    const userId = await AsyncStorage.getItem('userId');
    try {
      await axios.put(`${API_BASE_URL}/api/users/${userId}/change-password`, { oldPassword, newPassword });
      Alert.alert('Succès', 'Mot de passe changé');
      setOldPassword('');
      setNewPassword('');
    } catch (error) {
      Alert.alert('Erreur', 'Ancien mot de passe incorrect ou erreur serveur');
    }
  };

  return (
    <View style={styles.container}>
      <HeaderBack title="Modifier Mot de Passe" />
      <TextInput style={styles.input} placeholder="Ancien mot de passe" secureTextEntry value={oldPassword} onChangeText={setOldPassword} />
      <TextInput style={styles.input} placeholder="Nouveau mot de passe" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
      <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
        <Text style={styles.buttonText}>🔐 Modifier</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#1c3e57' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 12 },
  button: { backgroundColor: '#007bff', padding: 12, borderRadius: 8, marginTop: 20 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});
