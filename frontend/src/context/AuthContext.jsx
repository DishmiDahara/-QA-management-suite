import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('qa_token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      authAPI.getMe()
        .then((res) => setUser(res.data))
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token: jwtToken, ...userData } = res.data;
    localStorage.setItem('qa_token', jwtToken);
    setToken(jwtToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('qa_token');
    setToken('');
    setUser(null);
  };

  // Demo role switcher helper
  const quickSwitchRole = async (roleEmail) => {
    const passwords = {
      'admin@qasuite.com': 'admin123',
      'qa@qasuite.com': 'qa123',
      'dev@qasuite.com': 'dev123'
    };
    return await login(roleEmail, passwords[roleEmail]);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, quickSwitchRole }}>
      {children}
    </AuthContext.Provider>
  );
};
