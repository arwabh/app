import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, Alert } from 'react-native';
import CalendarPicker from 'react-native-calendar-picker';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.96.83:5001';

const UnifiedProfile = ({ route, navigation }) => {
  const { user, type } = route.params; // "user" = docteur/labo/hôpital, "type" = 'medical' ou 'laboratory'
  const [selectedDate, setSelectedDate] = useState(null);
  const [reason, setReason] = useState('');
  const patientId = localStorage.getItem('userId'); // remplace par SecureStore si nécessaire

  const handleSubmit = async () => {
    if (!selectedDate || !reason.trim()) {
      Alert.alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/appointments`, {
        patientId,
        doctorId: user._id,
        reason,
        date: selectedDate,
        type
      });

      Alert.alert('✅ Rendez-vous enregistré !');
      navigation.navigate('dashboard_patient/home');
    } catch (error) {
      Alert.alert('❌ Erreur lors de la prise de rendez-vous');
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#f0f4ff' }}>
      <View style={{ alignItems: 'center' }}>
        <Image
          source={{
            uri:
              user.photo && user.roles.includes('Doctor')
                ? `${API_BASE_URL}/${user.photo}`
                : 'https://cdn-icons-png.flaticon.com/512/9131/9131529.png',
          }}
          style={{ width: 100, height: 100, borderRadius: 50 }}
        />
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 10 }}>
          {user.nom} {user.prenom}
        </Text>

        {user.specialty && (
          <Text style={{ fontSize: 16, color: '#888' }}>{user.specialty}</Text>
        )}
        <Text style={{ fontSize: 14, color: '#444', marginTop: 4 }}>{user.adresse}</Text>
      </View>

      <Text style={{ fontWeight: 'bold', marginVertical: 15 }}>Choisissez une date :</Text>
      <CalendarPicker
        onDateChange={(date) => setSelectedDate(date)}
        minDate={new Date()}
        selectedDayColor="#3c82f6"
      />

      <TextInput
        placeholder="Motif du rendez-vous"
        value={reason}
        onChangeText={setReason}
        multiline
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 5,
          padding: 10,
          marginTop: 20,
          minHeight: 80,
          backgroundColor: '#fff'
        }}
      />

      <TouchableOpacity
        onPress={handleSubmit}
        style={{
          backgroundColor: '#3c82f6',
          padding: 12,
          borderRadius: 8,
          alignItems: 'center',
          marginTop: 20
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Prendre rendez-vous</Text>
      </TouchableOpacity>
    </View>
  );
};

export default UnifiedProfile;
