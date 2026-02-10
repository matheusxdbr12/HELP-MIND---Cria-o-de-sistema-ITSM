import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { findUserByEmail, registerUser, USERS } from '../services/mockStore';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string, deptId: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for session
    const storedUserId = localStorage.getItem('hm_session_user_id');
    if (storedUserId) {
      const foundUser = USERS[storedUserId];
      if (foundUser) {
        setUser(foundUser);
      } else {
        localStorage.removeItem('hm_session_user_id');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const foundUser = findUserByEmail(email);
    if (!foundUser || foundUser.password !== pass) {
      setIsLoading(false);
      throw new Error("Invalid credentials");
    }

    localStorage.setItem('hm_session_user_id', foundUser.id);
    setUser(foundUser);
    setIsLoading(false);
  };

  const register = async (email: string, pass: string, name: string, deptId: string, role: UserRole) => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      try {
          const newUser: User = {
              id: `u-${Date.now()}`,
              email,
              password: pass, // In a real app, hash this!
              name,
              role,
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
              departmentId: deptId
          };
          
          registerUser(newUser);
          localStorage.setItem('hm_session_user_id', newUser.id);
          setUser(newUser);
      } catch (e: any) {
          throw e;
      } finally {
          setIsLoading(false);
      }
  };

  const logout = () => {
    localStorage.removeItem('hm_session_user_id');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
