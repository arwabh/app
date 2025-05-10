import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.93.83:5001';

export default function AddReport() {
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
    if (!result.canceled) {
      setFile(result.assets[0]);
    }
  };

  const handleUpload = async () => {
    try {
      const doctorId = await AsyncStorage.getItem('userId');
      const patientId = await AsyncStorage.getItem('patientId');
      const appointmentId = await AsyncStorage.getItem('appointmentId');

      if (!file || !doctorId || !patientId || !appointmentId) {
        Alert.alert('Erreur', 'Champs manquants ou fichier non sélectionné');
        return;
      }

      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.mimeType || 'application/octet-stream',
        name: file.name,
      } as any);
      formData.append('doctorId', doctorId);
      formData.append('patientId', patientId);
      formData.append('appointmentId', appointmentId);
      formData.append('description', description);

      const res = await axios.post(`${API_BASE_URL}/api/patient/medical-documents/${patientId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.status === 201) {
        setShowSuccess(true); // ✅ show success modal

        setTimeout(() => {
          setShowSuccess(false);
          router.replace('/dashboard_doctor/PatientProfileDoctor'); // ✅ redirect to profile
        }, 2000); // 2 seconds delay
      }
    } catch (err) {
      console.error('Erreur upload:', err);
      Alert.alert('Erreur', "Impossible d'envoyer le rapport");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Ex: Bilan de consultation"
      />

      <TouchableOpacity style={styles.button} onPress={pickDocument}>
        <Text style={styles.buttonText}>{file ? file.name : 'Choisir un fichier'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.submitButton} onPress={handleUpload}>
        <Text style={styles.submitText}>Envoyer</Text>
      </TouchableOpacity>

      {/* ✅ Message de succès temporaire */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.successOverlay}>
          <View style={styles.successBox}>
            <Text style={styles.successText}>✅ Rapport envoyé avec succès</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f4f8fb',
    flex: 1,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  successOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  successBox: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 12,
    elevation: 5,
  },
  successText: {
    fontSize: 16,
    color: 'green',
    fontWeight: 'bold',
  },
});
