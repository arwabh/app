// app/register/Secretaire.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert
} from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { completeSecretaireSignup, fetchMedecinsBySpecialite } from '../../services/api';
import { colors } from '../../theme';
import Ionicons from '@expo/vector-icons/Ionicons';

type Medecin = {
  _id: string;
  nom: string;
  prenom: string;
};

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

export default function SecretaireSignup() {
  const { userData } = useAuth();
  const router = useRouter();

  const [specialite, setSpecialite] = useState('');
  const [medecins, setMedecins] = useState<{ key: string; value: string }[]>([]);
  const [medecinAssocieId, setMedecinAssocieId] = useState('');

  useEffect(() => {
    const loadMedecins = async () => {
      if (specialite) {
        try {
          const res = await fetchMedecinsBySpecialite(specialite);
          const formatted = (res as Medecin[]).map((m) => ({
            key: m._id,
            value: `${m.nom} ${m.prenom}`,
          }));
          setMedecins(formatted);
        } catch (err) {
          console.error("Erreur lors du chargement des médecins", err);
        }
      } else {
        setMedecins([]);
      }
    };
    loadMedecins();
  }, [specialite]);

  const handleSubmit = async () => {
    if (!specialite || !medecinAssocieId) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    try {
      if (!userData?.uid) {
        Alert.alert('Erreur', 'Identifiant utilisateur manquant.');
        return;
      }

      await completeSecretaireSignup(userData.uid, {
        specialite,
        medecinAssocieId,
      });

      Alert.alert('Succès', 'Inscription secrétaire complétée.');
      router.replace('/dashboard_cabinet/home');
    } catch (err) {
      Alert.alert('Erreur', 'Erreur lors de l’enregistrement.');
      console.error(err);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Compléter votre profil secrétaire</Text>

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

      {specialite !== '' && (
        <>
          <Text style={styles.label}>Médecin associé</Text>
          <SelectList
            data={medecins}
            setSelected={(val: string) => setMedecinAssocieId(val)}
            placeholder="Rechercher et sélectionner un médecin"
            search={true}
            boxStyles={styles.dropdownBox}
            inputStyles={styles.dropdownInput}
            dropdownStyles={styles.dropdownList}
            dropdownTextStyles={styles.dropdownText}
            arrowicon={<Ionicons name="chevron-down" size={18} color={colors.muted} />}
          />
        </>
      )}

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>Continuer</Text>
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
