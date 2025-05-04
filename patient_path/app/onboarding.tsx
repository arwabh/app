import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../theme';

const { width } = Dimensions.get('window');

const onboardingData = [
  {
    key: '1',
    title: 'Bienvenue sur PatientPath',
    description:
      'Votre compagnon santé pour suivre vos rendez-vous, rapports médicaux et plus encore.',
    image: require('../assets/onboarding.png'),
    primary: true,
  },
  {
    key: '2',
    title: 'Prenez soin de vous',
    description:
      'Gérez vos données médicales, messages, et accès aux professionnels.',
    image: require('../assets/onboarding1.png'),
  },
  {
    key: '3',
    title: 'Discutez avec vos médecins',
    description:
      'Un espace sécurisé pour communiquer avec vos professionnels de santé.',
    image: require('../assets/onboarding2.png'),
  },
  {
    key: '4',
    title: 'Accédez à vos analyses',
    description:
      'Suivez vos résultats de laboratoire, rapports, et antécédents médicaux.',
    image: require('../assets/onboarding3.png'),
  },
];

export default function Onboarding() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.replace('/login');
    }
  };

  const renderItem = ({ item }: { item: typeof onboardingData[0] }) => (
    <View style={styles.slide}>
      <Image source={item.image} style={styles.image} />
      <Text
        style={[styles.title, item.primary && { color: colors.primary }]}
      >
        {item.title}
      </Text>
      <Text style={styles.description}>{item.description}</Text>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextText}>
          {currentIndex < onboardingData.length - 1 ? 'Suivant' : 'Commencer'}
        </Text>
      </TouchableOpacity>

      {item.key === '1' && (
        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={styles.signupLink}>
            Vous avez déjà un compte ?{' '}
            <Text style={styles.signupText}>Se connecter</Text>
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  return (
    <FlatList
      ref={flatListRef}
      data={onboardingData}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      renderItem={renderItem}
      keyExtractor={(item) => item.key}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    />
  );
}

const styles = StyleSheet.create({
  slide: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  image: {
    width: 220,
    height: 220,
    marginBottom: 30,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 20,
  },
  nextText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  signupLink: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
  },
  signupText: {
    color: colors.primary,
    fontWeight: '600',
  },
});
