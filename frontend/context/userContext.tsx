"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { me, signout as apiSignout } from '../api/userAuth';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  // Add other fields as necessary
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage immediately on mount
  useEffect(() => {
    const initUser = async () => {
      // 1. Try to get user from local storage for instant access
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (storedUser) {
        try {
            setUser(JSON.parse(storedUser));
        } catch (e) {
            console.error("Failed to parse stored user", e);
        }
      }

      // 2. Verify with backend (or fetch if not in local storage but token exists)
      if (token) {
        try {
          const fetchedUser = await me(token);
          if (fetchedUser && fetchedUser.success && fetchedUser.data) {
            setUser(fetchedUser.data);
            localStorage.setItem('user', JSON.stringify(fetchedUser.data));
          } else {
            // Token invalid or expired or bad response
            logout(); 
          }
        } catch (error) {
          console.error("Failed to fetch user context", error);
        }
      } else {
          // No token, ensure clean state
          localStorage.removeItem('user');
          setUser(null);
      }
      
      setLoading(false);
    };

    initUser();
  }, []);

  const login = (userData: User, token: string) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
  };

  const logout = () => {
    apiSignout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/signin';
  };

  // Custom setter to verify we also update localStorage when we manually set user
  const updateUser = (newUser: User | null) => {
      setUser(newUser);
      if (newUser) {
          localStorage.setItem('user', JSON.stringify(newUser));
      } else {
          localStorage.removeItem('user');
      }
  };

  return (
    <UserContext.Provider value={{ user, loading, setUser: updateUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
