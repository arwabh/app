// src/screens/ForgotPasswordScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { forgotPassword } from '../services/auth';

import { ForgotPasswordScreenProps } from '../types/navigation';

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {

    if (!email) {
      setMessage('Veuillez entrer votre email.');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      setMessage('Un code de réinitialisation a été envoyé à votre email.');
      setTimeout(() => {
        navigation.navigate('VerificationCode', { email });
      }, 1500);
    } catch (error) {
      setMessage('Erreur : Email non trouvé ou serveur indisponible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mot de passe oublié</Text>
      <TextInput
        placeholder="Adresse email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={styles.input}
        autoCapitalize="none"
      />
      {message && <Text style={styles.message}>{message}</Text>}
      <Button title={loading ? 'Envoi...' : 'Envoyer'} onPress={handleRequest} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderBottomWidth: 1, marginBottom: 20, padding: 10 },
  message: { color: 'red', marginBottom: 20 },
});

export default ForgotPasswordScreen;