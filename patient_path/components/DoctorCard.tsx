import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  nom: string;
  prenom: string;
  specialite: string;
  photo: string;
  onPress: () => void;
}

const DoctorCard: React.FC<Props> = ({ nom, prenom, specialite, photo, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.card}>
    <Image source={{ uri: photo }} style={styles.image} />
    <View>
      <Text style={styles.name}>{prenom} {nom}</Text>
      <Text style={styles.specialty}>{specialite}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  specialty: {
    fontSize: 14,
    color: '#666',
  },
});

export default DoctorCard;
