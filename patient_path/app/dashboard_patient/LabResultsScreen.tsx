import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const API_BASE_URL = 'http://192.168.122.83:5001';

export default function LabResultsScreen() {
  const [labs, setLabs] = useState<any[]>([]);

  useEffect(() => {
    const fetchLabs = async () => {
      const id = await AsyncStorage.getItem('userId');
      if (!id) return;

      try {
        const res = await axios.get(`${API_BASE_URL}/api/patient/analyses/${id}`);
        const labsData = res.data;

        const enrichedLabs = await Promise.all(
          labsData.map(async (lab: any) => {
            if (lab.labId) {
              try {
                const userRes = await axios.get(`${API_BASE_URL}/api/users/${lab.labId}`);
                const user = userRes.data;
                lab.authorName = `Laboratoire ${user.nom} ${user.prenom}`;
              } catch (error) {
                console.warn(`❌ Impossible de récupérer le laboratoire ${lab.labId}`);
                lab.authorName = 'Laboratoire inconnu';
              }
            }
            return lab;
          })
        );

        setLabs(enrichedLabs);
      } catch (err) {
        console.error('❌ Erreur résultats labo :', err);
      }
    };

    fetchLabs();
  }, []);

  return (
    <ScrollView style={styles.container}>
      

      {labs.length === 0 ? (
        <Text style={styles.empty}>Aucun résultat d'analyse pour l'instant.</Text>
      ) : (
        labs.map((lab) => (
          <View key={lab._id} style={styles.card}>
            <View style={styles.authorRow}>
              <Icon name="hospital-building" size={20} color="#1c3e57" />
              <Text style={styles.author}>{lab.authorName || 'Laboratoire inconnu'}</Text>
            </View>
            <View style={styles.dateRow}>
              <Icon name="calendar-range" size={18} color="#888" />
              <Text style={styles.date}>
                {lab.date ? new Date(lab.date).toLocaleDateString() : 'Date inconnue'}
              </Text>
            </View>
            <View style={styles.testRow}>
              <Icon name="test-tube" size={18} color="#666" />
              <Text style={styles.testType}>{lab.testType || 'Type inconnu'}</Text>
            </View>
            <TouchableOpacity style={styles.linkBtn} onPress={() => Linking.openURL(`${API_BASE_URL}/${lab.fileUrl}`)}>
              <Icon name="link-variant" size={18} color="#fff" />
              <Text style={styles.linkText}> Ouvrir le résultat</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f8f9fc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#226D68',
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  author: { fontWeight: '700', fontSize: 16, color: '#1c3e57', marginLeft: 6 },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  date: { fontSize: 14, color: '#666', marginLeft: 6 },
  testRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  testType: { fontSize: 14, color: '#555', marginLeft: 6, fontStyle: 'italic' },
  linkBtn: {
    backgroundColor: '#226D68',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  linkText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
    marginLeft: 6,
  },
  empty: { textAlign: 'center', color: '#999', marginTop: 30 },
});
