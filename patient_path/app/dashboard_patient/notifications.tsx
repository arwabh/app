// app/dashboard_patient/notifications.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Notifications() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>📢 Aucune notification pour l’instant</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5fcff',
  },
  text: {
    fontSize: 18,
    color: '#333',
  },
});
