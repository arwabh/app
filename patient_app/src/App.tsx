// src/App.tsx
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import * as SecureStore from 'expo-secure-store';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await SecureStore.getItemAsync('userToken');
      setIsAuthenticated(!!token);
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return <AppNavigator />;
};

export default App;