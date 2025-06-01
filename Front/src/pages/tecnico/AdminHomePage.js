// frontend/src/pages/AdminHomePage.js

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrashAlt, faUsers, faSpinner, faEye } from '@fortawesome/free-solid-svg-icons';

const AdminHomePage = () => {
  const [vagas, setVagas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, isTecnico, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const fetchMinhasVagasTecnico = async () => {
    if (!isTecnico()) {
      setError('Acesso negado. Esta funcionalidade é apenas para técnicos.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      // CORREÇÃO: Chamar a nova rota específica para vagas do técnico
      const response = await apiClient.get('/vagas/tecnico/minhas'); // Acessa GET /api/vagas/tecnico/minhas
      setVagas(response.data);
    } catch (err) {
      console.error('Erro ao buscar vagas do técnico:', err.response ? err.response.data : err.message);
      if (err.response && err.response.status === 403) {
          setError('Você não tem permissão para acessar estas vagas.');
      } else {
          setError('Não foi possível carregar suas vagas cadastradas. Tente novamente mais tarde.');
      }
      setVagas([]); // Limpa as vagas em caso de erro para evitar mostrar dados antigos
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) { // Espera a autenticação carregar e o usuário estar definido
      fetchMinhasVagasTecnico();
    } else if (!authLoading && !user) { // Se não houver usuário após o carregamento da auth
      setError("Usuário não autenticado.");
      setLoading(false);
    }
  }, [user, authLoading, isTecnico]); // Adicionado isTecnico como dependência

  const handleDeleteVaga = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta vaga? Todas as candidaturas associadas também serão removidas.')) {
      return;
    }
    setError('');
    try {
      await apiClient.delete(`/vagas/${id}`);
      setVagas(vagas.filter(vaga => vaga.id !== id));
      alert('Vaga excluída com sucesso!');
    } catch (err) {
      console.error('Erro ao excluir vaga:', err.response ? err.response.data : err.message);
      const serverError = err.response?.data?.error || 'Erro ao excluir a vaga. Tente novamente.';
      setError(serverError);
      alert(serverError);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Data inválida';
      return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    } catch (e) {
      return 'Data inválida';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container text-center my-5">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary" />
        <p className="mt-2">Carregando dados...</p>
      </div>
    );
  }

  if (!isTecnico()) { // Segunda verificação após o loading para garantir
     return (
        <div className="container my-4">
            <div className="alert alert-danger" role="alert">
                Acesso não autorizado. Você precisa ser um técnico para acessar esta página.
            </div>
            <button onClick={() => navigate('/')} className="btn btn-secondary">Voltar para Home</button>
        </div>
     );
  }

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Minhas Vagas Cadastradas</h2>
        <Link to="/admin/cadastro-vaga" className="btn btn-success">
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Nova Vaga
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {vagas.length === 0 && !error ? (
        <div className="alert alert-info mt-3">Você ainda não cadastrou nenhuma vaga. <Link to="/admin/cadastro-vaga">Clique aqui</Link> para cadastrar sua primeira vaga.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th scope="col">Título</th>
                <th scope="col">Empresa</th>
                <th scope="col">Local</th> {/* Campo 'local' do backend */}
                <th scope="col">Expira em</th> {/* Usa 'data_encerramento' */}
                <th scope="col">Status</th>
                <th scope="col" className="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {vagas.map((vaga) => (
                <tr key={vaga.id}>
                  <td>{vaga.titulo || 'N/A'}</td>
                  <td>{vaga.empresa || 'N/A'}</td>
                  <td>{vaga.local || 'N/A'}</td> {/* Exibe 'local' diretamente se retornado */}
                  <td>{formatDate(vaga.data_encerramento)}</td> {/* Usa 'data_encerramento' */}
                  <td>
                    <span className={`badge rounded-pill bg-${vaga.ativa ? 'success-subtle text-success-emphasis' : 'secondary-subtle text-secondary-emphasis'}`}>
                      {vaga.ativa ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="text-center">
                    <Link
                        to={`/vaga/${vaga.id}`} // Leva para a página de detalhes pública
                        className="btn btn-sm btn-outline-secondary me-1"
                        title="Ver Vaga (Público)"
                    >
                        <FontAwesomeIcon icon={faEye} />
                    </Link>
                    <Link 
                      to={`/admin/vaga/${vaga.id}/inscricoes`} 
                      className="btn btn-sm btn-outline-info me-1"
                      title="Ver Candidaturas"
                    >
                      <FontAwesomeIcon icon={faUsers} />
                    </Link>
                    <Link 
                      to={`/admin/editar-vaga/${vaga.id}`} 
                      className="btn btn-sm btn-outline-warning me-1"
                      title="Editar Vaga"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </Link>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteVaga(vaga.id)}
                      title="Excluir Vaga"
                    >
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminHomePage;