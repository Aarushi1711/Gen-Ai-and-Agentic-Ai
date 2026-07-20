import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { ENDPOINTS } from '../config/api';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'developer' | 'founder' | 'researcher';
  avatar?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  signup: (data: SignupData) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'developer' | 'founder' | 'researcher';
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => ({ error: null }),
  signup: async () => ({ error: null }),
  logout: async () => {},
  getIdToken: async () => null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          const response = await fetch(ENDPOINTS.auth.me, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const backendUser = await response.json();
            setUser({
              id: backendUser.id,
              email: backendUser.email,
              name: backendUser.name,
              role: backendUser.role,
              avatar: backendUser.avatar,
            });
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const getIdToken = async (): Promise<string | null> => {
    if (!auth.currentUser) return null;
    try {
      return await auth.currentUser.getIdToken();
    } catch {
      return null;
    }
  };

  const login = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Login failed. Please try again.' };
    }
  };

  const signup = async ({ name, email, password, role }: SignupData): Promise<{ error: string | null }> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();

      const response = await fetch(ENDPOINTS.auth.signup, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, password, name, role })
      });

      if (!response.ok) {
        const errorData = await response.json();
        await signOut(auth);
        return { error: errorData.detail || 'Signup failed. Please try again.' };
      }

      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Signup failed. Please try again.' };
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, getIdToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
