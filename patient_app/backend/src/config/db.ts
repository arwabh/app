// backend/src/config/db.ts
import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect('mongodb:mongodb+srv://tesnim:Tesnim.123456789@cluster0.50qhu.mongodb.net/HealthApp?retryWrites=true&w=majority');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Erreur connexion MongoDB:', error);
  }
};