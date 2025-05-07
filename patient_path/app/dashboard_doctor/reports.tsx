import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, Button, TouchableOpacity, Alert, ActivityIndicator, Linking
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';

interface Patient {
  _id: string;
  nom: string;
  prenom: string;
}

interface Appointment {
    _id: string;
    date: string;
    status: string;
    patient: Patient;
  }
  

interface Report {
  _id: string;
  patientId: Patient;
  appointmentId: string;
  fileUrl: string;
  description: string;
  createdAt: string;
}

export default function MedicalReports() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [selectedAppointment, setSelectedAppointment] = useState<string>('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<any>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const id = await AsyncStorage.getItem('userId');
      setDoctorId(id);
      fetchPatients(id);
      fetchReports(id);
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedPatient && doctorId) {
      fetchAppointments(selectedPatient, doctorId);
    } else {
      setAppointments([]);
      setSelectedAppointment('');
    }
  }, [selectedPatient]);

  const fetchPatients = async (id: string | null) => {
    if (!id) return;
    try {
      const res = await axios.get(`http://192.168.96.83:5001/api/doctor/${id}/patients`);
      setPatients(res.data);
    } catch (err) {
      console.error('Erreur chargement patients:', err);
    }
  };

  const fetchAppointments = async (patientId: string, doctorId: string) => {
    try {
      const res = await axios.get(`http://192.168.96.83:5001/api/doctor/appointments/${doctorId}`);
      const confirmed = res.data.filter((apt: Appointment) => apt.patient._id === patientId && apt.status === 'confirmed');
      setAppointments(confirmed);
    } catch (err) {
      console.error('Erreur chargement rendez-vous:', err);
    }
  };

  const fetchReports = async (id: string | null) => {
    if (!id) return;
    try {
      const res = await axios.get(`http://192.168.96.83:5001/api/medical-reports/doctor/${id}`);
      setReports(res.data);
    } catch (err) {
      console.error('Erreur chargement rapports:', err);
    }
  };

  const handleFilePick = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
    });
    if (res.assets?.[0]) {
      setFile(res.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!doctorId || !selectedPatient || !selectedAppointment || !description || !file) {
      Alert.alert('Champs manquants', 'Tous les champs sont requis.');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('doctorId', doctorId);
      formData.append('patientId', selectedPatient);
      formData.append('appointmentId', selectedAppointment);
      formData.append('description', description);
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/octet-stream',
      } as any);

      await axios.post('http://192.168.96.83:5001/api/medical-reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setDescription('');
      setFile(null);
      fetchReports(doctorId);
    } catch (err) {
      console.error('Erreur envoi rapport:', err);
      Alert.alert('Erreur', 'Impossible d\'envoyer le rapport.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reportId: string) => {
    Alert.alert('Confirmation', 'Supprimer ce rapport ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        onPress: async () => {
          try {
            await axios.delete(`http://192.168.96.83:5001/api/medical-reports/${reportId}`);
            fetchReports(doctorId);
          } catch (err) {
            console.error('Erreur suppression rapport:', err);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📋 Rapports médicaux</Text>

      <View style={styles.form}>
        <Text style={styles.label}>👤 Patient</Text>
        <View style={styles.picker}>
          {patients.map(p => (
            <TouchableOpacity
              key={p._id}
              style={[
                styles.option,
                selectedPatient === p._id && styles.selected,
              ]}
              onPress={() => setSelectedPatient(p._id)}
            >
              <Text>{p.prenom} {p.nom}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {appointments.length > 0 && (
          <>
            <Text style={styles.label}>📅 Rendez-vous</Text>
            <View style={styles.picker}>
              {appointments.map(a => (
                <TouchableOpacity
                  key={a._id}
                  style={[
                    styles.option,
                    selectedAppointment === a._id && styles.selected,
                  ]}
                  onPress={() => setSelectedAppointment(a._id)}
                >
                  <Text>{formatDate(a.date)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <Text style={styles.label}>📝 Description</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="Description du rapport"
        />

        <TouchableOpacity onPress={handleFilePick} style={styles.uploadBtn}>
          <Text style={styles.uploadBtnText}>📎 Choisir un fichier</Text>
        </TouchableOpacity>
        {file && <Text style={styles.filename}>Fichier: {file.name}</Text>}

        <Button title="Envoyer" onPress={handleSubmit} disabled={loading} />
      </View>

      <Text style={styles.subTitle}>📂 Rapports envoyés</Text>
      {loading && <ActivityIndicator size="large" color="#1976d2" />}
      {reports.map((r) => (
        <View key={r._id} style={styles.reportCard}>
          <Text style={styles.reportText}>
            👤 {r.patientId.prenom} {r.patientId.nom}
          </Text>
          <Text style={styles.reportText}>📝 {r.description}</Text>
          <Text style={styles.reportText}>🕒 {formatDate(r.createdAt)}</Text>
          <TouchableOpacity
            onPress={() => Linking.openURL(`http://192.168.96.83:5001/${r.fileUrl}`)}
            style={styles.downloadBtn}
          >
            <Text style={styles.downloadText}>📄 Voir le rapport</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(r._id)}>
            <Text style={styles.deleteText}>🗑️ Supprimer</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f5f9fa' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: '#2c3e50' },
  form: { marginBottom: 24 },
  label: { marginTop: 12, fontWeight: '600' },
  picker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: {
    backgroundColor: '#e0e0e0',
    padding: 8,
    borderRadius: 8,
    marginVertical: 6,
  },
  selected: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  uploadBtn: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  uploadBtnText: {
    color: '#333',
  },
  filename: {
    color: '#444',
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#2c3e50',
  },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    elevation: 1,
  },
  reportText: {
    color: '#333',
    marginBottom: 4,
  },
  downloadBtn: {
    marginTop: 8,
  },
  downloadText: {
    color: '#1976d2',
    fontWeight: '600',
  },
  deleteText: {
    marginTop: 6,
    color: '#e53935',
    fontWeight: '600',
  },
});
