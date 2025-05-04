import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthData {
  email: string;
  password?: string;
  role: string;
  uid: string;
  nom?: string;
  prenom?: string;
  cin?: string;
  telephone?: string;
  adresse?: string;
}

interface AuthContextType {
  userData: AuthData | null;
  setUserData: (data: AuthData) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<AuthData | null>(null);

  return (
    <AuthContext.Provider value={{ userData, setUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
};
