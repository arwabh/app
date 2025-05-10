import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Button,
  Alert,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.96.83:5001';

const types = ['Type A', 'Type B', 'Type C'];
const statuts = ['Disponible', 'En service', 'En maintenance', 'Hors service'];

export default function Vehicule() {
  const [vehiculeId, setVehiculeId] = useState<string | null>(null);
  const [matricule, setMatricule] = useState('');
  const [modele, setModele] = useState('');
  const [annee, setAnnee] = useState('');
  const [type, setType] = useState('');
  const [statut, setStatut] = useState('');
  const [carburant, setCarburant] = useState('');
  const [kilometrage, setKilometrage] = useState('');
  const [notes, setNotes] = useState('');
  const [equipements, setEquipements] = useState<any[]>([]);
  const [maintenanceDate, setMaintenanceDate] = useState(new Date());
  const [maintenanceDesc, setMaintenanceDesc] = useState('');
  const [lastMaintenanceDate, setLastMaintenanceDate] = useState(new Date());
  const [lastMaintenanceDesc, setLastMaintenanceDesc] = useState('');

  // Équipement temporaire
  const [equipNom, setEquipNom] = useState('');
  const [equipQuantite, setEquipQuantite] = useState('');
  const [equipDate, setEquipDate] = useState(new Date());

  useEffect(() => {
    const fetchVehicule = async () => {
      try {
        const cin = await AsyncStorage.getItem('userCin');
        const res = await axios.get(`${API_BASE_URL}/api/vehicule/by-cin/${cin}`);
        const v = res.data;
        setVehiculeId(v._id);
        setMatricule(v.matricule);
        setModele(v.modele);
        setAnnee(v.annee);
        setType(v.type);
        setStatut(v.statut);
        setCarburant(v.carburant);
        setKilometrage(v.kilometrage);
        setNotes(v.notes);
        setEquipements(v.equipements || []);
        setMaintenanceDate(new Date(v.prochaineMaintenance?.date));
        setMaintenanceDesc(v.prochaineMaintenance?.description);
        setLastMaintenanceDate(new Date(v.derniereMaintenance?.date));
        setLastMaintenanceDesc(v.derniereMaintenance?.description);
      } catch (err) {
        console.log('Pas de véhicule existant — mode création');
      }
    };

    fetchVehicule();
  }, []);

  const handleAddEquip = () => {
    if (!equipNom || !equipQuantite) return;
    setEquipements([...equipements, {
      nom: equipNom,
      quantite: Number(equipQuantite),
      dernierControle: equipDate
    }]);
    setEquipNom('');
    setEquipQuantite('');
    setEquipDate(new Date());
  };

  const handleSubmit = async () => {
    const vehiculeData = {
      matricule,
      modele,
      annee,
      type,
      statut,
      carburant,
      kilometrage,
      notes,
      prochaineMaintenance: {
        date: maintenanceDate,
        description: maintenanceDesc,
      },
      derniereMaintenance: {
        date: lastMaintenanceDate,
        description: lastMaintenanceDesc,
      },
      equipements,
    };

    try {
      if (vehiculeId) {
        await axios.put(`${API_BASE_URL}/api/vehicule/${vehiculeId}`, vehiculeData);
        Alert.alert('Succès', 'Véhicule mis à jour');
      } else {
        await axios.post(`${API_BASE_URL}/api/vehicule`, vehiculeData);
        Alert.alert('Succès', 'Véhicule enregistré');
      }
    } catch (err) {
      Alert.alert('Erreur', 'Enregistrement impossible');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{vehiculeId ? '✏️ Modifier' : '🚑 Ajouter'} véhicule</Text>

      <TextInput style={styles.input} placeholder="Matricule" value={matricule} onChangeText={setMatricule} />
      <TextInput style={styles.input} placeholder="Modèle" value={modele} onChangeText={setModele} />
      <TextInput style={styles.input} placeholder="Année" keyboardType="numeric" value={annee} onChangeText={setAnnee} />

      <Text style={styles.label}>Type :</Text>
      {types.map((t) => (
        <TouchableOpacity key={t} onPress={() => setType(t)} style={styles.selectItem}>
          <Text style={{ color: type === t ? '#2563eb' : '#000' }}>{t}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.label}>Statut :</Text>
      {statuts.map((s) => (
        <TouchableOpacity key={s} onPress={() => setStatut(s)} style={styles.selectItem}>
          <Text style={{ color: statut === s ? '#2563eb' : '#000' }}>{s}</Text>
        </TouchableOpacity>
      ))}

      <TextInput style={styles.input} placeholder="Carburant" value={carburant} onChangeText={setCarburant} />
      <TextInput style={styles.input} placeholder="Kilométrage" keyboardType="numeric" value={kilometrage} onChangeText={setKilometrage} />
      <TextInput style={[styles.input, styles.textarea]} placeholder="Notes" value={notes} onChangeText={setNotes} multiline />

      <Text style={styles.label}>Prochaine maintenance :</Text>
      <DateTimePicker value={maintenanceDate} mode="date" display="default" onChange={(_, d) => setMaintenanceDate(d || maintenanceDate)} />
      <TextInput style={styles.input} placeholder="Description" value={maintenanceDesc} onChangeText={setMaintenanceDesc} />

      <Text style={styles.label}>Dernière maintenance :</Text>
      <DateTimePicker value={lastMaintenanceDate} mode="date" display="default" onChange={(_, d) => setLastMaintenanceDate(d || lastMaintenanceDate)} />
      <TextInput style={styles.input} placeholder="Description" value={lastMaintenanceDesc} onChangeText={setLastMaintenanceDesc} />

      <Text style={styles.label}>Ajouter un équipement :</Text>
      <TextInput placeholder="Nom" style={styles.input} value={equipNom} onChangeText={setEquipNom} />
      <TextInput placeholder="Quantité" style={styles.input} keyboardType="numeric" value={equipQuantite} onChangeText={setEquipQuantite} />
      <DateTimePicker value={equipDate} mode="date" display="default" onChange={(_, d) => setEquipDate(d || equipDate)} />
      <Button title="Ajouter équipement" onPress={handleAddEquip} />

      {equipements.map((eq, i) => (
        <View key={i} style={styles.equipement}>
          <Text>🔧 {eq.nom} x{eq.quantite} – {new Date(eq.dernierControle).toLocaleDateString()}</Text>
        </View>
      ))}

      <View style={{ marginTop: 20 }}>
        <Button title={vehiculeId ? 'Mettre à jour' : 'Enregistrer'} onPress={handleSubmit} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f1f5f9', flexGrow: 1 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  label: { marginTop: 16, fontWeight: 'bold', color: '#1e293b' },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1',
    borderRadius: 8, padding: 10, marginBottom: 12,
  },
  textarea: { height: 100, textAlignVertical: 'top' },
  selectItem: {
    padding: 10, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 6,
    marginBottom: 6,
  },
  equipement: {
    marginTop: 6,
    padding: 8,
    backgroundColor: '#e0f2fe',
    borderRadius: 6,
  },
});
