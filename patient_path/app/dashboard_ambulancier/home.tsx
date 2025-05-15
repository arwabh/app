import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.122.83:5001';

export default function Home() {
  const [cin, setCin] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async () => {
    if (!cin) return;

    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/patients/cin/${cin}`);
      const patient = res.data;

      if (!patient || !patient._id) {
        throw new Error('Patient introuvable');
      }
      await AsyncStorage.setItem('patientId', patient._id);


      router.push({
        pathname: '/dashboard_ambulancier/PatientProfileDoctor',
        params: {
          id: patient._id,
          nom: patient.nom,
          prenom: patient.prenom,
          telephone: patient.telephone,
        },
      });
    } catch (err) {
      Alert.alert('Erreur', 'Patient introuvable ou erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Recherche Patient par CIN</Text>

      <TextInput
        style={styles.input}
        placeholder="Entrer le numéro de CIN"
        keyboardType="numeric"
        maxLength={8}
        value={cin}
        onChangeText={setCin}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#009688" />
      ) : (
        <Button title="Rechercher" onPress={handleSearch} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fefefe',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#009688',
    textAlign: 'center',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
});
