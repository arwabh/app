import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { colors } from '../../theme';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.135.83:5001'; // Change en production

interface MedicalDocument {
    _id: string;
    fileName: string;
    description: string;
    filePath: string;
    uploadDate: string;
  }
  
const Documents = () => {
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const id = localStorage.getItem('userId'); // Ou AsyncStorage si tu veux
    if (id) {
      setUserId(id);
      fetchDocuments(id);
    }
  }, []);

  const fetchDocuments = async (id: string) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/patient/medical-documents/${id}`);
      setDocuments( res.data as MedicalDocument[]);
    } catch (err) {
      console.error('Erreur documents', err);
    }
  };

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/jpeg', 'image/png'],
    });
    if (result.assets && result.assets[0]) {
      setSelectedFile(result.assets[0]);
    }
  };

  const uploadDocument = async () => {
    if (!selectedFile || !description) return;

    const formData = new FormData();
    formData.append('document', {
      uri: selectedFile.uri,
      name: selectedFile.name,
      type: selectedFile.mimeType || 'application/octet-stream',
    } as any);
    formData.append('description', description);

    try {
      await axios.post(`${API_BASE_URL}/api/patient/medical-documents/${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setDescription('');
      setSelectedFile(null);
      fetchDocuments(userId!);
      setMessage('✅ Document envoyé');
    } catch (error) {
      console.error(error);
      setMessage('❌ Erreur lors de l’envoi');
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/patient/medical-documents/${userId}/${docId}`);
      fetchDocuments(userId!);
    } catch (err) {
      Alert.alert('Erreur', 'Suppression impossible.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📄 Documents médicaux</Text>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <TextInput
        placeholder="Description du document"
        placeholderTextColor={colors.muted}
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />
      <TouchableOpacity onPress={pickFile} style={styles.button}>
        <Text style={styles.buttonText}>📁 Sélectionner un fichier</Text>
      </TouchableOpacity>
      {selectedFile && <Text style={styles.fileName}>{selectedFile.name}</Text>}

      <TouchableOpacity onPress={uploadDocument} style={styles.button}>
        <Text style={styles.buttonText}>⬆️ Télécharger</Text>
      </TouchableOpacity>

      <FlatList
        data={documents}
        keyExtractor={(item) => item._id}
        renderItem={({ item }: any) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.fileName}</Text>
            <Text style={styles.cardText}>{item.description}</Text>
            <TouchableOpacity onPress={() => handleDelete(item._id)}>
              <Text style={styles.delete}>🗑 Supprimer</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text>Aucun document trouvé.</Text>}
      />
    </View>
  );
};

export default Documents;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  title: {
    fontSize: 24,
    color: colors.primary,
    marginBottom: 16,
    fontWeight: 'bold',
  },
  message: {
    color: colors.accent,
    marginBottom: 10,
  },
  input: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
  },
  fileName: {
    color: colors.accent,
    marginBottom: 10,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  cardText: {
    color: colors.text,
    marginBottom: 6,
  },
  delete: {
    color: 'red',
    textAlign: 'right',
  },
});
