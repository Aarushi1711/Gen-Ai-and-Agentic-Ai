import React, { createContext, useContext, useEffect, useState } from 'react';

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
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'developer' | 'founder' | 'researcher';
}

const STORAGE_KEY = 'aaroh_user';

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => ({ error: null }),
  signup: async () => ({ error: null }),
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      // ignore malformed data
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (!email || !password) return { error: 'Email and password are required.' };

    // Check if a user with this email was previously signed up
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const existing: AuthUser & { _password?: string } = JSON.parse(stored);
      if (existing.email === email) {
        if (existing._password && existing._password !== password) {
          return { error: 'Incorrect password.' };
        }
        const { _password: _, ...safeUser } = existing;
        setUser(safeUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser));
        return { error: null };
      }
    }

    // Accept any credentials — create a session user on the fly
    const newUser: AuthUser = {
      id: `user_${Date.now()}`,
      email,
      name: email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      role: 'developer',
    };
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    return { error: null };
  };

  const signup = async ({ name, email, password, role }: SignupData): Promise<{ error: string | null }> => {
    if (!name || !email || !password) return { error: 'All fields are required.' };

    const newUser: AuthUser = {
      id: `user_${Date.now()}`,
      email,
      name,
      role,
    };

    // Store with password so login can verify it later
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...newUser, _password: password }));
    setUser(newUser);
    return { error: null };
  };

  const logout = async () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
