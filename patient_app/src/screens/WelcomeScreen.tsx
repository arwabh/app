// src/screens/WelcomeScreen.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import OnboardingCarousel from '../components/OnboardingCarousel';

const WelcomeScreen = ({ navigation }: { navigation: any }) => {
  const handleSkip = () => {
    navigation.navigate('SignIn');
  };

  return (
    <View style={styles.container}>
      <OnboardingCarousel onComplete={handleSkip} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default WelcomeScreen;