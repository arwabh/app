// app/dashboard_patient/Logout.tsx

import React, { useEffect } from 'react';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function Logout() {
  useEffect(() => {
    const clearDataAndRedirect = async () => {
      await SecureStore.deleteItemAsync("userToken");

      router.replace('/login');
    };
    clearDataAndRedirect();
  }, []);

  return null;
}
