import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

const API_BASE_URL = 'http://192.168.122.83:5001';

const specialites = [
  'Cardiologie', 'Dermatologie', 'Gynécologie', 'Neurologie', 'Pédiatrie',
  'Psychiatrie', 'Radiologie', 'Urologie', 'Anesthésie', 'Médecine Générale'
];

export default function UnifiedProfile() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [user, setUser] = useState<any>(null);
  const [reason, setReason] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
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
    if ((!reason && !selectedSpecialty) || !patientId || !user?._id) {
      alert('Veuillez remplir tous les champs');
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

      setModalVisible(true);

      setTimeout(() => {
        setModalVisible(false);
        router.push('/dashboard_patient/home');
      }, 3000);
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la prise de rendez-vous');
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
        <Text style={styles.label}>Choisir la date :</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>
            {selectedDate.toLocaleDateString()}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            minimumDate={new Date()}
            display="default"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) setSelectedDate(date);
            }}
          />
        )}

        {user.roles.includes('Hospital') ? (
          <>
            <Text style={styles.label}>Spécialité :</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedSpecialty}
                onValueChange={(itemValue) => setSelectedSpecialty(itemValue)}
              >
                <Picker.Item label="-- Choisir une spécialité --" value="" />
                {specialites.map((spec, idx) => (
                  <Picker.Item key={idx} label={spec} value={spec} />
                ))}
              </Picker>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.label}>Motif :</Text>
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

      <Modal visible={modalVisible} transparent animationType="fade">
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
  container: { padding: 20, backgroundColor: '#F0FAF9', flexGrow: 1 },
  card: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  name: { fontSize: 20, fontWeight: 'bold', color: '#226D68' },
  specialty: { color: '#666', marginVertical: 4 },
  address: { color: '#444' },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    marginTop: 10,
  },
  label: { fontWeight: '700', marginBottom: 8, color: '#1c3e57' },
  dateInput: {
    backgroundColor: '#e8f6f3',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  dateText: { color: '#226D68', fontWeight: 'bold' },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 16,
    overflow: 'hidden',
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#226D68',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontWeight: 'bold' },
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
    width: 300,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
});
