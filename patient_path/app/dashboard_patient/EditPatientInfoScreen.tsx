import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';

const API_BASE_URL = 'http://192.168.122.83:5001';

export default function EditPatientInfoScreen() {
  const [bloodType, setBloodType] = useState('');
  const [taille, setTaille] = useState('');
  const [poids, setPoids] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const id = await AsyncStorage.getItem('userId');
      if (!id) return;

      try {
        const res = await axios.get(`${API_BASE_URL}/api/patient/profile/${id}`);
        const data = res.data;
        setBloodType(data.bloodType || '');
        setTaille(data.taille?.toString() || '');
        setPoids(data.poids?.toString() || '');
        setEmergencyName(data.emergencyContact?.name || '');
        setEmergencyPhone(data.emergencyContact?.phone || '');
        setEmergencyRelation(data.emergencyContact?.relationship || '');
      } catch (err) {
        console.error('Erreur chargement infos patient:', err);
      }
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    const id = await AsyncStorage.getItem('userId');
    if (!id) return;

    try {
      await axios.put(`${API_BASE_URL}/api/patient/profile/${id}`, {
        bloodType,
        taille: Number(taille),
        poids: Number(poids),
        emergencyContact: {
          name: emergencyName,
          phone: emergencyPhone,
          relationship: emergencyRelation,
        },
      });

      setModalVisible(true);
      setTimeout(() => {
        setModalVisible(false);
        router.push('/dashboard_patient/PatientInfoScreen');
      }, 2000);
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la sauvegarde.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Modifier vos informations</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Groupe sanguin</Text>
        <TextInput style={styles.input} value={bloodType} onChangeText={setBloodType} placeholder="Ex: A+" />

        <Text style={styles.label}>Taille (cm)</Text>
        <TextInput style={styles.input} value={taille} onChangeText={setTaille} keyboardType="numeric" placeholder="Ex: 170" />

        <Text style={styles.label}>Poids (kg)</Text>
        <TextInput style={styles.input} value={poids} onChangeText={setPoids} keyboardType="numeric" placeholder="Ex: 70" />

        <Text style={styles.label}>Contact d'urgence - Nom</Text>
        <TextInput style={styles.input} value={emergencyName} onChangeText={setEmergencyName} placeholder="Ex: Jean Dupont" />

        <Text style={styles.label}>Contact d'urgence - Téléphone</Text>
        <TextInput style={styles.input} value={emergencyPhone} onChangeText={setEmergencyPhone} keyboardType="phone-pad" placeholder="Ex: +33612345678" />

        <Text style={styles.label}>Contact d'urgence - Relation</Text>
        <TextInput style={styles.input} value={emergencyRelation} onChangeText={setEmergencyRelation} placeholder="Ex: Parent" />

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>💾 Sauvegarder</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>✅ Données mises à jour</Text>
            <Text style={{ textAlign: 'center', marginTop: 6 }}>Redirection en cours...</Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FCFC',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#226D68',
    marginTop: 30,
    marginBottom: 20,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 4,
  },
  label: {
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 4,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#FAFAFA',
  },
  button: {
    backgroundColor: '#226D68',
    paddingVertical: 16,
    borderRadius: 10,
    marginTop: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 22,
    borderRadius: 12,
    width: 280,
    alignItems: 'center',
  },
  modalText: {
    color: '#226D68',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
