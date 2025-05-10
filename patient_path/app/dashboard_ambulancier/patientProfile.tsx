import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  TouchableOpacity,
  Button,
  StyleSheet
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.93.83:5001';

export default function PatientProfile() {
  const { nom, prenom, telephone } = useLocalSearchParams();
  const [age, setAge] = useState('');
  const [pickupLocation, setPickupLocation] = useState('Chargement...');
  const [pickupTime, setPickupTime] = useState(new Date());

  const [vehiculeId, setVehiculeId] = useState('');
  const [condition, setCondition] = useState('');
  const [consciousness, setConsciousness] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [temperature, setTemperature] = useState('');
  const [oxygenSaturation, setOxygenSaturation] = useState('');
  const [interventions, setInterventions] = useState('');
  const [medications, setMedications] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState('');
  const [notes, setNotes] = useState('');

  const [hospitalResults, setHospitalResults] = useState<any[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
  const [selectedHospitalLabel, setSelectedHospitalLabel] = useState<string | null>(null);
  const [isHospitalSelected, setIsHospitalSelected] = useState(false);

  // Obtenir position GPS
  useEffect(() => {
    const getLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Activez la localisation pour continuer');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const reverse = await Location.reverseGeocodeAsync(loc.coords);

      if (reverse.length > 0) {
        const { street, city, region } = reverse[0];
        setPickupLocation(`${street ?? ''}, ${city ?? ''}, ${region ?? ''}`);
      } else {
        setPickupLocation('Lieu introuvable');
      }
    };

    setPickupTime(new Date());
    getLocation();
  }, []);

  const fetchHospitals = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/hospitals`);
      setHospitalResults(res.data);
    } catch (err) {
      console.log('Erreur chargement hôpitaux:', err);
    }
  };

  const handleSubmit = async () => {
    if (!pickupLocation || !urgencyLevel || !selectedHospitalId) {
      Alert.alert('Champs obligatoires manquants', 'Merci de remplir les champs requis.');
      return;
    }

    const report = {
      ambulancierId: 'remplacer_par_asyncstorage_ou_token',
      patientInfo: { nom, prenom, age: Number(age), telephone },
      missionDetails: {
        pickupLocation,
        pickupTime,
        vehiculeId,
      },
      medicalInfo: {
        condition,
        consciousness,
        vitals: {
          bloodPressure,
          heartRate: Number(heartRate),
          temperature: Number(temperature),
          oxygenSaturation: Number(oxygenSaturation),
        },
        interventions: interventions.split(','),
        medications: medications.split(','),
      },
      urgencyLevel,
      hospitalId: selectedHospitalId,
      notes,
      status: 'submitted',
    };

    try {
      await axios.post(`${API_BASE_URL}/api/ambulance/report`, report);
      Alert.alert('Succès', 'Rapport transmis à l’hôpital sélectionné');
    } catch (err) {
      console.log(err);
      Alert.alert('Erreur', 'Échec de l’envoi du rapport');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📋 Rapport d'intervention</Text>
      <Text>👤 {prenom} {nom} — {telephone}</Text>
      <TextInput style={styles.input} placeholder="Âge" keyboardType="numeric" value={age} onChangeText={setAge} />

      <Text style={styles.info}>📍 Lieu de prise en charge : {pickupLocation}</Text>
      <Text style={styles.info}>🕒 Heure : {pickupTime.toLocaleTimeString()}</Text>

      <TextInput style={styles.input} placeholder="ID du véhicule" value={vehiculeId} onChangeText={setVehiculeId} />
      <TextInput style={styles.input} placeholder="État du patient" value={condition} onChangeText={setCondition} />
      <TextInput style={styles.input} placeholder="Conscience (Conscient, Inconscient...)" value={consciousness} onChangeText={setConsciousness} />

      <TextInput style={styles.input} placeholder="Tension artérielle" value={bloodPressure} onChangeText={setBloodPressure} />
      <TextInput style={styles.input} placeholder="Fréquence cardiaque" keyboardType="numeric" value={heartRate} onChangeText={setHeartRate} />
      <TextInput style={styles.input} placeholder="Température" keyboardType="numeric" value={temperature} onChangeText={setTemperature} />
      <TextInput style={styles.input} placeholder="Saturation O₂" keyboardType="numeric" value={oxygenSaturation} onChangeText={setOxygenSaturation} />

      <TextInput style={styles.input} placeholder="Interventions (virgule)" value={interventions} onChangeText={setInterventions} />
      <TextInput style={styles.input} placeholder="Médicaments (virgule)" value={medications} onChangeText={setMedications} />
      <TextInput style={styles.input} placeholder="Niveau d'urgence (Faible, Moyenne, Critique...)" value={urgencyLevel} onChangeText={setUrgencyLevel} />

      <Text style={styles.subtitle}>🏥 Hôpitaux disponibles</Text>
      <TouchableOpacity
        onPress={fetchHospitals}
        style={[
          styles.searchButton,
          isHospitalSelected && styles.searchButtonSelected
        ]}
        disabled={isHospitalSelected}
      >
        <Text style={styles.searchButtonText}>
          {isHospitalSelected ? '✓ Hôpital sélectionné' : 'Rechercher les hôpitaux'}
        </Text>
      </TouchableOpacity>

      {hospitalResults.map((hosp) => (
        <Text
          key={hosp._id}
          style={styles.hospitalItem}
          onPress={() => {
            setSelectedHospitalId(hosp._id);
            setSelectedHospitalLabel(`${hosp.nom} - ${hosp.adresse}`);
            setIsHospitalSelected(true);
          }}
        >
          {hosp.nom} - {hosp.adresse}
        </Text>
      ))}

      {selectedHospitalLabel && (
        <Text style={styles.info}>✅ Hôpital sélectionné : {selectedHospitalLabel}</Text>
      )}

      <TextInput
        style={[styles.input, styles.textarea]}
        placeholder="Notes..."
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      <Button title="Envoyer le rapport" onPress={handleSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  subtitle: { marginTop: 20, fontWeight: '600' },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 10, marginBottom: 12, backgroundColor: '#fff',
  },
  textarea: { height: 100, textAlignVertical: 'top' },
  hospitalItem: {
    padding: 8, backgroundColor: '#e2e8f0',
    borderRadius: 6, marginBottom: 6,
  },
  info: { marginBottom: 12, color: '#334155' },
  searchButton: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  searchButtonSelected: {
    backgroundColor: 'green',
    opacity: 0.8,
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
