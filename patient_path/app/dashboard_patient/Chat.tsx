import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';

type Doctor = {
    _id: string;
    nom: string;
    prenom: string;
    medecinInfo?: {
      photoPath?: string;
    };
  };
  

type Conversation = {
  _id: string;
  doctor: Doctor;
};

export default function Chat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const router = useRouter();
  const patientId = localStorage.getItem('userId'); // ou AsyncStorage si mobile

  useEffect(() => {
    if (patientId) {
      fetchConversations();
    }
  }, [patientId]);

  const fetchConversations = async () => {
    try {
      const res = await axios.get(`http://192.168.135.83:5001/api/conversations/patient/${patientId}`);
      setConversations(res.data);
    } catch (error) {
      console.error("Erreur lors du chargement des conversations :", error);
    }
  };

  const handleDoctorPress = (doctorId: string) => {
    router.push(`/dashboard_patient/ChatScreen?id=${doctorId}`);
  };

  const handleChatbotPress = () => {
    router.push(`/dashboard_patient/ChatScreen?id=chatbot`);
  };

  const renderItem = ({ item }: { item: Conversation }) => {
    const doctor = item.doctor;
    return (
      <TouchableOpacity style={styles.card} onPress={() => handleDoctorPress(doctor._id)}>
       <Image
  source={{ uri: doctor.medecinInfo?.photoPath || 'https://cdn-icons-png.flaticon.com/512/3870/3870822.png' }}
  style={styles.avatar}
/>

        <View style={styles.info}>
          <Text style={styles.name}>{doctor.nom} {doctor.prenom}</Text>
          <Text style={styles.subtitle}>Conversation avec le médecin</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Chatbot en haut */}
      <TouchableOpacity style={styles.card} onPress={handleChatbotPress}>
        <Image
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4712/4712100.png' }}
          style={styles.avatar}
        />
        <View style={styles.info}>
          <Text style={styles.name}>Chatbot Médical</Text>
          <Text style={styles.subtitle}>Cliquez ici pour discuter avec l’IA</Text>
        </View>
      </TouchableOpacity>

      {/* Conversations */}
      <FlatList
        data={conversations}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5FCFF',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 3,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
  },
});
