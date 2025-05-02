// backend/src/server.ts
import express from 'express';
import { connectDB } from './config/db'; // ✅ Utilisez des accolades {}

const app = express();
connectDB();

app.get('/', (req, res) => {
  res.send('Backend opérationnel !');
});

app.listen(5001, () => {
  console.log('Serveur démarré sur http://localhost:5001');
});