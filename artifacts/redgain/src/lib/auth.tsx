import React, { createContext, useContext, useEffect, useState } from 'react';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  accountStatus: 'pending' | 'active' | 'paused' | 'lost';
  emailVerified: boolean;
  referralCode: string;
  membershipExpiresAt: string | null;
  createdAt: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  refetch: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  refetch: () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, refetch: fetchMe, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
