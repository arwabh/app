import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert
} from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme';
import RoundedInput from '../../components/RoundedInput';
import { completePatientSignup } from '../../services/api';

export default function PatientSignup() {
  const { userData } = useAuth();
  const router = useRouter();

  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [chronicDiseases, setChronicDiseases] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Veuillez autoriser l’accès à la galerie.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets.length > 0) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!emergencyPhone) {
      return Alert.alert('Erreur', 'Veuillez saisir un numéro de téléphone d’urgence.');
    }
  
    try {
      const formData = new FormData();
      formData.append('emergencyPhone', emergencyPhone);
      formData.append('bloodType', bloodType);
      formData.append('chronicDiseases', chronicDiseases);
  
      if (photo) {
        formData.append('photo', {
          uri: photo,
          name: 'photo.jpg',
          type: 'image/jpeg',
        } as any);
      }
  
      await completePatientSignup(userData?.uid || '', formData); // ✅ maintenant 2 arguments corrects
  
      Alert.alert('Succès', 'Inscription patient complétée.');
      router.replace('/dashboard_patient/home');
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de l’enregistrement.');
    }
  };
  

  const bloodTypes = [
    { key: 'A+', value: 'A+' },
    { key: 'A-', value: 'A-' },
    { key: 'B+', value: 'B+' },
    { key: 'B-', value: 'B-' },
    { key: 'AB+', value: 'AB+' },
    { key: 'AB-', value: 'AB-' },
    { key: 'O+', value: 'O+' },
    { key: 'O-', value: 'O-' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Compléter votre profil patient</Text>

      <RoundedInput
        placeholder="Téléphone d'urgence"
        icon="phone"
        value={emergencyPhone}
        onChangeText={setEmergencyPhone}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Groupe sanguin (optionnel)</Text>
      <SelectList
        data={bloodTypes}
        setSelected={setBloodType}
        placeholder="Choisir un groupe sanguin"
        search={false}
        boxStyles={styles.dropdownBox}
        inputStyles={styles.dropdownInput}
        dropdownStyles={styles.dropdownList}
        dropdownTextStyles={styles.dropdownText}
        arrowicon={<Ionicons name="chevron-down" size={18} color={colors.muted} />}
      />

      <RoundedInput
        placeholder="Maladies chroniques (optionnel)"
        icon="healing"
        value={chronicDiseases}
        onChangeText={setChronicDiseases}
      />

      <TouchableOpacity style={styles.uploadBtn} onPress={handlePickPhoto}>
        <Text style={styles.uploadText}>
          {photo ? '📷 Photo sélectionnée' : 'Ajouter une photo'}
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
    marginTop: 20,
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
