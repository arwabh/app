// app/dashboard_patient/AddDocumentScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';

const API_BASE_URL = 'http://192.168.122.83:5001';

export default function AddDocumentScreen() {
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePickFile = async () => {
    const doc = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/jpeg', 'image/png'],
      copyToCacheDirectory: true,
    });

    if (doc.canceled) return;
    setFile(doc.assets?.[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      Alert.alert('Erreur', 'Veuillez sélectionner un fichier.');
      return;
    }

    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      Alert.alert('Erreur', 'Utilisateur non trouvé.');
      return;
    }

    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || 'application/octet-stream',
    } as any);
    formData.append('description', description);

    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/api/patient/add-document/${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Succès', 'Document ajouté avec succès !');
      router.back();
    } catch (err) {
      console.error('Erreur upload:', err);
      Alert.alert('Erreur', 'Échec de l\'upload du document.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajouter un document médical</Text>

      <TextInput
        placeholder="Description du document"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />

      <TouchableOpacity style={styles.fileBtn} onPress={handlePickFile}>
        <Text style={styles.fileBtnText}>
          {file ? `📎 ${file.name}` : '📂 Sélectionner un fichier'}
        </Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator color="#009688" style={{ marginTop: 20 }} />
      ) : (
        <TouchableOpacity style={styles.submitBtn} onPress={handleUpload}>
          <Text style={styles.submitBtnText}>📤 Ajouter le document</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fefefe' },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: '#00695c',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  fileBtn: {
    backgroundColor: '#e0f2f1',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  fileBtnText: {
    color: '#00796b',
    fontWeight: '500',
  },
  submitBtn: {
    backgroundColor: '#009688',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
