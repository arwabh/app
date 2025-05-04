import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../../theme';
import RoundedInput from '../../components/RoundedInput';
import { SelectList } from 'react-native-dropdown-select-list';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

const API_BASE_URL = "http://192.168.135.83:5001";

const roles = [
  { key: 'patient', value: 'patient' },
  { key: 'medecin', value: 'medecin' },
  { key: 'cabinet', value: 'cabinet' },
  { key: 'hopital', value: 'hopital' },
  { key: 'ambulancier', value: 'ambulancier' },
  { key: 'laboratoire', value: 'laboratoire' },
];

export default function Signup() {
  const router = useRouter();

  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    cin: '',
    adresse: '',
    telephone: '',
    password: '',
    role: '',
  });

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const validatePassword = (password: string) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);
  };

  const handleSubmit = async () => {
    const { nom, prenom, email, cin, adresse, telephone, password, role } = form;

    if (!nom || !prenom || !email || !cin || !adresse || !telephone || !password || !role) {
      return Alert.alert('Erreur', 'Tous les champs sont requis.');
    }

    if (cin.length !== 8 || !/^\d{8}$/.test(cin)) {
      return Alert.alert('Erreur', 'CIN doit contenir exactement 8 chiffres.');
    }

    if (!/^\d+$/.test(telephone)) {
      return Alert.alert('Erreur', 'Le téléphone doit être numérique.');
    }

    if (!validatePassword(password)) {
      return Alert.alert(
        'Mot de passe invalide',
        '8 caractères minimum, 1 majuscule, 1 minuscule, 1 chiffre et 1 symbole.'
      );
    }

    try {
      const res = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        const path = `/register/${form.role}`;
        router.push(path as unknown as any );
      } else {
        Alert.alert('Erreur', data.message || 'Une erreur est survenue.');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Connexion au serveur impossible.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Créer un compte</Text>

      <RoundedInput
        placeholder="Nom"
        icon="person"
        value={form.nom}
        onChangeText={(text: string) => handleChange('nom', text)}
      />

      <RoundedInput
        placeholder="Prénom"
        icon="person-outline"
        value={form.prenom}
        onChangeText={(text: string) => handleChange('prenom', text)}
      />

      <RoundedInput
        placeholder="Email"
        icon="email"
        keyboardType="email-address"
        value={form.email}
        onChangeText={(text: string) => handleChange('email', text)}
      />

      <RoundedInput
        placeholder="CIN"
        icon="badge"
        keyboardType="numeric"
        value={form.cin}
        onChangeText={(text: string) => handleChange('cin', text)}
      />

      <RoundedInput
        placeholder="Adresse"
        icon="location-on"
        value={form.adresse}
        onChangeText={(text: string) => handleChange('adresse', text)}
      />

      <RoundedInput
        placeholder="Téléphone"
        icon="phone"
        keyboardType="phone-pad"
        value={form.telephone}
        onChangeText={(text: string) => handleChange('telephone', text)}
      />

      <RoundedInput
        placeholder="Mot de passe"
        icon="lock"
        secureTextEntry
        value={form.password}
        onChangeText={(text: string) => handleChange('password', text)}
      />

      <Text style={styles.label}>Rôle</Text>

      <SelectList
        data={roles}
        setSelected={(val: string) => handleChange('role', val)}
        placeholder="Sélectionnez un rôle"
        search={false}
        boxStyles={styles.dropdownBox}
        inputStyles={styles.dropdownInput}
        dropdownStyles={styles.dropdownList}
        dropdownTextStyles={styles.dropdownText}
        arrowicon={<Ionicons name="chevron-down" size={18} color={colors.muted} />}
      />

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
    color: colors.primary,
    fontWeight: '700',
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
