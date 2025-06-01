// frontend/src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext'; // Ajuste o caminho se necessário
import './App.css'; // Seu CSS global

// Componentes de Layout
import Sidebar from './components/layout/Sidebar'; // Ajuste o caminho
import Header from './components/layout/Header';   // Ajuste o caminho

// Páginas de Autenticação
import LoginPage from './pages/auth/LoginPage';         // Ajuste o caminho
import RegisterPage from './pages/auth/RegisterPage';   // Ajuste o caminho

// Páginas Comuns (ou que podem ser acessadas por múltiplos perfis com lógica interna)
import EditarPerfilPage from './pages/aluno/EditarPerfilPage'; // Nota: usado tanto por aluno quanto por admin com paths diferentes
import ConfiguracoesPage from './pages/aluno/ConfiguracoesPage'; // Também pode ser comum se a lógica for ajustada

// Páginas do Aluno
import HomePage from './pages/aluno/HomePage';                     // Ajuste o caminho
import VagaDetalhesPage from './pages/aluno/VagaDetalhesPage';     // Ajuste o caminho
import MeusDocumentosPage from './pages/aluno/MeusDocumentosPage'; // Ajuste o caminho
import MinhasInscricoesPage from './pages/aluno/MinhasInscricoesPage'; // Ajuste o caminho

// Páginas do Técnico/Admin
import AdminHomePage from './pages/tecnico/AdminHomePage';                 // Ajuste o caminho
import CadastroVagaPage from './pages/tecnico/CadastroVagaPage';           // Ajuste o caminho
import InscricoesVagaPage from './pages/tecnico/InscricoesVagaPage';     // Ajuste o caminho
import AdminEditarPerfilPage from './pages/tecnico/AdminEditarPerfilPage'; // Específico para admin editar perfil (pode ser o mesmo componente EditarPerfilPage com props)

// Componente para Rotas Protegidas
const PrivateRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando autenticação...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verifica o tipo/role do usuário
  if (requiredRole) {
    // Assegura que user e user.tipo existam antes de comparar
    if (!user || !user.tipo) {
      console.warn("PrivateRoute: Usuário autenticado mas sem 'tipo' definido. Redirecionando para login.");
      return <Navigate to="/login" replace />; // Ou para uma página de erro/home genérica
    }
    if (user.tipo.toUpperCase() !== requiredRole.toUpperCase()) {
      console.warn(`PrivateRoute: Acesso negado. Usuário ${user.tipo} tentou acessar rota para ${requiredRole}. Redirecionando...`);
      // Redireciona para a home apropriada do usuário, ou uma página "não autorizado"
      return <Navigate to={user.tipo.toUpperCase() === 'TECNICO' ? '/admin' : '/'} replace />;
    }
  }
  return children; // Permite acesso
};

// Layout para Páginas Autenticadas
const AuthenticatedLayout = ({ children }) => {
  // Você pode querer passar o tipo de usuário aqui para o Sidebar/Header
  // const { user } = useAuth(); 
  return (
    <div className="app-container"> {/* Assegure-se que 'app-container' está estilizado para o layout */}
      <Sidebar /> {/* Sidebar pode precisar de lógica para mostrar itens baseados no user.tipo */}
      <div className="main-content">
        <Header /> {/* Header pode precisar de lógica para mostrar nome do usuário, etc. */}
        <main className="content-wrapper p-3 p-md-4"> {/* 'main' semântico e padding */}
          {children}
        </main>
      </div>
    </div>
  );
};

// Componente para Redirecionamento Padrão ou 404 simulado
const NavigateToAppropriateHome = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
        <div className="container vh-100 d-flex justify-content-center align-items-center">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
            </div>
        </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  // Se autenticado, redireciona para a home correta baseada no tipo do usuário
  return <Navigate to={user?.tipo?.toUpperCase() === 'TECNICO' ? '/admin' : '/'} replace />;
};


function App() {
  return (
    <Router>
      <AuthProvider> {/* AuthProvider envolve todas as rotas para que o contexto esteja disponível */}
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />

          {/* --- Rotas Protegidas para ALUNO --- */}
          <Route path="/" element={
            <PrivateRoute requiredRole="ALUNO">
              <AuthenticatedLayout> <HomePage /> </AuthenticatedLayout>
            </PrivateRoute>
          } />
          <Route path="/vaga/:id" element={
            <PrivateRoute requiredRole="ALUNO">
              <AuthenticatedLayout> <VagaDetalhesPage /> </AuthenticatedLayout>
            </PrivateRoute>
          } />
          <Route path="/meus-documentos" element={
            <PrivateRoute requiredRole="ALUNO">
              <AuthenticatedLayout> <MeusDocumentosPage /> </AuthenticatedLayout>
            </PrivateRoute>
          } />
          <Route path="/editar-perfil" element={
            <PrivateRoute requiredRole="ALUNO"> {/* O componente EditarPerfilPage pode precisar se adaptar ou ter lógica para aluno */}
              <AuthenticatedLayout> <EditarPerfilPage /> </AuthenticatedLayout>
            </PrivateRoute>
          } />
          <Route path="/configuracoes" element={
             <PrivateRoute requiredRole="ALUNO"> {/* O componente ConfiguracoesPage pode precisar se adaptar */}
              <AuthenticatedLayout> <ConfiguracoesPage /> </AuthenticatedLayout>
            </PrivateRoute>
          } />
          <Route path="/minhas-inscricoes" element={
            <PrivateRoute requiredRole="ALUNO">
              <AuthenticatedLayout> <MinhasInscricoesPage /> </AuthenticatedLayout>
            </PrivateRoute>
          } />
          
          {/* --- Rotas Protegidas para TECNICO --- */}
          <Route path="/admin" element={
            <PrivateRoute requiredRole="TECNICO">
              <AuthenticatedLayout> <AdminHomePage /> </AuthenticatedLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/cadastro-vaga" element={
            <PrivateRoute requiredRole="TECNICO">
              <AuthenticatedLayout> <CadastroVagaPage /> </AuthenticatedLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/editar-vaga/:id" element={ 
            <PrivateRoute requiredRole="TECNICO">
              <AuthenticatedLayout> <CadastroVagaPage /> </AuthenticatedLayout> {/* Reutiliza o componente de cadastro para edição */}
            </PrivateRoute>
          } />
          <Route path="/admin/vaga/:id/inscricoes" element={ 
            <PrivateRoute requiredRole="TECNICO">
              <AuthenticatedLayout> <InscricoesVagaPage /> </AuthenticatedLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/editar-perfil" element={
            <PrivateRoute requiredRole="TECNICO">
              <AuthenticatedLayout> <AdminEditarPerfilPage /> </AuthenticatedLayout> {/* Página específica para admin editar perfil */}
            </PrivateRoute>
          } />
          {/* Adicionar aqui a rota para ConfiguracoesPage para técnico, se for diferente */}
          {/* Ex:
          <Route path="/admin/configuracoes" element={
             <PrivateRoute requiredRole="TECNICO">
              <AuthenticatedLayout> <ConfiguracoesPage /> </AuthenticatedLayout> // Pode ser o mesmo componente ou um AdminConfiguracoesPage
            </PrivateRoute>
          } />
          */}

          {/* Rota de Fallback / Wildcard */}
          {/* Idealmente, você teria uma página 404 Not Found dedicada */}
          {/* Por agora, redireciona para a home apropriada ou login */}
          <Route path="*" element={<NavigateToAppropriateHome />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;