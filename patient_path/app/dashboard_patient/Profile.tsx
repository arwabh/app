import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';

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
  nomMedecin: string;
  date: string;
  contenu: string;
}

interface Analyse {
  _id: string;
  laboratoire: string;
  date: string;
  resultat: string;
}

const ProfileScreen = () => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [rapports, setRapports] = useState<Rapport[]>([]);
  const [analyses, setAnalyses] = useState<Analyse[]>([]);

  const userId = 'exemple_id_patient'; // À remplacer par le vrai ID (ex: depuis le contexte ou AsyncStorage)

  useEffect(() => {
    axios.get(`http://192.168.135.83:5001/api/patient/profile/${userId}`)
      .then(res => setPatient(res.data))
      .catch(err => console.error('Erreur profil patient', err));

    axios.get(`http://192.168.135.83:5001/api/patient/rapports/${userId}`)
      .then(res => setRapports(res.data))
      .catch(err => console.error('Erreur chargement rapports', err));

    axios.get(`http://192.168.135.83:5001/api/patient/analyses/${userId}`)
      .then(res => setAnalyses(res.data))
      .catch(err => console.error('Erreur chargement analyses', err));
  }, []);

  const handleInputChange = (field: keyof Patient, value: string) => {
    if (patient) {
      setPatient({ ...patient, [field]: value });
    }
  };

  const handleSave = () => {
    axios.put(`http://192.168.135.83:5001/api/patient/profile/${userId}`, patient)
      .then(() => Alert.alert('✅ Succès', 'Profil mis à jour avec succès.'))
      .catch(() => Alert.alert('❌ Erreur', 'Échec de la mise à jour.'));
  };

  if (!patient) {
    return <Text style={styles.loading}>Chargement du profil...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Mon Profil</Text>

      {patient.photo && (
        <Image source={{ uri: patient.photo }} style={styles.profileImage} />
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
          <Text style={styles.bold}>{r.nomMedecin}</Text>
          <Text>{new Date(r.date).toLocaleDateString('fr-FR')}</Text>
          <Text>{r.contenu}</Text>
        </View>
      ))}

      <Text style={styles.subTitle}>🔬 Résultats de laboratoire</Text>
      {analyses.map((a) => (
        <View key={a._id} style={styles.card}>
          <Text style={styles.bold}>{a.laboratoire}</Text>
          <Text>{new Date(a.date).toLocaleDateString('fr-FR')}</Text>
          <Text>{a.resultat}</Text>
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
