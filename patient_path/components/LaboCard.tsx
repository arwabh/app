import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  nom: string;
  adresse: string;
  photo: string;
  onPress: () => void;
}

const LaboCard: React.FC<Props> = ({ nom, adresse, photo, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.card}>
    <Image source={{ uri: photo }} style={styles.image} />
    <View>
      <Text style={styles.name}>{nom}</Text>
      <Text style={styles.address}>{adresse}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#f1f1f1',
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
  address: {
    fontSize: 14,
    color: '#777',
  },
});

export default LaboCard;
