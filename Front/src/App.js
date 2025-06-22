import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import EditarPerfilPage from './pages/aluno/EditarPerfilPage';
import ConfiguracoesPage from './pages/aluno/ConfiguracoesPage';
import HomePage from './pages/aluno/HomePage';
import VagaDetalhesPage from './pages/aluno/VagaDetalhesPage';
import MeusDocumentosPage from './pages/aluno/MeusDocumentosPage';
import MinhasInscricoesPage from './pages/aluno/MinhasInscricoesPage';

import AdminHomePage from './pages/tecnico/AdminHomePage';
import CadastroVagaPage from './pages/tecnico/CadastroVagaPage';
import CadastrarNotificacaoPage from './pages/tecnico/CadastrarNotificacaoPage';
import InscricoesVagaPage from './pages/tecnico/InscricoesVagaPage';
import AdminEditarPerfilPage from './pages/tecnico/AdminEditarPerfilPage';

const PrivateRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) {
    return (<div className="container vh-100 d-flex justify-content-center align-items-center"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Carregando...</span></div></div>);
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (requiredRole) {
    if (!user || !user.tipo) return <Navigate to="/login" replace />;
    if (user.tipo.toUpperCase() !== requiredRole.toUpperCase()) {
      return <Navigate to={user.tipo.toUpperCase() === 'TECNICO' ? '/admin' : '/home-aluno'} replace />;
    }
  }
  return children;
};

const AuthenticatedLayout = ({ children }) => (
  <div className="app-container"><Sidebar /><div className="main-content"><Header /><main className="content-wrapper p-3 p-md-4">{children}</main></div></div>
);

// ALTERAÇÃO 1: Ajustado o redirecionamento para o novo caminho do aluno
const NavigateToAppropriateHome = () => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) {
    return (<div className="container vh-100 d-flex justify-content-center align-items-center"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Carregando...</span></div></div>);
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={user?.tipo?.toUpperCase() === 'TECNICO' ? '/admin' : '/home-aluno'} replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />
          
          {/* ALTERAÇÃO 2: A rota raiz agora é o nosso redirecionador inteligente */}
          <Route path="/" element={<NavigateToAppropriateHome />} />

          {/* Rotas do Aluno */}
          {/* ALTERAÇÃO 3: A antiga homepage do aluno agora tem sua própria rota dedicada */}
          <Route path="/home-aluno" element={<PrivateRoute requiredRole="ALUNO"><AuthenticatedLayout><HomePage /></AuthenticatedLayout></PrivateRoute>} />
          <Route path="/vaga/:id" element={<PrivateRoute requiredRole="ALUNO"><AuthenticatedLayout><VagaDetalhesPage /></AuthenticatedLayout></PrivateRoute>} />
          <Route path="/meus-documentos" element={<PrivateRoute requiredRole="ALUNO"><AuthenticatedLayout><MeusDocumentosPage /></AuthenticatedLayout></PrivateRoute>} />
          <Route path="/editar-perfil" element={<PrivateRoute requiredRole="ALUNO"><AuthenticatedLayout><EditarPerfilPage /></AuthenticatedLayout></PrivateRoute>} />
          <Route path="/configuracoes" element={<PrivateRoute requiredRole="ALUNO"><AuthenticatedLayout><ConfiguracoesPage /></AuthenticatedLayout></PrivateRoute>} />
          <Route path="/minhas-inscricoes" element={<PrivateRoute requiredRole="ALUNO"><AuthenticatedLayout><MinhasInscricoesPage /></AuthenticatedLayout></PrivateRoute>} />
          
          {/* Rotas do Técnico */}
          <Route path="/admin" element={<PrivateRoute requiredRole="TECNICO"><AuthenticatedLayout><AdminHomePage /></AuthenticatedLayout></PrivateRoute>} />
          <Route path="/admin/cadastro-vaga" element={<PrivateRoute requiredRole="TECNICO"><AuthenticatedLayout><CadastroVagaPage /></AuthenticatedLayout></PrivateRoute>} />
          <Route path="/admin/notificacoes/cadastrar" element={<PrivateRoute requiredRole="TECNICO"><AuthenticatedLayout><CadastrarNotificacaoPage /></AuthenticatedLayout></PrivateRoute>} />
          <Route path="/admin/editar-vaga/:id" element={<PrivateRoute requiredRole="TECNICO"><AuthenticatedLayout><CadastroVagaPage /></AuthenticatedLayout></PrivateRoute>} />
          <Route path="/admin/vaga/:id/inscricoes" element={<PrivateRoute requiredRole="TECNICO"><AuthenticatedLayout><InscricoesVagaPage /></AuthenticatedLayout></PrivateRoute>} />
          <Route path="/admin/editar-perfil" element={<PrivateRoute requiredRole="TECNICO"><AuthenticatedLayout><AdminEditarPerfilPage /></AuthenticatedLayout></PrivateRoute>} />
          
          <Route path="*" element={<NavigateToAppropriateHome />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;