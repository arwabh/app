import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';

interface Laboratoire {
  _id: string;
  nom: string;
  adresse: string;
  type: string;
  photo?: string;
  note?: number;
}

const LaboProfile = () => {
  const { id } = useLocalSearchParams();
  const [labo, setLabo] = useState<Laboratoire | null>(null);

  const patientId = 'patient_id_placeholder'; // à remplacer dynamiquement si besoin

  useEffect(() => {
    const fetchLabo = async () => {
      try {
        const response = await axios.get(`http://192.168.135.83:5001/api/laboratoires/${id}`);
        setLabo(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement du profil du labo', err);
      }
    };

    if (id) fetchLabo();
  }, [id]);

  const handleRequestAppointment = async () => {
    try {
      await axios.post(`http://192.168.135.83:5001/api/appointments/request`, {
        laboratoireId: id,
        patientId: patientId,
        type: 'laboratoire',
      });
      Alert.alert("Succès", "Demande de rendez-vous envoyée !");
    } catch (error) {
      console.error('Erreur lors de la demande', error);
      Alert.alert("Erreur", "Impossible d’envoyer la demande.");
    }
  };

  if (!labo) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {labo.photo && (
        <Image source={{ uri: labo.photo }} style={styles.photo} />
      )}
      <Text style={styles.name}>{labo.nom}</Text>
      <Text style={styles.specialty}>Type : {labo.type}</Text>
      <Text style={styles.address}>Adresse : {labo.adresse}</Text>
      {labo.note && (
        <Text style={styles.rating}>Note : ⭐ {labo.note.toFixed(1)}</Text>
      )}
      <TouchableOpacity style={styles.button} onPress={handleRequestAppointment}>
        <Text style={styles.buttonText}>📅 Demander un rendez-vous</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5FCFF',
    alignItems: 'center',
  },
  loading: {
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#038A91',
    marginBottom: 8,
  },
  specialty: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  address: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  rating: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#03C490',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default LaboProfile;
