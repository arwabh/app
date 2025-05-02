// src/screens/NewPasswordScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { resetPassword } from '../services/auth';

import { NewPasswordScreenProps } from '../types/navigation';

const NewPasswordScreen: React.FC<NewPasswordScreenProps> = ({ navigation, route }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { email } = route.params;


  const isStrongPassword = (pass: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(pass);
  };

  const handleSubmit = async () => {
    if (!isStrongPassword(password)) {
      setMessage('Le mot de passe doit contenir 8 caractères avec majuscule, minuscule, chiffre et symbole.');
      return;
    }
    if (password !== confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, password);
      setMessage('Mot de passe mis à jour ! Redirection...');
      setTimeout(() => {
        navigation.navigate('Login');
      }, 1500);
    } catch (error) {
      setMessage('Erreur lors de la réinitialisation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nouveau mot de passe</Text>
      <TextInput
        placeholder="Nouveau mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        placeholder="Confirmer le mot de passe"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={styles.input}
      />
      {message && <Text style={styles.message}>{message}</Text>}
      <Button title={loading ? 'Mise à jour...' : 'Mettre à jour'} onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderBottomWidth: 1, marginBottom: 20, padding: 10 },
  message: { color: 'red', marginBottom: 20 },
});

export default NewPasswordScreen;