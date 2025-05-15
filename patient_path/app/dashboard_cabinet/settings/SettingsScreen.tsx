import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
              <Text style={styles.sectionTitle}></Text>


      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compte</Text>
        <TouchableOpacity style={styles.item} onPress={() => router.push('/../settings/EditProfile')}>
          <Text style={styles.itemText}>Modifier profil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item} onPress={() => router.push('/settings/EditPassword')}>
          <Text style={styles.itemText}>Modifier mot de passe</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.item, { borderColor: '#d9534f' }]} onPress={() => router.push('/settings/DeleteAccount')}>
          <Text style={[styles.itemText, { color: '#d9534f' }]}>Supprimer le compte</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <TouchableOpacity style={styles.item} onPress={() => router.push('/settings/Faq')}>
          <Text style={styles.itemText}>FAQ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item} onPress={() => router.push('/settings/ContactSupport')}>
          <Text style={styles.itemText}>Contacter le support</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item} onPress={() => router.push('/settings/PrivacyPolicy')}>
          <Text style={styles.itemText}>Politique de confidentialité</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0faf9' },
  header: {
    backgroundColor: '#0a3d62',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerText: { color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  section: { marginBottom: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#0a3d62' },
  item: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 1,
  },
  itemText: { fontSize: 16, color: '#333' },
});
