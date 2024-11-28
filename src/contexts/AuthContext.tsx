import { createContext, useContext, useState } from 'react';
import { userService } from '../services/db';

interface User {
  email: string;
  isAdmin: boolean;
  name: string;
}

interface AuthContextType {
  isAdmin: boolean;
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string, remember: boolean) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email: string, password: string, remember: boolean) => {
    try {
      console.log('Intentando login...'); // Para debugging
      const dbUser = await userService.login(email, password);
      console.log('Resultado login:', dbUser); // Para debugging

      if (dbUser) {
        const loggedUser = {
          email: dbUser.email,
          isAdmin: dbUser.isAdmin,
          name: dbUser.name
        };
        
        setUser(loggedUser);
        localStorage.setItem('user', JSON.stringify(loggedUser));
        
        if (remember) {
          localStorage.setItem('savedCredentials', JSON.stringify({ email, password }));
        } else {
          localStorage.removeItem('savedCredentials');
        }
        
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error durante el login:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    isAdmin: user?.isAdmin || false,
    isAuthenticated: user !== null,
    user,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 