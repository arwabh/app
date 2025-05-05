import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';


const API_BASE = 'http://192.168.135.83:5001';

interface Appointment {
    type: string;
    nomMedecin?: string;
    nomLabo?: string;
    date: string;
  }
  
  interface Doctor {
    _id: string;
    nom: string;
    prenom: string;
    specialite: string;
  }
  
  interface Article {
    titre: string;
    auteur: string;
  }
  
export default function Home() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
const [doctors, setDoctors] = useState<Doctor[]>([]);
const [articles, setArticles] = useState<Article[]>([]);


useEffect(() => {
  const loadData = async () => {
    const userId = localStorage.getItem('userId');
    fetchUser(userId);
    fetchAppointments(userId);
    fetchDoctors(userId);
    fetchArticles();
  };
  loadData();
}, []);

  const fetchUser = async (id: string | null) => {
    if (!id) return;
    try {
      const res = await axios.get(`${API_BASE}/api/users/${id}`);
      setUserName(res.data.nom);
    } catch (err) {
      console.error('Erreur récupération utilisateur', err);
    }
  };

  const fetchAppointments = async (id: string | null) => {
    try {
      const res = await axios.get(`${API_BASE}/api/patient/appointments/${id}`);
      setAppointments(res.data.slice(0, 3)); // max 3
    } catch (err) {
      console.error('Erreur rendez-vous', err);
    }
  };

  const fetchDoctors = async (id: string | null) => {
    try {
      const res = await axios.get(`${API_BASE}/api/patient/doctors/${id}`);
      setDoctors(res.data.slice(0, 3));
    } catch (err) {
      console.error('Erreur médecins', err);
    }
  };

  const fetchArticles = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/articles`);
      setArticles(res.data.slice(0, 3));
    } catch (err) {
      console.error('Erreur articles', err);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.welcome}>Bienvenue, {userName} 👋</Text>

      <Text style={styles.sectionTitle}>📅 Prochains rendez-vous</Text>
      {appointments.length === 0 ? (
        <Text style={styles.empty}>Aucun rendez-vous prévu</Text>
      ) : (
        appointments.map((item, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardTitle}>{item.type} avec {item.nomMedecin || item.nomLabo}</Text>
            <Text style={styles.cardSubtitle}>{new Date(item.date).toLocaleDateString()}</Text>
          </View>
        ))
      )}

      <Text style={styles.sectionTitle}>🩺 Mes médecins</Text>
      {doctors.length === 0 ? (
        <Text style={styles.empty}>Aucun médecin encore consulté</Text>
      ) : (
        doctors.map((doc, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => router.push(`/dashboard_patient/DoctorProfile?id=${doc._id}`)}
          >
            <Text style={styles.cardTitle}>{doc.nom} {doc.prenom}</Text>
            <Text style={styles.cardSubtitle}>{doc.specialite}</Text>
          </TouchableOpacity>
        ))
      )}

      <Text style={styles.sectionTitle}>📰 Articles récents</Text>
      {articles.length === 0 ? (
        <Text style={styles.empty}>Aucun article disponible</Text>
      ) : (
        articles.map((article, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardTitle}>{article.titre}</Text>
            <Text style={styles.cardSubtitle}>Dr. {article.auteur}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f7fdfc',
  },
  welcome: {
    fontSize: 24,
    fontWeight: '700',
    color: '#03C490',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#038A91',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#555',
  },
  empty: {
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 10,
  },
});
