import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';

const API_BASE_URL = 'http://192.168.93.83:5001';

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

      setModalVisible(true); // ✅ Affiche le message
      setTimeout(() => {
        setModalVisible(false);
        router.push('/dashboard_patient/profile'); // ✅ Redirection après
      }, 2500);
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la sauvegarde.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>✏️ Modifier vos informations</Text>

      <Text style={styles.label}>Groupe sanguin</Text>
      <TextInput style={styles.input} value={bloodType} onChangeText={setBloodType} />

      <Text style={styles.label}>Taille (cm)</Text>
      <TextInput style={styles.input} value={taille} onChangeText={setTaille} keyboardType="numeric" />

      <Text style={styles.label}>Poids (kg)</Text>
      <TextInput style={styles.input} value={poids} onChangeText={setPoids} keyboardType="numeric" />

      <Text style={styles.label}>Contact d'urgence - Nom</Text>
      <TextInput style={styles.input} value={emergencyName} onChangeText={setEmergencyName} />

      <Text style={styles.label}>Contact d'urgence - Téléphone</Text>
      <TextInput style={styles.input} value={emergencyPhone} onChangeText={setEmergencyPhone} keyboardType="phone-pad" />

      <Text style={styles.label}>Contact d'urgence - Relation</Text>
      <TextInput style={styles.input} value={emergencyRelation} onChangeText={setEmergencyRelation} />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>💾 Sauvegarder</Text>
      </TouchableOpacity>

      {/* ✅ Modal de confirmation */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>✅ Données sauvegardées avec succès</Text>
            <Text style={{ textAlign: 'center', marginTop: 6 }}>Redirection en cours...</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f4f8ff',
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 20,
  },
  label: {
    fontWeight: '600',
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    backgroundColor: '#fff',
    marginTop: 6,
  },
  button: {
    backgroundColor: '#1e90ff',
    padding: 14,
    borderRadius: 8,
    marginTop: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
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
    color: 'green',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
