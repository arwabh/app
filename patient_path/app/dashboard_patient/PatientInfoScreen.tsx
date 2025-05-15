import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const API_BASE_URL = 'http://192.168.122.83:5001';

export default function PatientInfoScreen() {
  const [info, setInfo] = useState<any>(null);
  const [medicalDocs, setMedicalDocs] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchInfo = async () => {
      const id = await AsyncStorage.getItem('userId');
      if (!id) return;
      try {
        const res = await axios.get(`${API_BASE_URL}/api/patient/profile/${id}`);
        const patient = res.data;
        if (patient.dateNaissance) {
          patient.age = new Date().getFullYear() - new Date(patient.dateNaissance).getFullYear();
        }
        setInfo(patient);
        setMedicalDocs(patient.medicalDocuments || []);
      } catch (err) {
        console.error('❌ Erreur infos patient :', err);
      }
    };
    fetchInfo();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FCFC' }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {info && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Mes Informations </Text>
            <View style={styles.infoRow}><Text style={styles.label}>Nom :</Text><Text style={styles.value}>{info.nom}</Text></View>
            <View style={styles.infoRow}><Text style={styles.label}>Prénom :</Text><Text style={styles.value}>{info.prenom}</Text></View>
            <View style={styles.infoRow}><Text style={styles.label}>Âge :</Text><Text style={styles.value}>{info.age} ans</Text></View>
            <View style={styles.infoRow}><Text style={styles.label}>Taille :</Text><Text style={styles.value}>{info.taille} cm</Text></View>
            <View style={styles.infoRow}><Text style={styles.label}>Poids :</Text><Text style={styles.value}>{info.poids} kg</Text></View>
            <View style={styles.infoRow}><Text style={styles.label}>Groupe sanguin :</Text><Text style={styles.value}>{info.bloodType}</Text></View>
            <View style={styles.infoRow}><Text style={styles.label}>Allergies :</Text><Text style={styles.value}>{info.allergies?.join(', ') || 'Aucune'}</Text></View>
            <View style={styles.divider} />
            <Text style={styles.subTitle}>Contact d'urgence</Text>
            {info.emergencyContact ? (
              <>
                <Text style={styles.value}>Nom : {info.emergencyContact.name}</Text>
                <Text style={styles.value}>Téléphone : {info.emergencyContact.phone}</Text>
                <Text style={styles.value}>Relation : {info.emergencyContact.relationship}</Text>
              </>
            ) : (
              <Text style={styles.value}>Aucun contact renseigné</Text>
            )}
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => router.push('/dashboard_patient/EditPatientInfoScreen')}
            >
              <Icon name="pencil" size={18} color="#fff" /> <Text style={styles.editBtnText}>Modifier</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>Documents médicaux</Text>
        {medicalDocs.length === 0 ? (
          <Text style={styles.emptyText}>Aucun document ajouté pour l'instant.</Text>
        ) : (
          medicalDocs.map((doc, index) => (
            <View key={index} style={styles.docCard}>
              <Text style={styles.docTitle}>{doc.fileName}</Text>
              <Text>Description : {doc.description || 'Aucune'}</Text>
              <Text>Date : {doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : 'Inconnue'}</Text>
              <TouchableOpacity onPress={() => Linking.openURL(`${API_BASE_URL}/${doc.filePath}`)}>
                <Text style={styles.link}>Ouvrir le document</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => router.push('/dashboard_patient/AddDocumentScreen')}
      >
        <Icon name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#226D68',
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c3e57',
    marginBottom: 6,
  },
  infoRow: { flexDirection: 'row', marginBottom: 6 },
  label: { fontWeight: '600', width: 120, color: '#444' },
  value: { color: '#333' },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  editBtn: {
    marginTop: 20,
    backgroundColor: '#226D68',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  editBtnText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: 'bold',
  },
  docCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderColor: '#ddd',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  docTitle: {
    fontWeight: '700',
    marginBottom: 6,
    color: '#1c3e57',
  },
  link: {
    marginTop: 8,
    color: '#007bff',
    textDecorationLine: 'underline',
  },
  emptyText: { color: '#888', marginTop: 10, fontStyle: 'italic' },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#226D68',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
});
