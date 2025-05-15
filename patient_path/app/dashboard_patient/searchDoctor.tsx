import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Image, Platform
} from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const API_BASE_URL = 'http://192.168.122.83:5001';

const villes = [
  'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Zaghouan', 'Bizerte', 'Béja',
  'Jendouba', 'Le Kef', 'Siliana', 'Sousse', 'Monastir', 'Mahdia', 'Sfax', 'Kairouan',
  'Kasserine', 'Sidi Bouzid', 'Gabès', 'Medenine', 'Tataouine', 'Gafsa', 'Tozeur', 'Kebili'
];

const specialites = [
  { key: 'Cardiologie', value: 'Cardiologie' },
  { key: 'Dermatologie', value: 'Dermatologie' },
  { key: 'Gynécologie', value: 'Gynécologie' },
  { key: 'Neurologie', value: 'Neurologie' },
  { key: 'Pédiatrie', value: 'Pédiatrie' },
  { key: 'Psychiatrie', value: 'Psychiatrie' },
  { key: 'Radiologie', value: 'Radiologie' },
  { key: 'Urologie', value: 'Urologie' },
  { key: 'Anesthésie', value: 'Anesthésie' },
  { key: 'Médecine Générale', value: 'Médecine Générale' },
];
const categories = ['Médecin', 'Laboratoire', 'Hôpital'];

const SearchDoctor = () => {
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (search || specialty || city || category) {
      fetchResults();
    }
  }, [search, specialty, city, category]);

  const fetchResults = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/search`, {
        params: { nom: search, specialty, city, category }
      });

      const filtered = res.data.filter((user: any) => {
        const role = user.roles?.[0]?.toLowerCase();
        if (category === 'Médecin' && role !== 'doctor') return false;
        if (category === 'Laboratoire' && role !== 'labs') return false;
        if (category === 'Hôpital' && role !== 'hospital') return false;
        return true;
      });

      setResults(filtered);
    } catch (err) {
      console.error('Erreur recherche', err);
    }
  };

  const getRoleLabel = (role: string) => {
    const r = role.toLowerCase();
    if (r === 'doctor') return 'Médecin';
    if (r === 'labs') return 'Laboratoire';
    if (r === 'hospital') return 'Hôpital';
    return 'Professionnel';
  };

  const handleProfileClick = (userId: string) => {
    router.push(`/dashboard_patient/unifiedProfile?id=${userId}`);
  };

  return (
    <ScrollView style={styles.container}>

      <View style={styles.optionsContainer}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setCategory(cat)}
            style={[styles.option, category === cat && styles.selected]}>
            <Text style={category === cat ? styles.selectedText : styles.optionText}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        placeholder="Nom ou prénom"
        value={search}
        onChangeText={setSearch}
        style={styles.input}
      />

      {category === 'Médecin' && (
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={specialty}
            onValueChange={(itemValue) => setSpecialty(itemValue)}
            style={styles.picker}>
            <Picker.Item label="Sélectionner spécialité" value="" />
            {specialites.map((s) => (
              <Picker.Item key={s.key} label={s.value} value={s.value} />
            ))}
          </Picker>
        </View>
      )}

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={city}
          onValueChange={(itemValue) => setCity(itemValue)}
          style={styles.picker}>
          <Picker.Item label="Sélectionner une ville" value="" />
          {villes.map((v) => (
            <Picker.Item key={v} label={v} value={v} />
          ))}
        </Picker>
      </View>

      <Text style={styles.resultTitle}>Résultats</Text>
      {results.map((item) => (
        <TouchableOpacity
          key={item._id}
          onPress={() => handleProfileClick(item._id)}
          style={styles.card}
        >
          <View style={styles.cardHeader}>
            {item.photo ? (
              <Image source={{ uri: `${API_BASE_URL}/${item.photo}` }} style={styles.avatar} />
            ) : (
              <View style={styles.placeholderAvatar}>
                <Text style={styles.placeholderText}>{item.nom?.charAt(0)}</Text>
              </View>
            )}
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{item.nom} {item.prenom}</Text>
              {item.specialite && <Text style={styles.badgeSpecialite}>{item.specialite}</Text>}
              <View style={styles.roleBadge}>
                <Icon
                  name={
                    item.roles?.[0]?.toLowerCase() === 'doctor' ? 'stethoscope' :
                    item.roles?.[0]?.toLowerCase() === 'labs' ? 'flask' :
                    item.roles?.[0]?.toLowerCase() === 'hospital' ? 'hospital-building' :
                    'account'
                  }
                  size={16} color="#fff"
                />
                <Text style={styles.roleBadgeText}>{getRoleLabel(item.roles?.[0] || '')}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.cardAdresse}>📍 {item.adresse}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default SearchDoctor;

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#F9FCFC' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1c3e57' },
  label: { fontWeight: '600', fontSize: 16, marginBottom: 8, color: '#1c3e57' },
  optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  option: { paddingVertical: 8, paddingHorizontal: 14, backgroundColor: '#E0F7F1', borderRadius: 20, margin: 4 },
  selected: { backgroundColor: '#03C490' },
  optionText: { color: '#333' },
  selectedText: { color: '#fff', fontWeight: 'bold' },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#dcdcdc', marginBottom: 12 },
  pickerContainer: { backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#ccc', marginBottom: 12, overflow: 'hidden' },
  picker: { height: Platform.OS === 'ios' ? 200 : 50, width: '100%' },
  resultTitle: { fontSize: 20, fontWeight: '600', marginVertical: 16, color: '#0A3D62' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, borderWidth: 1, borderColor: '#e0e0e0' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#f0f0f0', marginRight: 12 },
  placeholderAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#d0e8e2', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  placeholderText: { fontSize: 22, fontWeight: 'bold', color: '#226D68' },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 18, fontWeight: '700', color: '#1c3e57' },
  badgeSpecialite: { marginTop: 4, paddingVertical: 4, paddingHorizontal: 10, backgroundColor: '#E0F7F1', color: '#03C490', borderRadius: 20, alignSelf: 'flex-start', fontSize: 12, fontWeight: '600' },
  roleBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 6, backgroundColor: '#226D68', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20, alignSelf: 'flex-start' },
  roleBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginLeft: 6 },
  cardAdresse: { marginTop: 8, color: '#666', fontSize: 14 },
});
