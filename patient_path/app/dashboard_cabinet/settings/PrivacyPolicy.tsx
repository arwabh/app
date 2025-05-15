import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import HeaderBack from '../../../components/HeaderBack'; // 👈 Importer ton header ici

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView style={styles.container}>
<HeaderBack title="Politiques de confidentialité" />      <Text style={styles.text}>
        Nous nous engageons à protéger vos données personnelles conformément aux lois en vigueur.
      </Text>
      <Text style={styles.subtitle}>Collecte des données :</Text>
      <Text style={styles.text}>
        Nous collectons uniquement les données nécessaires à la fourniture de nos services (profil, rendez-vous, messages).
      </Text>

      <Text style={styles.subtitle}>Utilisation des données :</Text>
      <Text style={styles.text}>
        Vos données sont utilisées uniquement pour améliorer votre expérience utilisateur et ne seront jamais vendues à des tiers.
      </Text>

      <Text style={styles.subtitle}>Droits de l'utilisateur :</Text>
      <Text style={styles.text}>
        Vous pouvez demander à consulter, modifier ou supprimer vos données à tout moment via la section Paramètres {'>'} Compte.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fefefe' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#1c3e57', textAlign: 'center' },
  subtitle: { fontSize: 18, fontWeight: '600', marginTop: 20 },
  text: { fontSize: 15, color: '#555', marginTop: 8 },
});
