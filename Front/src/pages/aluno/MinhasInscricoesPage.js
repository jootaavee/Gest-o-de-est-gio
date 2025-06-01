import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient'; // Importar o cliente API
import { useAuth } from '../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faSpinner, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

const MinhasInscricoesPage = () => {
  const [inscricoes, setInscricoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchInscricoes = async () => {
      if (!user || user.tipo !== 'ALUNO') {
        setLoading(false);
        // setError('Você precisa estar logado como aluno para ver suas inscrições.');
        return; // Não busca se não for aluno
      }
      
      setLoading(true);
      setError('');
      try {
        const response = await apiClient.get('/candidaturas/minhas'); // Endpoint para buscar minhas candidaturas
        setInscricoes(response.data);
      } catch (err) {
        console.error('Erro ao buscar minhas inscrições:', err.response ? err.response.data : err.message);
        setError('Não foi possível carregar suas inscrições. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    // Só busca as inscrições quando a autenticação não estiver carregando e o usuário for aluno
    if (!authLoading) {
      fetchInscricoes();
    }

  }, [user, authLoading]);

  // Formatar data (ajustado para receber string ISO 8601)
  const formatDate = (dateString) => {
    if (!dateString) return 'Data inválida';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Data inválida';
      return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    } catch (e) {
      console.error("Erro ao formatar data:", dateString, e);
      return 'Data inválida';
    }
  };

  // Renderizar status da inscrição com ícone
  const renderStatus = (status) => {
    let statusText = '';
    let icon = null;
    let colorClass = '';

    switch (status?.toLowerCase()) {
      case 'em analise':
      case 'pendente':
        statusText = 'Em análise';
        icon = faSpinner;
        colorClass = 'text-warning';
        break;
      case 'aprovado':
      case 'aprovado para entrevista':
        statusText = 'Aprovado';
        icon = faCheckCircle;
        colorClass = 'text-success';
        break;
      case 'rejeitado':
        statusText = 'Rejeitado';
        icon = faTimesCircle;
        colorClass = 'text-danger';
        break;
      default:
        statusText = status || 'Desconhecido';
        icon = faFileAlt;
        colorClass = 'text-secondary';
    }

    return (
      <span className={colorClass}>
        <FontAwesomeIcon icon={icon} className={`me-2 ${status?.toLowerCase() === 'em analise' ? 'fa-spin' : ''}`} />
        {statusText}
      </span>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="container text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
        <p className="mt-2">Carregando suas inscrições...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  if (!user || user.tipo !== 'ALUNO') {
     return (
        <div className="container">
            <div className="alert alert-warning" role="alert">
                Você precisa estar logado como aluno para acessar esta página.
            </div>
        </div>
     );
  }

  return (
    <div className="container my-4">
      <h2>Minhas Inscrições</h2>

      {inscricoes.length === 0 ? (
        <div className="alert alert-info" role="alert">
          Você ainda não se inscreveu em nenhuma vaga.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th scope="col">Vaga</th>
                <th scope="col">Empresa</th>
                <th scope="col">Data da Inscrição</th>
                <th scope="col">Status</th>
                <th scope="col">Ações</th>
              </tr>
            </thead>
            <tbody>
              {inscricoes.map((inscricao) => (
                <tr key={inscricao.id}>
                  <td>{inscricao.vaga?.titulo || 'Vaga não encontrada'}</td>
                  <td>{inscricao.vaga?.empresa || 'N/A'}</td>
                  <td>{formatDate(inscricao.data_inscricao)}</td>
                  <td>{renderStatus(inscricao.status)}</td>
                  <td>
                    <Link 
                      to={`/vaga/${inscricao.vaga?.id}`} 
                      className="btn btn-sm btn-outline-primary"
                      disabled={!inscricao.vaga?.id} // Desabilita se não houver ID da vaga
                    >
                      Ver Vaga
                    </Link>
                    {/* Adicionar outras ações se necessário, como cancelar inscrição */}
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

export default MinhasInscricoesPage;

