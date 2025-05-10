import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const API_BASE_URL = 'http://192.168.93.83:5001';

export default function PatientProfileDoctor() {
  const [info, setInfo] = useState<any>(null);
  const [docs, setDocs] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const patientId = await AsyncStorage.getItem('patientId');
        if (!patientId) {
          console.warn("❌ patientId manquant");
          return;
        }

        const [infoRes, docRes, labRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/patient/profile/${patientId}`),
          axios.get(`${API_BASE_URL}/api/patient/medical-documents/${patientId}`),
          axios.get(`${API_BASE_URL}/api/patient/analyses/${patientId}`),
        ]);

        setInfo(infoRes.data);

        // 🔄 Récupère les noms de chaque auteur (doctorId ou labId)
        const docsWithNames = await Promise.all(
          docRes.data.map(async (doc: any) => {
            try {
              const res = await axios.get(`${API_BASE_URL}/api/users/${doc.doctorId}`);
              return { ...doc, doctorName: `${res.data.prenom} ${res.data.nom}` };
            } catch {
              return { ...doc, doctorName: 'Inconnu' };
            }
          })
        );

        const labsWithNames = await Promise.all(
          labRes.data.map(async (lab: any) => {
            try {
              const res = await axios.get(`${API_BASE_URL}/api/users/${lab.labId}`);
              return { ...lab, labName: `${res.data.prenom} ${res.data.nom}` };
            } catch {
              return { ...lab, labName: 'Inconnu' };
            }
          })
        );

        setDocs(docsWithNames);
        setLabs(labsWithNames);
      } catch (err) {
        console.error("❌ Erreur récupération patient :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openReportForm = () => {
    router.push('/dashboard_doctor/AddReport');
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 100 }} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>👤 Infos Patient</Text>
        <Text>Nom : {info?.nom || '-'}</Text>
        <Text>Prénom : {info?.prenom || '-'}</Text>
        <Text>Âge : {info?.age || '-'}</Text>
        <Text>Taille : {info?.taille ? `${info.taille} cm` : '-'}</Text>
        <Text>Poids : {info?.poids ? `${info.poids} kg` : '-'}</Text>
        <Text>Groupe sanguin : {info?.bloodType || '-'}</Text>
        <Text>Allergies : {info?.allergies?.join(', ') || 'Aucune'}</Text>

        <TouchableOpacity
          style={styles.modifyBtn}
          onPress={() => router.push('/dashboard_doctor/EditPatientInfoDoctor')}
        >
          <Text style={styles.modifyText}>✏️ Modifier</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>📄 Documents médicaux</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openReportForm}>
          <Text style={{ color: '#fff' }}>➕ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {docs.map(doc => (
        <View key={doc._id} style={styles.documentCard}>
          <Text style={styles.docText}>📎 {doc.description || 'Document médical'}</Text>
          <Text style={styles.metaText}>👨‍⚕️ Auteur : {doc.doctorName}</Text>
          <TouchableOpacity onPress={() => Linking.openURL(`${API_BASE_URL}/${doc.fileUrl}`)}>
            <Text style={styles.docLink}>Ouvrir</Text>
          </TouchableOpacity>
        </View>
      ))}

      <Text style={styles.sectionTitle}>🔬 Résultats d’analyse</Text>
      {labs.map(lab => (
        <View key={lab._id} style={styles.documentCard}>
          <Text style={styles.docText}>🧪 {lab.testType}</Text>
          <Text style={styles.metaText}>🏥 Laboratoire : {lab.labName}</Text>
          <TouchableOpacity onPress={() => Linking.openURL(`${API_BASE_URL}/${lab.fileUrl}`)}>
            <Text style={styles.docLink}>Voir résultat</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f8fc',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#1e3a8a',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  addBtn: {
    backgroundColor: '#4caf50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  documentCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  docText: {
    fontSize: 15,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
  },
  docLink: {
    color: '#007bff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  modifyBtn: {
    marginTop: 14,
    backgroundColor: '#3b82f6',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  modifyText: {
    color: '#fff',
    fontWeight: '600',
  },
});
