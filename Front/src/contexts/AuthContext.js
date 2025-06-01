// src/contexts/AuthContext.jsx - Versão corrigida
import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../api/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Inicializa os estados com valores do localStorage, mas não confia neles completamente
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Carrega os dados do usuário do servidor sempre que o componente for montado
  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      const storedToken = localStorage.getItem('token');
      
      if (storedToken) {
        try {
          // Define o token primeiro para que a chamada API use o token correto
          setToken(storedToken);
          
          // Busca os dados atualizados do usuário
          const response = await apiClient.get('/users/profile');
          const userData = response.data;
          
          // Atualiza o estado e o localStorage
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          console.log("Usuário autenticado:", userData);
        } catch (err) {
          console.error('Erro ao verificar autenticação:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
        } finally {
          setLoading(false);
          setInitialized(true);
        }
      } else {
        // Sem token, limpa tudo
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
        setLoading(false);
        setInitialized(true);
      }
    };

    loadUserData();
  }, []);

  const login = async (email, senha) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/login', { email, senha });
      const { token: newToken, user: loggedUser } = response.data;
      
      // Salva no localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(loggedUser));
      
      // Atualiza o estado
      setToken(newToken);
      setUser(loggedUser);
      return loggedUser;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Erro ao fazer login. Verifique suas credenciais.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/register/aluno', {
        ...userData,
        periodo: Number(userData.periodo),
      });
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Erro ao realizar cadastro.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isTecnico = () => user?.tipo === 'TECNICO';
  const isAluno = () => user?.tipo === 'ALUNO';

  // Não renderiza nada até que a inicialização esteja completa
  if (!initialized) {
    return <div className="container text-center my-5">Inicializando aplicação...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isTecnico,
        isAluno,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export default AuthContext;
