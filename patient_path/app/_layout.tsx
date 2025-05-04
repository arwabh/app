// app/_layout.tsx
import React from 'react';
import { Slot } from 'expo-router';
import { AuthContextProvider } from '../context/AuthContext'; // Si tu utilises un contexte
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthContextProvider>
        <Slot />
      </AuthContextProvider>
    </SafeAreaProvider>
  );
}
