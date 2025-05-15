import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import HeaderBack from '../../../components/HeaderBack'; // 👈 Importer ton header ici

export default function FaqScreen() {
  return (
    <ScrollView style={styles.container}>
      <HeaderBack title="Question Fréquentes" /> {/* ✅ Ajout du composant ici */}

      <Text style={styles.question}>Q: Comment modifier mon profil ?</Text>
      <Text style={styles.answer}>Allez dans Paramètres {'>'} Compte {'>'} Modifier profil.</Text>

      <Text style={styles.question}>Q: Comment changer mon mot de passe ?</Text>
      <Text style={styles.answer}>Allez dans Paramètres {'>'} Compte {'>'} Modifier mot de passe.</Text>

      <Text style={styles.question}>Q: Qui contacter en cas de problème ?</Text>
      <Text style={styles.answer}>Utilisez l'option 'Contacter le support' disponible dans les paramètres.</Text>

      <Text style={styles.question}>Q: Mes données sont-elles sécurisées ?</Text>
      <Text style={styles.answer}>Oui, vos données sont protégées conformément à notre politique de confidentialité.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fefefe' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#1c3e57', textAlign: 'center' },
  question: { fontSize: 16, fontWeight: '600', marginTop: 20 },
  answer: { fontSize: 15, color: '#555', marginTop: 8 },
});
