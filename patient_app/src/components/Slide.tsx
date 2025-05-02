// src/components/Slide.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface SlideProps {
  title: string;
  description: string;
  imageSource: any;
}

const Slide = ({ title, description, imageSource }: SlideProps) => {
  return (
    <View style={styles.container}>
      <Image 
        source={imageSource} 
        style={styles.image} 
        resizeMode="contain"
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: '80%',
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default Slide;