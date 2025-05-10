import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const API_BASE_URL = 'http://192.168.93.83:5001';

export default function ProfileScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [info, setInfo] = useState<any>(null);
  const [docs, setDocs] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const router = useRouter();

  const calculateAge = (birthDateString: string): number => {
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        if (!id) return;
        setUserId(id);

        const [resInfo, resDocs, resLabs] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/patient/profile/${id}`),
          axios.get(`${API_BASE_URL}/api/patient/medical-documents/${id}`),
          axios.get(`${API_BASE_URL}/api/patient/analyses/${id}`)
        ]);

        const patientData = resInfo.data;
        if (patientData.dateNaissance) {
          patientData.age = calculateAge(patientData.dateNaissance);
        }

        setInfo(patientData);
        setDocs(resDocs.data);
        setLabs(resLabs.data);
      } catch (err) {
        console.error('❌ Erreur chargement données patient :', err);
      }
    };

    fetchData();
  }, []);

  return (
    <ScrollView style={styles.container}>
      {info && (
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>🧍‍♂️ Informations du patient</Text>
          <Text>Nom : {info.nom || '-'}</Text>
          <Text>Prénom : {info.prenom || '-'}</Text>
          <Text>Âge : {info.age ? `${info.age} ans` : '-'}</Text>
          <Text>Taille : {info.taille ? `${info.taille} cm` : '-'}</Text>
          <Text>Poids : {info.poids ? `${info.poids} kg` : '-'}</Text>
          <Text>Groupe sanguin : {info.bloodType || '-'}</Text>
          <Text>Allergies : {info.allergies?.join(', ') || 'Aucune'}</Text>
          <Text style={{ marginTop: 6, fontWeight: 'bold' }}>📞 Contact d'urgence</Text>
          {info.emergencyContact ? (
            <>
              <Text>Nom : {info.emergencyContact.name}</Text>
              <Text>Téléphone : {info.emergencyContact.phone}</Text>
              <Text>Relation : {info.emergencyContact.relationship}</Text>
            </>
          ) : (
            <Text>Aucun contact renseigné</Text>
          )}
          <TouchableOpacity
            style={styles.updateBtn}
            onPress={() => router.push('/dashboard_patient/EditPatientInfoScreen')}
          >
            <Text style={styles.updateText}>✏️ Modifier</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.title}>📄 Documents médicaux</Text>
      {docs.map((doc) => (
        <View key={doc._id} style={styles.card}>
          <Text style={styles.author}>{doc.authorName || 'Médecin inconnu'}</Text>
          <Text style={styles.date}>
            {doc.date ? new Date(doc.date).toLocaleDateString() : 'Date inconnue'}
          </Text>
          <Text
            style={styles.link}
            onPress={() => Linking.openURL(doc.fileUrl)}
          >
            📎 {doc.fileName}
          </Text>
        </View>
      ))}

      <Text style={styles.title}>🔬 Résultats d’analyse</Text>
      {labs.map((lab) => (
        <View key={lab._id} style={styles.card}>
          <Text style={styles.author}>{lab.authorName || 'Laboratoire inconnu'}</Text>
          <Text style={styles.date}>
            {lab.date ? new Date(lab.date).toLocaleDateString() : 'Date inconnue'}
          </Text>
          <Text style={styles.testType}>🧪 {lab.testType}</Text>
          <Text
            style={styles.link}
            onPress={() => Linking.openURL(lab.fileUrl)}
          >
            📎 {lab.fileName}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f9fc',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#0a4f6c',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1c3e57',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  author: {
    fontWeight: '600',
    fontSize: 15,
    color: '#333',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  testType: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
    fontStyle: 'italic',
  },
  link: {
    color: '#007bff',
    marginTop: 6,
    textDecorationLine: 'underline',
    fontSize: 15,
  },
  updateBtn: {
    marginTop: 12,
    backgroundColor: '#007bff',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  updateText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
