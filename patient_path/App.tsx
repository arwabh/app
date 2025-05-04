import React from 'react';
import { Slot } from 'expo-router';
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'props.pointerEvents is deprecated',
]);

export default function App() {
  return <Slot />;
}
