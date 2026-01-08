import { createContext, useState, useContext, useEffect } from 'react';
import { login as loginService, logout as logoutService, getCurrentUser } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Alkalmazás indulásakor ellenőrizzük a tokent
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        // Csak akkor hívjuk meg a getCurrentUser-t, ha van token
        const result = await getCurrentUser();
        if (result.success) {
          setUser(result.data);
          setIsAuthenticated(true);
        } else {
          // Érvénytelen token, töröljük
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const result = await loginService(email, password);
    
    
    if (result.success) {
      // Felhasználó adatainak lekérése
      const userResult = await getCurrentUser();
      
      if (userResult.success) {
        setUser(userResult.data);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userResult.data));
      }
    }
    
    return result;
  };

  const logout = () => {
    logoutService();
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshUser = async () => {
    const result = await getCurrentUser();
    if (result.success) {
      setUser(result.data);
      localStorage.setItem('user', JSON.stringify(result.data));
    }
    return result;
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook az AuthContext használatához
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
