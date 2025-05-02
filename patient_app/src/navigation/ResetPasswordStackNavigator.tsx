// src/navigation/ResetPasswordStackNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/native-stack';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import VerificationCodeScreen from '../screens/VerificationCodeScreen';
import NewPasswordScreen from '../screens/NewPasswordScreen';
import { ResetPasswordStackParamList } from '../types/navigation';

// ✅ Utilisez le type ResetPasswordStackParamList ici
const Stack = createStackNavigator<ResetPasswordStackParamList>();

export default function ResetPasswordStackNavigator() {
  return (
    <Stack.Navigator initialRouteName="ForgotPassword">
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="VerificationCode" 
        component={VerificationCodeScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="NewPassword" 
        component={NewPasswordScreen} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
}