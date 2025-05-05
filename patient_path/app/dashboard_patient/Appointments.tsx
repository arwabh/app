// app/dashboard_patient/Appointments.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { colors } from '../../theme';

const API_URL = 'http://192.168.135.83:5001';

type Doctor = {
    _id: string;
    nom: string;
    adresse: string;
    roles: string[];
  };
  
  type Lab = {
    _id: string;
    nom: string;
    adresse: string;
  };
  
  type Hospital = {
    _id: string;
    nom: string;
    adresse: string;
    roles: string[];
  };
  
const Appointments = () => {
  const [userId, setUserId] = useState('');
  const [type, setType] = useState<'medecin' | 'hopital' | 'laboratoire' | ''>('');
  const [specialty, setSpecialty] = useState('');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
const [labs, setLabs] = useState<Lab[]>([]);
const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    const id = localStorage.getItem('userId');
    if (id) {
      setUserId(id);
      fetchDoctors();
      fetchLabs();
      fetchHospitals();
    }
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/medecins-valides`);
      setDoctors(res.data as Doctor[]);
    } catch {
      setDoctors([]);
    }
  };
  
  const fetchLabs = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/labs-valides`);
      setLabs(res.data as Lab[]);
    } catch {
      setLabs([]);
    }
  };
  
  const fetchHospitals = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/medecins-valides`);
      const all = res.data as Hospital[];
      const onlyHospitals = all.filter((u) => u.roles.includes('hopital'));
      setHospitals(onlyHospitals);
    } catch {
      setHospitals([]);
    }
  };
  

  const handleSubmit = async () => {
    if (!userId || !selectedId || !date || !reason) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    try {
      if (type === 'medecin') {
        await axios.post(`${API_URL}/api/appointments`, {
          patientId: userId,
          doctorId: selectedId,
          date,
          reason
        });
      } else if (type === 'laboratoire') {
        await axios.post(`${API_URL}/api/lab-appointments`, {
          patientId: userId,
          labId: selectedId,
          date,
          reason
        });
      } else if (type === 'hopital') {
        await axios.post(`${API_URL}/api/hospital-appointments`, {
          patientId: userId,
          hospitalId: selectedId,
          specialty
        });
      }

      Alert.alert('Succès', 'Rendez-vous demandé avec succès.');
      setDate('');
      setReason('');
      setSelectedId('');
      setSpecialty('');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de prendre le rendez-vous.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Prendre un Rendez-vous</Text>

      <Text style={styles.label}>Type de rendez-vous</Text>
      <Picker
        selectedValue={type}
        onValueChange={(val) => setType(val)}
        style={styles.picker}
      >
        <Picker.Item label="Choisir..." value="" />
        <Picker.Item label="Médecin" value="medecin" />
        <Picker.Item label="Hôpital" value="hopital" />
        <Picker.Item label="Laboratoire" value="laboratoire" />
      </Picker>

      {type !== '' && (
        <>
          <Text style={styles.label}>
            {type === 'medecin'
              ? 'Médecin'
              : type === 'hopital'
              ? 'Hôpital'
              : 'Laboratoire'}
          </Text>
          <Picker
            selectedValue={selectedId}
            onValueChange={(val) => setSelectedId(val)}
            style={styles.picker}
          >
            <Picker.Item label="Sélectionner..." value="" />
            {(type === 'medecin' ? doctors : type === 'hopital' ? hospitals : labs).map((item: any) => (
              <Picker.Item
                key={item._id}
                label={`${item.nom} - ${item.adresse}`}
                value={item._id}
              />
            ))}
          </Picker>
        </>
      )}

      {type === 'hopital' && (
        <>
          <Text style={styles.label}>Spécialité demandée</Text>
          <TextInput
            style={styles.input}
            placeholder="Spécialité"
            value={specialty}
            onChangeText={setSpecialty}
          />
        </>
      )}

      {(type === 'medecin' || type === 'laboratoire') && (
        <>
          <Text style={styles.label}>Date et heure</Text>
          <TextInput
            style={styles.input}
            placeholder="AAAA-MM-JJ HH:MM"
            value={date}
            onChangeText={setDate}
          />
          <Text style={styles.label}>Raison</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            multiline
            placeholder="Décrivez votre besoin"
            value={reason}
            onChangeText={setReason}
          />
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Envoyer la demande</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    padding: 20,
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
  },
  label: {
    marginTop: 10,
    fontSize: 16,
    color: colors.text,
  },
  picker: {
    backgroundColor: colors.surface,
    marginVertical: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginVertical: 8,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontWeight: '600',
  },
});

export default Appointments;
