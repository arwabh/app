import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function WaitingValidation() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>⏳ Inscription en attente</Text>
      <Text style={styles.text}>
        Votre demande d'inscription a été reçue. Un administrateur va vérifier vos informations.
        Vous recevrez un email une fois votre compte validé.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  title: {
    fontSize: 24, fontWeight: 'bold', color: '#2F80ED', marginBottom: 12,
  },
  text: {
    fontSize: 16, color: '#333', textAlign: 'center',
  },
});
