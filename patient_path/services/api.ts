import axios from 'axios';

const API_BASE_URL = 'http://192.168.135.83:5001';

// Type pour les utilisateurs
export interface UserData {
  uid: string;
  email: string;
  role: 'Patient' | 'Médecin' | 'Laboratoire' | 'Ambulancier' | 'Secrétaire' | 'Hôpital';
}

// 🔐 Signup vers MongoDB
export const signUpUserToMongo = async ({
  email,
  password,
  fullData,
}: {
  email: string;
  password: string;
  fullData: Record<string, any>;
}): Promise<string> => {
  const res = await axios.post<{ uid: string}>(`${API_BASE_URL}/register/signup`, {
    email,
    password,
    ...fullData,
  });
  return res.data.uid; // l'uid doit être retourné depuis ton backend
};

// 🔐 Login vers MongoDB
export const loginUserMongo = async (
  email: string,
  password: string
): Promise<UserData> => {
  const res = await axios.post(`${API_BASE_URL}/login`, {
    email,
    password,
  });
  return res.data as UserData;
};

// 👤 Récupérer les infos utilisateur
export const getUserProfile = async (uid: string): Promise<UserData | null> => {
  const res = await axios.get(`${API_BASE_URL}/user/${uid}`);
  if (res.status === 200) {
    return res.data as UserData;
  }
  return null;
};


export const completePatientSignup = async (uid: string, data: FormData) => {
  return await fetch(`${API_BASE_URL}/patient-info/${uid}`, {
    method: 'POST',
    body: data,
  });
};


export const completeCabinetSignup = async (userId: string, data: any) => {
  const res = await axios.post(`http://192.168.135.83:5001/api/cabinet/complete/${userId}`, data);
  return res.data;
};

export const fetchMedecinsBySpecialite = async (specialite: string) => {
  const res = await axios.get(`http://192.168.135.83:5001/api/medecins/by-specialite/${specialite}`);
  return res.data;
};



//  FormData upload ( pour Ambulancier)
export const completeAmbulancierSignup = async (formData: FormData) => {
  const res = await axios.post(`${API_BASE_URL}/ambulancier`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const getHopitaux = async () => {
  const res = await axios.get(`${API_BASE_URL}/ambulancier/hopitaux`);
  return res.data;
};


//  FormData upload ( pour medecin)
export const completeMedecinSignup = async (formData: FormData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/medecin-info`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Erreur lors de l\'inscription du médecin :', error.response?.data || error.message);
    throw error;
  }
};

//  FormData upload ( pour laboratoire)
export const completeLaboratoireSignup = async (formData: FormData) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/laboratoire-info`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (err: any) {
    console.error('Erreur inscription laboratoire:', err.response?.data || err.message);
    throw err;
  }
};


export const getMedecinsBySpecialite = async (specialite: string) => {
  const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/secretaire/medecins/${specialite}`);
  return res.json();
};

export const completeSecretaireSignup = async (uid: string, data: any) => {
  return await axios.post(`${API_BASE_URL}/secretaire/${uid}`, data);
};





export const completeHopitalSignup = async (uid: string, data: Record<string, any>) => {
  const res = await axios.post(`${API_BASE_URL}/hopital/${uid}`, data);
  return res.data;
};


export type Doctor = {
  _id: string;
  nom: string;
  prenom: string;
  specialite: string;
  photo: string;
};

export type Appointment = {
  _id: string;
  date: string;
  motif: string;
  status: string;
  doctor: Doctor;
};

export const getPatientDashboard = async (uid: string): Promise<{ appointments: Appointment[], myDoctors: Doctor[] }> => {
  const res = await fetch(`${API_BASE_URL}/api/patient/${uid}`);
  if (!res.ok) {
    throw new Error("Erreur lors de la récupération du tableau de bord");
  }
  return await res.json();
};

export const getUserData = async (uid: string) => {
  const response = await fetch(`http://localhost:8081/api/patient/${uid}`);
  if (!response.ok) throw new Error("Erreur lors de la récupération des données.");
  return await response.json();
};

// ✅ Récupérer les messages d'une conversation spécifique avec un médecin
export const fetchConversationWithDoctor = async (uid: string, doctorId: string) => {
  const res = await fetch(`http://localhost:8081/chat/${uid}/${doctorId}`);
  return await res.json();
};

// ✅ Récupérer toutes les conversations (pour `chat.tsx`)
export const fetchConversations = async (userId: string) => {
  const response = await axios.get(`${API_BASE_URL}/messages/conversations/${userId}`);
  return response.data;
};


export const sendMessage = async (data: any) => {
  await fetch('http://localhost:8081/chat/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

// ✅ Supprimer un message
export const deleteMessage = async (messageId: string) => {
  const response = await axios.delete(`${API_BASE_URL}/messages/${messageId}`);
  return response.data;
};


export async function getDoctorById(id: string) {
  const response = await fetch(`http://localhost:8081/api/medecin/${id}`);
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération du médecin');
  }
  return await response.json();
}


export const searchDoctors = async ({
  nom = '',
  specialite = '',
  ville = ''
}: {
  nom?: string;
  specialite?: string;
  ville?: string;
}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/medecins/search`, {
      params: {
        nom,
        specialite,
        ville
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur recherche médecins :', error);
    return [];
  }
};