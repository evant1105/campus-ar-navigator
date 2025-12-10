import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  studentId: string;
  department: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (studentId: string, password: string) => Promise<boolean>;
  loginAsGuest: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (studentId: string, password: string): Promise<boolean> => {
    // Reset safety warning on new login to ensure it shows again
    localStorage.removeItem('arSafetyAccepted');
    
    // Simulated login
    if (studentId && password) {
      setUser({
        id: '1',
        name: 'Alex Johnson',
        studentId: studentId,
        department: 'Computer Science',
      });
      return true;
    }
    return false;
  };

  const loginAsGuest = () => {
    // Reset safety warning for guest login too
    localStorage.removeItem('arSafetyAccepted');

    setUser({
      id: 'guest',
      name: 'Guest User',
      studentId: 'GUEST',
      department: 'Visitor',
    });
  };

  const logout = () => {
    // Also clear on logout for good measure
    localStorage.removeItem('arSafetyAccepted');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      loginAsGuest,
      logout,
    }}>
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