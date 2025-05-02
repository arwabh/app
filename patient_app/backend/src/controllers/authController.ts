// backend/controllers/authController.ts
import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Identifiants invalides' });

    // Comparez le mot de passe avec bcrypt (à implémenter)
    if (password !== user.password) return res.status(401).json({ error: 'Mot de passe incorrect' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ error: 'Email déjà utilisé' });

    const newUser = new User({ email, password, roles: ['Patient'] });
    await newUser.save();
    res.status(201).json({ message: 'Inscription réussie' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur inscription' });
  }
};