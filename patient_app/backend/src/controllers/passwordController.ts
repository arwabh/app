// backend/src/controllers/passwordController.ts
import { Request, Response } from 'express';
import User from '../models/User';
import nodemailer from 'nodemailer';

// Générateur de code à 6 chiffres
const generateVerificationCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// Transporteur d'email
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Email non trouvé.' });

    const code = generateVerificationCode();
    user.verificationCode = code;
    user.codeExpires = new Date(Date.now() + 10 * 60 * 1000); // Code valide 10 minutes
    await user.save();

    // Envoyer le code par email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Réinitialisation du mot de passe',
      text: `Votre code de réinitialisation est : ${code}`,
    });

    res.json({ message: 'Code envoyé avec succès.' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, newPassword, code } = req.body;

  try {
    const user = await User.findOne({ 
      email, 
      verificationCode: code, 
      codeExpires: { $gt: new Date() } 
    });

    if (!user) return res.status(400).json({ error: 'Code invalide ou expiré.' });

    user.password = newPassword; // À remplacer par bcrypt.hash()
    user.verificationCode = undefined;
    user.codeExpires = undefined;
    await user.save();

    res.json({ message: 'Mot de passe mis à jour.' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};