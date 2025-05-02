// src/components/OnboardingCarousel.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import PagerView from 'react-native-pager-view';
import Slide from './Slide';

interface SlideData {
  title: string;
  description: string;
  imageSource: any;
  backgroundColor: string;
}

const OnboardingCarousel = ({ onComplete }: { onComplete: () => void }) => {
  const [index, setIndex] = useState(0);

  const slides: SlideData[] = [
    {
      title: 'Votre dossier médical sécurisé',
      description: 'Centralisez vos données médicales en toute sécurité avec accès biométrique.',
      imageSource: require('../assets/illustrations/slide1.png'),
      backgroundColor: '#4CAF50',
    },
    {
      title: 'Planifiez facilement vos rendez-vous',
      description: 'Réduisez les absences grâce à des rappels automatiques et une gestion simplifiée.',
      imageSource: require('../assets/illustrations/slide2.png'),
      backgroundColor: '#2196F3',
    },
    {
      title: 'Urgence ? Accès immédiat',
      description: 'En cas d’urgence, les ambulanciers accèdent instantanément à vos données critiques.',
      imageSource: require('../assets/illustrations/slide3.png'),
      backgroundColor: '#FF5722',
    },
  ];

  return (
    <PagerView 
      style={styles.container}
      initialPage={0}
      onPageSelected={(e) => setIndex(e.nativeEvent.position)}
    >
      {slides.map((slide, i) => (
        <View key={i} style={[styles.page, { backgroundColor: slide.backgroundColor }]}>
          <TouchableOpacity style={styles.skipButton} onPress={onComplete}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
          <Slide 
            title={slide.title}
            description={slide.description}
            imageSource={slide.imageSource}
          />
          <View style={styles.progressContainer}>
            {slides.map((_, idx) => (
              <View 
                key={idx} 
                style={[styles.dot, idx <= index && styles.activeDot]}
              />
            ))}
          </View>
        </View>
      ))}
    </PagerView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  page: { 
    alignItems: 'center', 
    padding: 20, 
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  skipButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  skipText: { 
    color: 'white', 
    fontWeight: 'bold' 
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 5,
  },
  activeDot: { 
    backgroundColor: 'white' 
  },
});

export default OnboardingCarousel;