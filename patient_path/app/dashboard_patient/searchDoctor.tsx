import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';

interface SearchResult {
  _id: string;
  role: string;
  nom: string;
  prenom: string;
  specialite?: string;
  adresse?: string;
  photo?: string;
}

const specialites = [
  'Cardiologie',
  'Dermatologie',
  'Gynécologie',
  'Neurologie',
  'Pédiatrie',
  'Psychiatrie',
  'Radiologie',
  'Urologie',
  'Anesthésie',
  'Médecine Générale',
];

const villes = [
  'Tunis',
  'Sfax',
  'Sousse',
  'Gabès',
  'Nabeul',
  'Bizerte',
  'Kairouan',
];

const SearchDoctorScreen = () => {
  const [query, setQuery] = useState('');
  const [specialite, setSpecialite] = useState('');
  const [ville, setVille] = useState('');
  const [categorie, setCategorie] = useState<'' | 'medecin' | 'laboratoire' | 'hopital'>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const router = useRouter();

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://192.168.135.83:5001/api/search`, {
        params: {
          query,
          specialite,
          ville,
          categorie
        }
      });
      setResults(response.data);
    } catch (err) {
      console.error('Erreur lors de la recherche', err);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [query, specialite, ville, categorie]);

  const navigateToProfile = (item: SearchResult) => {
    if (item.role === 'medecin') {
      router.push(`/dashboard_patient/DoctorProfile/${item._id}`);
    } else if (item.role === 'laboratoire') {
      router.push(`/dashboard_patient/LaboProfile/${item._id}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Recherche</Text>

      <View style={styles.buttonContainer}>
        {(['medecin', 'laboratoire', 'hopital'] as const).map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryButton,
              categorie === cat && styles.selectedCategory
            ]}
            onPress={() => setCategorie(cat)}
          >
            <Text style={styles.buttonText}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Nom ou prénom"
        value={query}
        onChangeText={setQuery}
      />

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={specialite}
          onValueChange={(value) => setSpecialite(value)}
        >
          <Picker.Item label="Spécialité" value="" />
          {specialites.map((spec) => (
            <Picker.Item key={spec} label={spec} value={spec} />
          ))}
        </Picker>
      </View>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={ville}
          onValueChange={(value) => setVille(value)}
        >
          <Picker.Item label="Ville" value="" />
          {villes.map((v) => (
            <Picker.Item key={v} label={v} value={v} />
          ))}
        </Picker>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigateToProfile(item)} style={styles.card}>
            <Text style={styles.name}>{item.nom} {item.prenom}</Text>
            <Text style={styles.sub}>{item.specialite}</Text>
            <Text style={styles.sub}>{item.adresse}</Text>
            <Text style={styles.sub}>({item.role === 'medecin' ? 'Médecin' : 'Laboratoire'})</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Aucun résultat trouvé.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F5FCFF',
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#038A91',
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    overflow: 'hidden',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedCategory: {
    backgroundColor: '#03C490',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#03C490',
  },
  sub: {
    fontSize: 14,
    color: '#333',
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  }
});

export default SearchDoctorScreen;
