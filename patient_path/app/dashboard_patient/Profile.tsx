import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.96.83:5001';

interface Patient {
  nom: string;
  prenom: string;
  dateNaissance: string;
  groupeSanguin?: string;
  maladiesChroniques?: string;
  taille?: number;
  poids?: number;
  photo?: string;
}

interface Rapport {
  _id: string;
  description: string;
  fileUrl: string;
  createdAt: string;
}

interface Analyse {
  _id: string;
  testType: string;
  results: string;
  fileUrl?: string;
  date: string;
  status: string;
}

const ProfileScreen = () => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [rapports, setRapports] = useState<Rapport[]>([]);
  const [analyses, setAnalyses] = useState<Analyse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const id = await AsyncStorage.getItem('userId');
      if (!id) return;

      try {
        const [resProfile, resRapports, resAnalyses] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/patient/profile/${id}`),
          axios.get(`${API_BASE_URL}/api/patient/rapports/${id}`),
          axios.get(`${API_BASE_URL}/api/patient/analyses/${id}`),
        ]);
        setPatient(resProfile.data);
        setRapports(resRapports.data);
        setAnalyses(resAnalyses.data);
      } catch (err) {
        console.error('Erreur chargement profil', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleInputChange = (field: keyof Patient, value: string) => {
    if (patient) {
      setPatient({ ...patient, [field]: value });
    }
  };

  const handleSave = async () => {
    const id = await AsyncStorage.getItem('userId');
    if (!id || !patient) return;

    try {
      await axios.put(`${API_BASE_URL}/api/patient/profile/${id}`, patient);
      Alert.alert('✅ Succès', 'Profil mis à jour avec succès.');
    } catch {
      Alert.alert('❌ Erreur', 'Échec de la mise à jour.');
    }
  };

  if (loading) {
    return <Text style={styles.loading}>Chargement du profil...</Text>;
  }

  if (!patient) {
    return <Text style={styles.loading}>Profil introuvable.</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Mon Profil</Text>

      {patient.photo && (
        <Image source={{ uri: `${API_BASE_URL}/${patient.photo}` }} style={styles.profileImage} />
      )}

      <TextInput
        style={styles.input}
        placeholder="Taille (cm)"
        keyboardType="numeric"
        value={patient.taille?.toString() || ''}
        onChangeText={(text) => handleInputChange('taille', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Poids (kg)"
        keyboardType="numeric"
        value={patient.poids?.toString() || ''}
        onChangeText={(text) => handleInputChange('poids', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Groupe sanguin"
        value={patient.groupeSanguin || ''}
        onChangeText={(text) => handleInputChange('groupeSanguin', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Maladies chroniques"
        value={patient.maladiesChroniques || ''}
        onChangeText={(text) => handleInputChange('maladiesChroniques', text)}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>💾 Enregistrer</Text>
      </TouchableOpacity>

      <Text style={styles.subTitle}>📄 Rapports Médicaux</Text>
      {rapports.map((r) => (
        <View key={r._id} style={styles.card}>
          <Text style={styles.bold}>Description :</Text>
          <Text>{r.description}</Text>
          <Text style={{ marginTop: 4 }}>{new Date(r.createdAt).toLocaleDateString('fr-FR')}</Text>
          <Text style={{ color: '#038A91' }}>📎 {r.fileUrl.split('/').pop()}</Text>
        </View>
      ))}

      <Text style={styles.subTitle}>🔬 Résultats de laboratoire</Text>
      {analyses.map((a) => (
        <View key={a._id} style={styles.card}>
          <Text style={styles.bold}>Type : {a.testType}</Text>
          <Text>Résultat : {a.results}</Text>
          <Text>Date : {new Date(a.date).toLocaleDateString('fr-FR')}</Text>
          <Text>Statut : {a.status}</Text>
          {a.fileUrl && (
            <Text style={{ color: '#038A91' }}>📎 {a.fileUrl.split('/').pop()}</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F5FCFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#038A91',
  },
  loading: {
    marginTop: 50,
    textAlign: 'center',
    fontSize: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 8,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  saveButton: {
    backgroundColor: '#03C490',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  subTitle: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 8,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  bold: {
    fontWeight: 'bold',
    color: '#038A91',
  },
});

export default ProfileScreen;
