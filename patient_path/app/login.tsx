import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../theme';

const API_BASE_URL = "http://192.168.135.83:5001";

// Dashboards selon rôle
const DASHBOARD_PATHS = {
  patient: '/dashboard_patient/home',
  doctor: '/dashboard_doctor/home',
  laboratoire: '/dashboard_laboratoire/home',
  ambulancier: '/dashboard_ambulancier/home',
  cabinet: '/dashboard_cabinet/home',
  hopital: '/dashboard_hopital/home',
} as const;

type Role = keyof typeof DASHBOARD_PATHS;
type DashboardPath = (typeof DASHBOARD_PATHS)[Role];

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    console.log("Tentative de connexion...");

    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("Réponse brute:", res.status);
      console.log("Données reçues:", data);

      if (res.ok) {
        const roleRaw = data.role?.[0]; // Extrait le rôle du tableau
        const role = roleRaw?.toLowerCase() as Role; // Convertit en minuscule

        console.log("🎯 Rôle détecté:", role);

        if (!role || !DASHBOARD_PATHS[role]) {
          Alert.alert("Erreur", `Rôle non reconnu: ${role}`);
          return;
        }

        const path: DashboardPath = DASHBOARD_PATHS[role];
        router.replace(path);
      } else {
        Alert.alert('Erreur', data.message || 'Email ou mot de passe incorrect.');
      }

    } catch (error) {
      console.error("Erreur connexion:", error);
      Alert.alert('Erreur', 'Connexion impossible. Vérifiez votre réseau.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBanner}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
      </View>

      <Text style={styles.title}>Connexion à PatientPath</Text>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Adresse e-mail"
          placeholderTextColor={colors.muted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
        <TextInput
          placeholder="Mot de passe"
          placeholderTextColor={colors.muted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Connexion</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Pas encore de compte ?
          <Text style={styles.link} onPress={() => router.push('/register/signup')}>
            {' '}S’inscrire
          </Text>
        </Text>
        <TouchableOpacity onPress={() => router.push('/ForgotPassword')}>
          <Text style={[styles.link, { marginTop: 10 }]}>Mot de passe oublié ?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  topBanner: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 25,
  },
  inputContainer: {
    gap: 15,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.accent,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    marginTop: 10,
  },
  buttonText: {
    color: colors.white,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
  },
  footerText: {
    color: colors.muted,
    fontSize: 14,
  },
  link: {
    color: colors.primary,
    fontWeight: '600',
  },
});
