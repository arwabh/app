import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { completeLaboratoireSignup } from '../../services/api';
import { colors } from '../../theme';
import RoundedInput from '../../components/RoundedInput';

export default function LaboratoireSignup() {
  const { userData } = useAuth();
  const router = useRouter();

  const [adresse, setAdresse] = useState('');
  const [carteAutorisation, setCarteAutorisation] = useState<string | null>(null);

  const handlePickCarte = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });

    if (result.assets && result.assets.length > 0) {
      setCarteAutorisation(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!adresse || !carteAutorisation) {
      return alert('Tous les champs sont obligatoires.');
    }

    const formData = new FormData();
    formData.append('uid', userData?.uid || '');
    formData.append('email', userData?.email || '');
    formData.append('nom', userData?.nom || '');
    formData.append('prenom', userData?.prenom || '');
    formData.append('cin', userData?.cin || '');
    formData.append('telephone', userData?.telephone || '');
    formData.append('adresse', adresse);

    formData.append('carteAutorisation', {
      uri: carteAutorisation,
      name: 'carte_autorisation.pdf',
      type: 'application/pdf',
    } as any);

    try {
      await completeLaboratoireSignup(formData);
      alert('Succès : Vous recevrez un email après validation.');
      router.replace('/waiting_validation');
    } catch (err) {
      alert('Erreur : Échec de l’inscription.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Compléter votre profil laboratoire</Text>

      <RoundedInput
        placeholder="Adresse du laboratoire"
        value={adresse}
        onChangeText={(text) => setAdresse(text)}
        icon="location-on"
      />

      <TouchableOpacity onPress={handlePickCarte} style={styles.uploadBtn}>
        <Text style={styles.uploadText}>
          {carteAutorisation ? '📄 Carte sélectionnée' : 'Importer carte d’autorisation'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Continuer</Text>
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
  uploadBtn: {
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.accent,
    marginBottom: 20,
  },
  uploadText: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
