import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const API_BASE_URL = 'http://192.168.93.83:5001';

const specialites = [
  'Cardiologie', 'Dermatologie', 'Gynécologie', 'Neurologie', 'Pédiatrie',
  'Psychiatrie', 'Radiologie', 'Urologie', 'Anesthésie', 'Médecine Générale'
];

export default function UnifiedProfile() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [user, setUser] = useState<any>(null);
  const [reason, setReason] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (id) {
      axios.get(`${API_BASE_URL}/api/users/${id}`)
        .then(res => setUser(res.data))
        .catch(err => console.log(err));
    }
  }, [id]);

  const handleSubmit = async () => {
    const patientId = await AsyncStorage.getItem('userId');
    if (!selectedDate || (!reason && !selectedSpecialty) || !patientId || !user?._id) {
      Alert.alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/appointments`, {
        patientId,
        doctorId: user._id,
        reason: user.roles.includes('Hospital') ? selectedSpecialty : reason,
        date: selectedDate,
        type: 'medical',
      });

      // ✅ Affiche le modal de succès
      setModalVisible(true);

      // ✅ Redirige vers le tableau de bord après 3 secondes
      setTimeout(() => {
        setModalVisible(false);
        router.push('/dashboard_patient/home');
      }, 3000);
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la prise de rendez-vous.');
    }
  };

  if (!user) return <Text style={{ padding: 20 }}>Chargement...</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Image
          source={{ uri: user.photo ? `${API_BASE_URL}/${user.photo}` : 'https://cdn-icons-png.flaticon.com/512/9131/9131529.png' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{user.nom} {user.prenom}</Text>
        {user.specialite && <Text style={styles.specialty}>{user.specialite}</Text>}
        <Text style={styles.address}>📍 {user.adresse}</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>📅 Choisissez une date :</Text>
        <View style={styles.calendarBox}>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => date && setSelectedDate(date)}
            dateFormat="P"
            minDate={new Date()}
            placeholderText="Choisir date"
            className="form-control"
          />
        </View>

        {user.roles.includes('Hospital') ? (
          <>
            <Text style={styles.label}>🏥 Spécialité :</Text>
            <select
              style={styles.select}
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
            >
              <option value="">-- Choisir une spécialité --</option>
              {specialites.map((spec, idx) => (
                <option key={idx} value={spec}>{spec}</option>
              ))}
            </select>
          </>
        ) : (
          <>
            <Text style={styles.label}>📝 Motif :</Text>
            <TextInput
              style={styles.textarea}
              placeholder="Motif du rendez-vous"
              multiline
              value={reason}
              onChangeText={setReason}
            />
          </>
        )}

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>📅 Prendre rendez-vous</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ Modal de confirmation */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'green', textAlign: 'center' }}>
              ✅ Rendez-vous pris avec succès
            </Text>
            <Text style={{ marginTop: 8, textAlign: 'center' }}>
              En attente de confirmation...
            </Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#e9f1ff',
    flexGrow: 1,
  },
  card: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  specialty: {
    color: '#666',
    marginVertical: 4,
  },
  address: {
    color: '#444',
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
  },
  calendarBox: {
    backgroundColor: '#f1f5f9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 6,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  select: {
    width: '100%',
    padding: 10,
    borderRadius: 6,
    borderColor: '#ccc',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    maxWidth: 300,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
});
