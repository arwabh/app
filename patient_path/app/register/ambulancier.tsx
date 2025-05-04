import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import axios from 'axios';

type Hospital = {
  _id: string;
  nom: string;
};

type ImageFile = {
  uri: string;
  fileName?: string;
  type?: string;
};

type DocumentFile = {
  uri: string;
  name: string;
  mimeType?: string;
};

export default function AmbulancierRegister() {
  const router = useRouter();

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<string | null>(null);
  const [photo, setPhoto] = useState<ImageFile | null>(null);
  const [diplome, setDiplome] = useState<DocumentFile | null>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = 'http://192.168.135.83:5001';

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await axios.get(`${API_URL}/hospitals`);
        setHospitals(res.data);
      } catch (error) {
        console.error('Erreur récupération hôpitaux :', error);
      }
    };
    fetchHospitals();
  }, []);

  const handlePickDiplome = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf'] });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const file = result.assets[0];
      setDiplome({
        uri: file.uri,
        name: file.name,
        mimeType: file.mimeType,
      });
    }
  };

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const file = result.assets[0];
      setPhoto({
        uri: file.uri,
        fileName: file.fileName ??'',
        type: file.type,
      });
    }
  };

  const handleSubmit = async () => {
    if (!selectedHospital || !diplome || !photo) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs et importer les fichiers.');
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      Alert.alert('Erreur', "Utilisateur non identifié.");
      return;
    }

    const formData = new FormData();
    formData.append('hospitalId', selectedHospital ?? '');

    formData.append('photo', {
      uri: photo.uri,
      name: photo.fileName || 'photo.jpg',
      type: photo.type || 'image/jpeg',
    } as any);

    formData.append('diplome', {
      uri: diplome.uri,
      name: diplome.name,
      type: diplome.mimeType || 'application/pdf',
    } as any);

    try {
      setLoading(true);
      await axios.put(`${API_URL}/ambulancier/complete-register/${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      Alert.alert('Succès', 'Inscription complétée. En attente de validation.');
      router.push('/en_attente_validation' as any);
    } catch (error) {
      console.error('Erreur inscription ambulancier :', error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>Complément d’inscription - Ambulancier</Text>

      <Text style={{ marginBottom: 5 }}>Choisir un hôpital associé :</Text>
      {hospitals.map(hospital => (
        <TouchableOpacity
          key={hospital._id}
          onPress={() => setSelectedHospital(hospital._id)}
          style={{
            padding: 10,
            backgroundColor: selectedHospital === hospital._id ? '#cce5ff' : '#f0f0f0',
            marginBottom: 10,
            borderRadius: 5,
          }}
        >
          <Text>{hospital.nom}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity onPress={handlePickPhoto} style={{ backgroundColor: '#007bff', padding: 10, borderRadius: 5, marginBottom: 10 }}>
        <Text style={{ color: '#fff' }}>Importer une photo</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handlePickDiplome} style={{ backgroundColor: '#28a745', padding: 10, borderRadius: 5, marginBottom: 10 }}>
        <Text style={{ color: '#fff' }}>Importer un diplôme (PDF)</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <TouchableOpacity onPress={handleSubmit} style={{ backgroundColor: '#17a2b8', padding: 10, borderRadius: 5 }}>
          <Text style={{ color: '#fff', textAlign: 'center' }}>Valider</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
