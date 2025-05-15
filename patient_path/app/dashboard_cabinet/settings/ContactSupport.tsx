import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import HeaderBack from '../../../components/HeaderBack'; // 👈 Importer ton header ici

const API_BASE_URL = 'http://192.168.122.83:5001';

export default function ContactSupportScreen() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState('');
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const storedEmail = await AsyncStorage.getItem('email');
      const storedName = await AsyncStorage.getItem('fullName'); // Ajoute si stocké dans AsyncStorage (optionnel)
      setForm((prev) => ({
        ...prev,
        email: storedEmail || '',
        name: storedName || '',
      }));
    };
    loadUser();
  }, []);

  const confirmSubmit = () => {
    if (!form.name || !form.email || !form.message) {
      Alert.alert('Erreur', 'Tous les champs sont requis.');
      return;
    }
    setShowModal(true);
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    setShowModal(false);
    setStatus('');

    try {
      const res = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus('✅ Message envoyé avec succès !');
        setForm({ ...form, message: '' }); // On garde l'email et le nom
      } else {
        setStatus(`❌ ${data.message || 'Une erreur est survenue.'}`);
      }
    } catch (err) {
      setStatus('❌ Impossible d’envoyer le message. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <HeaderBack title=" Contactez le support"/>

      <TextInput
        placeholder="Votre nom"
        style={styles.input}
        value={form.name}
        onChangeText={(text) => setForm({ ...form, name: text })}
      />

      <TextInput
        placeholder="Votre email (non modifiable)"
        style={[styles.input, { backgroundColor: '#eee' }]}
        value={form.email}
        editable={false}
      />

      <TextInput
        placeholder="Votre message"
        style={[styles.input, { height: 120 }]}
        multiline
        value={form.message}
        onChangeText={(text) => setForm({ ...form, message: text })}
      />

      <TouchableOpacity style={styles.button} onPress={confirmSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Envoi en cours...' : 'Envoyer le message'}</Text>
      </TouchableOpacity>

      {status ? <Text style={styles.status}>{status}</Text> : null}

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Confirmer l'envoi</Text>
            <Text>Nom: {form.name}</Text>
            <Text>Email: {form.email}</Text>
            <Text style={{ marginTop: 10 }}>Message:</Text>
            <Text>{form.message}</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleFinalSubmit}>
                <Text style={{ color: 'white' }}>Confirmer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fefefe', flex: 1 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16, backgroundColor: '#fff' },
  button: { backgroundColor: '#2e86de', padding: 14, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  status: { textAlign: 'center', marginTop: 16, color: '#2e7d32' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '80%' },
  modalButtons: { flexDirection: 'row', marginTop: 20, justifyContent: 'space-between' },
  confirmBtn: { backgroundColor: '#2e86de', padding: 10, borderRadius: 6 },
  cancelBtn: { padding: 10 },
});
