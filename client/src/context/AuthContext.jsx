import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(() => JSON.parse(localStorage.getItem('umn_user') || 'null'));
  const [token, setToken]     = useState(() => localStorage.getItem('umn_token') || null);
  const [loading, setLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    const verify = async () => {
      if (token) {
        try {
          const { data } = await api.get('/auth/me');
          setUser(data);
          localStorage.setItem('umn_user', JSON.stringify(data));
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    verify();
  }, []);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('umn_user', JSON.stringify(userData));
    localStorage.setItem('umn_token', userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('umn_user');
    localStorage.removeItem('umn_token');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('umn_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
