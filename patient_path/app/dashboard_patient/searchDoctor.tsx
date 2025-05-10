// app/searchDoctor.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform
} from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';

const API_BASE_URL = 'http://192.168.93.83:5001';

const villes = [
  'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Zaghouan', 'Bizerte', 'Béja',
  'Jendouba', 'Le Kef', 'Siliana', 'Sousse', 'Monastir', 'Mahdia', 'Sfax', 'Kairouan',
  'Kasserine', 'Sidi Bouzid', 'Gabès', 'Medenine', 'Tataouine', 'Gafsa', 'Tozeur', 'Kebili'
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
      console.error('Erreur de recherche', err);
    }
  };
  


  const getRoleLabel = (role: string) => {
    const r = role.toLowerCase();
    if (r === 'doctor') return '🩺 Médecin';
    if (r === 'labs') return '🧪 Laboratoire';
    if (r === 'hospital') return '🏥 Hôpital';
    return '👤 Professionnel';
  };

  const handleProfileClick = (userId: string) => {
    router.push(`/dashboard_patient/unifiedProfile?id=${userId}`);
  };
  
  

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Recherche</Text>

      <Text style={styles.label}>Catégorie</Text>
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
        <TextInput
          placeholder="Spécialité (ex: Cardiologie)"
          value={specialty}
          onChangeText={setSpecialty}
          style={styles.input}
        />
      )}

      <Text style={styles.label}>Ville</Text>
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
          >
          {item.photo && (
            <Image
              source={{ uri: `${API_BASE_URL}/${item.photo}` }}
              style={styles.avatar}
            />
          )}
          <View style={styles.infoContainer}>
            <Text style={styles.name}>{item.nom} {item.prenom}</Text>
            <Text style={styles.adresse}>📍 {item.adresse}</Text>
            {item.specialite && <Text style={styles.specialite}>🧬 {item.specialite}</Text>}
            <Text style={styles.role}>{getRoleLabel(item.roles?.[0] || '')}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default SearchDoctor;

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#F0FAF9' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#0A3D62' },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dcdcdc',
    marginBottom: 12
  },
  label: { fontWeight: '600', fontSize: 16, marginBottom: 6, color: '#0A3D62' },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12
  },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#E0F7F1',
    borderRadius: 20,
    margin: 4
  },
  selected: {
    backgroundColor: '#03C490'
  },
  optionText: {
    color: '#333'
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
    overflow: 'hidden'
  },
  picker: {
    height: Platform.OS === 'ios' ? 200 : 50,
    width: '100%',
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 16,
    color: '#0A3D62'
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderLeftColor: '#03C490',
    borderLeftWidth: 4,
    alignItems: 'center'
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12
  },
  infoContainer: {
    flex: 1
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#038A91'
  },
  adresse: {
    color: '#444',
    marginTop: 4
  },
  specialite: {
    color: '#555',
    marginTop: 2
  },
  role: {
    marginTop: 4,
    color: '#888',
    fontStyle: 'italic'
  }
});
