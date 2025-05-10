import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Alert } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';

const API_BASE_URL = 'http://192.168.93.83:5001';

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
      router.push({
        pathname: '/dashboard_ambulancier/patientProfile',
        params: {
          id: patient._id,
          nom: patient.nom,
          prenom: patient.prenom,
          telephone: patient.telephone,
        },
      });
    } catch (err) {
      Alert.alert('Erreur', 'Patient introuvable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recherche Patient par CIN</Text>
      <TextInput
        style={styles.input}
        placeholder="Entrer le CIN"
        keyboardType="numeric"
        value={cin}
        onChangeText={setCin}
      />
      <Button title={loading ? "Recherche..." : "Rechercher"} onPress={handleSearch} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: 'center' },
  title: { fontSize: 18, marginBottom: 16, fontWeight: 'bold' },
  input: {
    borderColor: '#ccc', borderWidth: 1, borderRadius: 8,
    padding: 12, marginBottom: 16,
  },
});
