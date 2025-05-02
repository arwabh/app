// src/screens/VerificationCodeScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { VerificationCodeScreenProps } from '../types/navigation';

const VerificationCodeScreen: React.FC<VerificationCodeScreenProps> = ({ navigation, route }) => {
    const [code, setCode] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { email } = route.params;
  
    const handleVerify = () => {
      if (!code || code.length !== 6) {
        setMessage('Le code doit contenir 6 chiffres.');
        return;
      }
      navigation.navigate('NewPassword', { email });
    };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vérification</Text>
      <TextInput
        placeholder="Code de réinitialisation"
        value={code}
        onChangeText={setCode}
        keyboardType="numeric"
        style={styles.input}
        maxLength={6}
      />
      {message && <Text style={styles.message}>{message}</Text>}
      <Button title={loading ? 'Vérification...' : 'Valider'} onPress={handleVerify} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderBottomWidth: 1, marginBottom: 20, padding: 10 },
  message: { color: 'red', marginBottom: 20 },
});

export default VerificationCodeScreen;