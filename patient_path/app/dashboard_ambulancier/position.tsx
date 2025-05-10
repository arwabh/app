import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, TextInput, Alert } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.96.83:5001';

export default function Position() {
  const [location, setLocation] = useState<any>(null);
  const [hospital, setHospital] = useState('');
  const [report, setReport] = useState('');

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée');
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    setLocation(loc.coords);
  };

  const handleSend = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/ambulancier/position`, {
        hospital,
        rapport: report,
        latitude: location.latitude,
        longitude: location.longitude,
      });
      Alert.alert("Succès", "Position et rapport envoyés");
    } catch (error) {
      Alert.alert("Erreur", "Envoi échoué");
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📍 Envoyer votre position</Text>
      <TextInput
        style={styles.input}
        placeholder="Nom de l'hôpital"
        value={hospital}
        onChangeText={setHospital}
      />
      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Rapport résumé"
        multiline
        value={report}
        onChangeText={setReport}
      />
      <Button title="Envoyer" onPress={handleSend} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  input: {
    borderColor: '#ccc', borderWidth: 1, borderRadius: 8,
    padding: 10, marginBottom: 16,
  },
});
