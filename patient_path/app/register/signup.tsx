import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';

const roles = ['Patient', 'Doctor', 'Labs', 'Hospital', 'Cabinet', 'Ambulancier'];
const regions = [
  'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Zaghouan', 'Bizerte',
  'Béja', 'Jendouba', 'Le Kef', 'Siliana', 'Sousse', 'Monastir', 'Mahdia',
  'Sfax', 'Kairouan', 'Kasserine', 'Sidi Bouzid', 'Gabès', 'Medenine',
  'Tataouine', 'Gafsa', 'Tozeur', 'Kebili'
];

const Signup = () => {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [dateNaissance, setDateNaissance] = useState<Date | undefined>();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [cin, setCin] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [region, setRegion] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const isStrongPassword = (password: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async () => {
    if (password !== confirmPassword) return Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
    if (!isStrongPassword(password)) return Alert.alert("Erreur", "Mot de passe faible.");
    if (!role || !region) return Alert.alert("Erreur", "Veuillez choisir un rôle et une région.");

    setLoading(true);
    try {
      const res = await fetch("http://192.168.93.83:5001/signup", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom,
          prenom,
          dateNaissance,
          email: email.toLowerCase(),
          telephone,
          adresse,
          cin,
          password,
          role,
          region,
        })
      });

      const data = await res.json();
      if (res.ok) {
        Alert.alert("Succès", "Compte créé !");
        switch (role) {
          case 'Patient': router.push('/register/patient'); break;
          case 'Doctor': router.push('/register/medecin'); break;
          case 'Labs': router.push('/register/laboratoire'); break;
          case 'Hospital': router.push('/dashboard_hopital'); break;
          case 'Cabinet': router.push('/register/cabinet'); break;
          case 'Ambulancier': router.push('/register/ambulancier'); break;
          default: router.push('/');
        }
      } else {
        Alert.alert("Erreur", data.message || "Inscription échouée.");
      }
    } catch (err) {
      Alert.alert("Erreur serveur", "Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Créer un compte</Text>

      <View style={styles.row}>
        <TextInput placeholder="Nom" style={styles.input} value={nom} onChangeText={setNom} />
        <TextInput placeholder="Prénom" style={styles.input} value={prenom} onChangeText={setPrenom} />
      </View>

      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
        <Text>{dateNaissance ? dateNaissance.toLocaleDateString() : 'Date de naissance'}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={dateNaissance || new Date()}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={(_, date) => {
            setShowDatePicker(false);
            if (date) setDateNaissance(date);
          }}
        />
      )}

      <TextInput placeholder="Email" style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />
      <TextInput placeholder="Téléphone" style={styles.input} value={telephone} onChangeText={setTelephone} keyboardType="phone-pad" />
      <TextInput placeholder="Adresse" style={styles.input} value={adresse} onChangeText={setAdresse} />
      <TextInput placeholder="CIN" style={styles.input} value={cin} onChangeText={setCin} keyboardType="numeric" />

      <TextInput placeholder="Mot de passe" style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />
      <TextInput placeholder="Confirmer le mot de passe" style={styles.input} secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

      <Text style={styles.hint}>8 caractères min. avec majuscule, minuscule, chiffre, symbole.</Text>

      <TextInput
        style={styles.input}
        placeholder="Rôle"
        value={role}
        onFocus={() => Alert.alert("Sélection", "Rôle à sélectionner via menu déroulant dans version finale.")}
        onChangeText={setRole}
      />

      <TextInput
        style={styles.input}
        placeholder="Région"
        value={region}
        onFocus={() => Alert.alert("Sélection", "Région à sélectionner via menu déroulant dans version finale.")}
        onChangeText={setRegion}
      />

      <TouchableOpacity onPress={handleSubmit} style={styles.button} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Créer un compte</Text>}
      </TouchableOpacity>

      <Text style={styles.loginLink}>
        Déjà inscrit ? <Text onPress={() => router.push('/login')} style={styles.link}>Se connecter</Text>
      </Text>
    </ScrollView>
  );
};

export default Signup;
const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fdf6f0',
    flexGrow: 1,
    alignItems: 'center'
  },
  image: {
    width: 140,
    height: 140,
    marginBottom: 15,
    resizeMode: 'contain'
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#3e2f2c',
    marginBottom: 20
  },
  input: {
    width: '100%',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderColor: '#d8cfc8',
    borderWidth: 1
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10
  },
  button: {
    backgroundColor: '#7a5c58',
    padding: 14,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 10
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  },
  hint: {
    fontSize: 12,
    color: '#7a5c58',
    marginBottom: 10
  },
  loginLink: {
    marginTop: 20,
    color: '#3e2f2c'
  },
  link: {
    fontWeight: 'bold',
    color: '#7a5c58'
  }
});

