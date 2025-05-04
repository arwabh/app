// app/register/Medecin.tsx
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { completeMedecinSignup } from '../../services/api';
import { SelectList } from 'react-native-dropdown-select-list';
import Ionicons from '@expo/vector-icons/Ionicons';
import RoundedInput from '../../components/RoundedInput';
import { colors } from '../../theme'; // Assure-toi que ton theme.ts existe

const specialites = [
  { key: 'Cardiologie', value: 'Cardiologie' },
  { key: 'Dermatologie', value: 'Dermatologie' },
  { key: 'Gynécologie', value: 'Gynécologie' },
  { key: 'Neurologie', value: 'Neurologie' },
  { key: 'Pédiatrie', value: 'Pédiatrie' },
  { key: 'Psychiatrie', value: 'Psychiatrie' },
  { key: 'Radiologie', value: 'Radiologie' },
  { key: 'Urologie', value: 'Urologie' },
  { key: 'Anesthésie', value: 'Anesthésie' },
  { key: 'Médecine Générale', value: 'Médecine Générale' },
];

export default function MedecinSignup() {
  const { userData } = useAuth();
  const router = useRouter();

  const [specialite, setSpecialite] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [diplome, setDiplome] = useState<string | null>(null);

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets.length > 0) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handlePickDiplome = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });
    if (result.assets && result.assets.length > 0) {
      setDiplome(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!specialite || !photo || !diplome) {
      return Alert.alert('Champs requis', 'Veuillez remplir tous les champs.');
    }
  
    try {
      const formData = new FormData();
      formData.append('uid', userData?.uid || '');
      formData.append('specialite', specialite);
      formData.append('photo', {
        uri: photo,
        name: 'photo.jpg',
        type: 'image/jpeg',
      } as any);
      formData.append('diplome', {
        uri: diplome,
        name: 'diplome.pdf',
        type: 'application/pdf',
      } as any);
  
      await completeMedecinSignup(formData);
      Alert.alert('Succès', 'Votre inscription est soumise à validation.');
      router.replace('/waiting_validation');
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue.');
    }
  };
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Compléter votre profil médecin</Text>

      <Text style={styles.label}>Spécialité</Text>
      <SelectList
        data={specialites}
        setSelected={(val: string) => setSpecialite(val)}
        placeholder="Choisir une spécialité"
        search={false}
        boxStyles={styles.dropdownBox}
        inputStyles={styles.dropdownInput}
        dropdownStyles={styles.dropdownList}
        dropdownTextStyles={styles.dropdownText}
        arrowicon={<Ionicons name="chevron-down" size={18} color={colors.muted} />}
      />

      <TouchableOpacity style={styles.uploadBtn} onPress={handlePickPhoto}>
        <Text style={styles.uploadText}>
          {photo ? '📷 Photo sélectionnée' : 'Ajouter une photo'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.uploadBtn} onPress={handlePickDiplome}>
        <Text style={styles.uploadText}>
          {diplome ? '📄 Diplôme sélectionné' : 'Importer un diplôme'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>Enregistrer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 30,
  },
  label: {
    color: colors.text,
    marginBottom: 8,
    fontWeight: '600',
    fontSize: 16,
  },
  dropdownBox: {
    backgroundColor: colors.white,
    borderColor: colors.accent,
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
  },
  dropdownInput: {
    color: colors.text,
    fontSize: 15,
  },
  dropdownList: {
    backgroundColor: colors.white,
  },
  dropdownText: {
    color: colors.text,
    fontSize: 15,
  },
  uploadBtn: {
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadText: {
    color: colors.accent,
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
