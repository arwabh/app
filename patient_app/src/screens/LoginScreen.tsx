// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    // Simulez une requête API ici
    try {
      // Exemple d'authentification réussie
      await SecureStore.setItemAsync('userToken', 'mock_token');
      navigation.navigate('Home');
    } catch (error) {
      setError('Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>PatientCare</Text>
      </View>

      {/* Formulaire */}
      <View style={styles.formContainer}>
        <Text style={styles.title}>Connexion utilisateur</Text>
        
        {/* Message d'erreur */}
        {error && <Text style={styles.error}>{error}</Text>}
        
        {/* Email */}
        <View style={styles.inputGroup}>
          <Ionicons name="mail-outline" size={20} color="#666" />
          <TextInput 
            placeholder="Adresse email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            style={styles.input}
            autoCapitalize="none"
          />
        </View>

        {/* Mot de passe */}
        <View style={styles.inputGroup}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" />
          <TextInput 
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            autoCapitalize="none"
          />
        </View>

        {/* Bouton de connexion */}
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>
              Se connecter →
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Liens */}
      <View style={styles.linksContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
          <Text style={styles.link}>Mot de passe oublié ?</Text>
        </TouchableOpacity>
        <View style={styles.signupLink}>
          <Text style={styles.link}>Pas encore de compte ? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signupText}>Créer un compte</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    height: 40,
    marginLeft: 10,
  },
  submitButton: {
    marginTop: 10,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linksContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  link: {
    color: '#666',
    marginBottom: 10,
  },
  signupLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signupText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default LoginScreen;