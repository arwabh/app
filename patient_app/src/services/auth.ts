// src/services/auth.ts
import axios from 'axios';
import { API_BASE_URL } from '../constants';

export const forgotPassword = async (email: string) => {
  try {
    await axios.post(`${API_BASE_URL}/forgot-password`, { email });
  } catch (error) {
    throw new Error('Erreur lors de l\'envoi du code.');
  }
};

export const resetPassword = async (email: string, newPassword: string) => {
  try {
    await axios.post(`${API_BASE_URL}/reset-password`, { email, newPassword });
  } catch (error) {
    throw new Error('Erreur lors de la mise à jour du mot de passe.');
  }
};