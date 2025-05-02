// src/screens/SplashScreen.tsx
import React, { useEffect } from 'react';
import { View, Image, Text, ActivityIndicator } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// Assurez-vous que le logo est dans assets/logo.png
const SplashScreenComponent = ({ navigation }: any) => {
  useEffect(() => {
    // Empêche le splashscreen de disparaître automatiquement
    SplashScreen.preventAutoHideAsync();

    // Simule un chargement de 3 secondes (ajustez selon vos besoins)
    const prepareApp = async () => {
      try {
        // Exemples d'initialisations possibles :
        // - Chargement des polices
        // - Vérification de l'authentification
        // - Préchargement de données
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (e) {
        console.warn('Erreur lors de l’initialisation', e);
      } finally {
        // Cache le splashscreen et navigue vers l'écran suivant
        await SplashScreen.hideAsync();
        navigation.replace('Welcome'); // Redirige vers l'onboarding ou la connexion
      }
    };

    prepareApp();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#4CAF50' }}>
      {/* Logo */}
      <Image 
        source={require('../../assets/logo.png')} 
        style={{ width: 150, height: 150, marginBottom: 20 }}
        resizeMode="contain"
      />
      
      {/* Texte */}
      <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>
        Bienvenue dans l'App Santé
      </Text>
      
      {/* Indicateur de chargement */}
      <ActivityIndicator size="small" color="#fff" />
    </View>
  );
};

export default SplashScreenComponent;