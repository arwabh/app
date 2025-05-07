import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Button,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Article {
  _id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  imageUrl: string;
  createdAt: string;
}

export default function DoctorArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [newArticle, setNewArticle] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    image: null as any,
  });
  const [loading, setLoading] = useState(false);
  const [doctorId, setDoctorId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const id = await AsyncStorage.getItem('userId');
      setDoctorId(id);
      await fetchArticles(id);
    };

    fetchData();
  }, []);

  const fetchArticles = async (id: string | null) => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await axios.get(`http://192.168.96.83:5001/api/articles/doctor/${id}`);
      setArticles(res.data);
    } catch (err) {
      console.error('Erreur chargement articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setNewArticle({ ...newArticle, image: result.assets[0] });
    }
  };

  const handleSubmit = async () => {
    if (!doctorId || !newArticle.title || !newArticle.content || !newArticle.category) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', newArticle.title);
      formData.append('content', newArticle.content);
      formData.append('category', newArticle.category);
      formData.append('tags', JSON.stringify(newArticle.tags.split(',').map(t => t.trim())));
      formData.append('authorId', doctorId);
      if (newArticle.image) {
        const uriParts = newArticle.image.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('image', {
          uri: newArticle.image.uri,
          name: `article.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }

      await axios.post('http://192.168.96.83:5001/api/articles', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setNewArticle({
        title: '',
        content: '',
        category: '',
        tags: '',
        image: null,
      });

      await fetchArticles(doctorId);
    } catch (err) {
      console.error('Erreur publication article:', err);
      Alert.alert('Erreur', 'Échec de la publication');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (articleId: string) => {
    Alert.alert('Confirmation', 'Supprimer cet article ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        onPress: async () => {
          try {
            await axios.delete(`http://192.168.135.83:5001/api/articles/${articleId}`);
            fetchArticles(doctorId);
          } catch (err) {
            console.error('Erreur suppression:', err);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📝 Mes Articles</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Titre"
          value={newArticle.title}
          onChangeText={(text) => setNewArticle({ ...newArticle, title: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Catégorie"
          value={newArticle.category}
          onChangeText={(text) => setNewArticle({ ...newArticle, category: text })}
        />
        <TextInput
          style={[styles.input, { height: 100 }]}
          placeholder="Contenu"
          multiline
          value={newArticle.content}
          onChangeText={(text) => setNewArticle({ ...newArticle, content: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Tags (séparés par des virgules)"
          value={newArticle.tags}
          onChangeText={(text) => setNewArticle({ ...newArticle, tags: text })}
        />
        <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
          <Text style={styles.imagePickerText}>📷 Choisir une image</Text>
        </TouchableOpacity>
        {newArticle.image && (
          <Image
            source={{ uri: newArticle.image.uri }}
            style={{ width: '100%', height: 200, borderRadius: 10, marginVertical: 10 }}
          />
        )}
        <Button title="Publier" onPress={handleSubmit} disabled={loading} />
      </View>

      <Text style={styles.subTitle}>📚 Articles publiés</Text>
      {loading && <ActivityIndicator size="large" color="#1976d2" />}
      {articles.map((article) => (
        <View key={article._id} style={styles.articleCard}>
          <Image source={{ uri: article.imageUrl }} style={styles.articleImage} />
          <Text style={styles.articleTitle}>{article.title}</Text>
          <Text style={styles.articleText}>{article.content}</Text>
          <Text style={styles.articleMeta}>
            📂 {article.category} • 🏷️ {article.tags.join(', ')}
          </Text>
          <Text style={styles.articleDate}>
            🕒 {new Date(article.createdAt).toLocaleDateString('fr-FR')}
          </Text>
          <TouchableOpacity onPress={() => handleDelete(article._id)} style={styles.deleteBtn}>
            <Text style={styles.deleteBtnText}>🗑️ Supprimer</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f5f9fa' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: '#2c3e50' },
  form: { marginBottom: 24 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  imagePicker: {
    backgroundColor: '#e0e0e0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  imagePickerText: { color: '#333' },
  subTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#2c3e50',
  },
  articleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  articleImage: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 10,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#2c3e50',
  },
  articleText: { color: '#444', marginBottom: 6 },
  articleMeta: { fontSize: 12, color: '#666' },
  articleDate: { fontSize: 12, color: '#888', marginTop: 6 },
  deleteBtn: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  deleteBtnText: {
    color: '#e53935',
    fontWeight: '600',
  },
});
