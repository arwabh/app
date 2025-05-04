// app/register/hopital.tsx
import React, { useEffect } from 'react';
import { Alert, View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme';

const API_BASE_URL = 'http://192.168.135.83:5001';

export default function Hospital() {
  const { userData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const completeHospitalSignup = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/hospital-info`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userData?.email,
            adresse: userData?.adresse || '', // à adapter selon backend
          }),
        });

        if (!res.ok) throw new Error('Erreur serveur');

        router.replace('/dashboard_hopital/home');
      } catch (err) {
        Alert.alert('Erreur', 'Impossible de compléter l’inscription.');
      }
    };

    completeHospitalSignup();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
