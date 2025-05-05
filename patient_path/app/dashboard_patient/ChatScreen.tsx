import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Button, FlatList, Text, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as AV from 'expo-av';
import axios from 'axios';

interface Message {
  _id: string;
  sender: string;
  content: string;
  type: 'text' | 'image' | 'audio' | 'file';
  createdAt: string;
}

const ChatScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [recording, setRecording] = useState<AV.Audio.Recording | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await axios.get('http://192.168.135.83:5001/api/messages');
      setMessages(res.data);
    } catch (error) {
      console.error('Erreur de chargement des messages', error);
    }
  };

  const sendTextMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const res = await axios.post('http://192.168.135.83:5001/api/messages', {
        content: newMessage,
        type: 'text',
        sender: 'patient',
      });
      setMessages((prev) => [...prev, res.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Erreur d’envoi', error);
    }
  };

  const sendMedia = async (uri: string, fileName: string, mimeType: string, type: Message['type']) => {
    const formData = new FormData();
    formData.append('file', {
      uri,
      name: fileName,
      type: mimeType,
    } as any);
    formData.append('type', type);
    formData.append('sender', 'patient');

    try {
      const res = await axios.post('http://192.168.135.83:5001/api/messages/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessages((prev) => [...prev, res.data]);
    } catch (error) {
      console.error('Erreur d’envoi de média', error);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      const image = result.assets[0];
      sendMedia(image.uri, image.fileName || 'photo.jpg', image.type || 'image/jpeg', 'image');
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
        const doc = result.assets[0];
        sendMedia(doc.uri, doc.name || 'document.pdf', doc.mimeType || 'application/pdf', 'file');
      }
      
  };

  const startRecording = async () => {
    try {
      await AV.Audio.requestPermissionsAsync();
      await AV.Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await AV.Audio.Recording.createAsync(AV.Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
    } catch (err) {
      console.error('Erreur démarrage enregistrement:', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (uri) {
        sendMedia(uri, 'audio.m4a', 'audio/m4a', 'audio');
      }
      setRecording(null);
    } catch (err) {
      console.error('Erreur arrêt enregistrement:', err);
    }
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 4 }}>
            <Text style={{ fontWeight: 'bold' }}>{item.sender}</Text>
            {item.type === 'text' && <Text>{item.content}</Text>}
            {item.type === 'image' && (
              <Image source={{ uri: item.content }} style={{ width: 200, height: 200 }} />
            )}
            {item.type === 'audio' && (
              <Text style={{ color: 'blue' }}>🎤 Audio: {item.content}</Text>
            )}
            {item.type === 'file' && (
              <Text style={{ color: 'green' }}>📄 Fichier: {item.content}</Text>
            )}
          </View>
        )}
      />

      <TextInput
        placeholder="Écrire un message..."
        value={newMessage}
        onChangeText={setNewMessage}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          padding: 8,
          marginBottom: 8,
        }}
      />
      <Button title="Envoyer" onPress={sendTextMessage} />

      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }}>
        <TouchableOpacity onPress={pickImage}>
          <Text>🖼 Image</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={pickDocument}>
          <Text>📎 Document</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={recording ? stopRecording : startRecording}>
          <Text>{recording ? '⏹ Stop' : '🎤 Audio'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatScreen;
