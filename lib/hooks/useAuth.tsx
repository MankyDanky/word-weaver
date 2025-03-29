"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Types
interface User {
  id: string;
  email: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
  
  const router = useRouter();
  
  // Get current user on initial load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/user');
        
        if (!res.ok) {
          throw new Error('Failed to get user data');
        }
        
        const data = await res.json();
        setAuth({
          user: data.user,
          loading: false,
          error: null
        });
      } catch {
        setAuth({
          user: null,
          loading: false,
          error: null
        });
      }
    };
    
    fetchUser();
  }, []);
  
  // Login function
  const login = async (email: string, password: string) => {
    setAuth(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      setAuth({
        user: data.user,
        loading: false,
        error: null
      });
      
      router.refresh();
      return data;
      
    } catch (err) {
      setAuth(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Login failed'
      }));
      throw err;
    }
  };
  
  // Register function
  const register = async (email: string, password: string) => {
    setAuth(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      setAuth({
        user: data.user,
        loading: false,
        error: null
      });
      
      router.refresh();
      return data;
      
    } catch (err) {
      setAuth(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Registration failed'
      }));
      throw err;
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      setAuth({
        user: null,
        loading: false,
        error: null
      });
      
      router.push('/login');
      router.refresh();
    } catch (err) {
      setAuth(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Logout failed'
      }));
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        ...auth,
        login,
        register,
        logout,
        isAuthenticated: !!auth.user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}