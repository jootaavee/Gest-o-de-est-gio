import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

// Importar componentes de layout
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

// Importar páginas de autenticação
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Importar páginas do aluno
import HomePage from './pages/aluno/HomePage';
import VagaDetalhesPage from './pages/aluno/VagaDetalhesPage';
import MeusDocumentosPage from './pages/aluno/MeusDocumentosPage';
import EditarPerfilPage from './pages/aluno/EditarPerfilPage';
import ConfiguracoesPage from './pages/aluno/ConfiguracoesPage';
import MinhasInscricoesPage from './pages/aluno/MinhasInscricoesPage';

// Importar páginas do técnico
import AdminHomePage from './pages/tecnico/AdminHomePage';
import CadastroVagaPage from './pages/tecnico/CadastroVagaPage';
import InscricoesVagaPage from './pages/tecnico/InscricoesVagaPage';
import AdminEditarPerfilPage from './pages/tecnico/AdminEditarPerfilPage';

// Componente para rotas protegidas (AJUSTADO PARA USAR user.tipo)
const PrivateRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    // Idealmente, mostrar um spinner/loading global aqui
    return <div className="container text-center my-5">Carregando autenticação...</div>;
  }

  if (!isAuthenticated) {
    // Redireciona para login se não estiver autenticado
    return <Navigate to="/login" replace />; // replace para não adicionar ao histórico
  }

  // Verifica o papel (role) do usuário vindo do backend (ALUNO, TECNICO)
  if (requiredRole && (!user || !user.tipo || user.tipo !== requiredRole.toUpperCase())) {
    // Se o usuário não estiver definido ou não tiver tipo, redireciona para login
    if (!user || !user.tipo) {
      return <Navigate to="/login" replace />;
    }
    // Se o usuário tiver tipo, mas não for o correto, redireciona para a página inicial apropriada
    console.warn(`Acesso negado: Usuário com role ${user?.tipo} tentou acessar rota para ${requiredRole.toUpperCase()}`);
    return <Navigate to={user.tipo === 'TECNICO' ? '/admin' : '/'} replace />;
  }

  // Se autenticado e com o papel correto (ou sem papel requerido), renderiza o componente filho
  return children;
};

// Layout para páginas autenticadas
const AuthenticatedLayout = ({ children }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="content-wrapper">
          {children}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />

          {/* Rotas do aluno (requiredRole="aluno") */}
          <Route path="/" element={
            <PrivateRoute requiredRole="aluno"> {/* Passa o papel esperado */}
              <AuthenticatedLayout>
                <HomePage />
              </AuthenticatedLayout>
            </PrivateRoute>
          } />
          <Route path="/vaga/:id" element={
            <PrivateRoute requiredRole="aluno">
              <AuthenticatedLayout>
                <VagaDetalhesPage />
              </AuthenticatedLayout>
            </PrivateRoute>
          } />
          <Route path="/meus-documentos" element={
            <PrivateRoute requiredRole="aluno">
              <AuthenticatedLayout>
                <MeusDocumentosPage />
              </AuthenticatedLayout>
            </PrivateRoute>
          } />
          <Route path="/editar-perfil" element={
            <PrivateRoute requiredRole="aluno"> {/* Rota comum, mas protegida */}
              <AuthenticatedLayout>
                <EditarPerfilPage />
              </AuthenticatedLayout>
            </PrivateRoute>
          } />
          <Route path="/configuracoes" element={
            <PrivateRoute requiredRole="aluno">
              <AuthenticatedLayout>
                <ConfiguracoesPage />
              </AuthenticatedLayout>
            </PrivateRoute>
          } />
          <Route path="/minhas-inscricoes" element={
            <PrivateRoute requiredRole="aluno">
              <AuthenticatedLayout>
                <MinhasInscricoesPage />
              </AuthenticatedLayout>
            </PrivateRoute>
          } />

          {/* Rotas do técnico (requiredRole="tecnico") */}
          <Route path="/admin" element={
            <PrivateRoute requiredRole="tecnico"> {/* Passa o papel esperado */}
              <AuthenticatedLayout>
                <AdminHomePage />
              </AuthenticatedLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/cadastro-vaga" element={
            <PrivateRoute requiredRole="tecnico">
              <AuthenticatedLayout>
                <CadastroVagaPage />
              </AuthenticatedLayout>
            </PrivateRoute>
          } />
          {/* Rota para editar vaga */}
          <Route path="/admin/editar-vaga/:id" element={ 
            <PrivateRoute requiredRole="tecnico">
              <AuthenticatedLayout>
                <CadastroVagaPage />
              </AuthenticatedLayout>
            </PrivateRoute>
          } />
          {/* Rota para ver inscrições de uma vaga específica */}
          <Route path="/admin/vaga/:id/inscricoes" element={ 
            <PrivateRoute requiredRole="tecnico">
              <AuthenticatedLayout>
                <InscricoesVagaPage />
              </AuthenticatedLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/editar-perfil" element={
            <PrivateRoute requiredRole="tecnico"> {/* Rota comum, mas protegida */}
              <AuthenticatedLayout>
                <AdminEditarPerfilPage />
              </AuthenticatedLayout>
            </PrivateRoute>
          } />

          {/* Rota padrão - redireciona para login se não autenticado, ou home apropriada se autenticado */}
          <Route path="*" element={<NavigateToHome />} />

        </Routes>
      </AuthProvider>
    </Router>
  );
}

// Componente auxiliar para redirecionamento padrão
const NavigateToHome = () => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <div>Carregando...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={user.tipo === 'TECNICO' ? '/admin' : '/'} replace />;
};

export default App;

