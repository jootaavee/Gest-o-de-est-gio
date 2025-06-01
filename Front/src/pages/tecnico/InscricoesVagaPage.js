import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient'; // Importar o cliente API
import { useAuth } from '../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faUserCheck, faUserTimes, faFilePdf, faDownload, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const InscricoesVagaPage = () => {
  const { id: vagaId } = useParams(); // ID da vaga
  const navigate = useNavigate();
  const { user, isTecnico, loading: authLoading } = useAuth();

  const [vaga, setVaga] = useState(null);
  const [candidaturas, setCandidaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState({}); // Para rastrear o loading de cada botão

  // Busca detalhes da vaga e as candidaturas associadas
  useEffect(() => {
    const fetchData = async () => {
      if (!isTecnico()) {
        setError('Acesso não autorizado.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        // Buscar detalhes da vaga (para exibir o título, por exemplo)
        const vagaResponse = await apiClient.get(`/vagas/${vagaId}`);
        setVaga(vagaResponse.data);

        // Buscar candidaturas da vaga
        const candidaturasResponse = await apiClient.get(`/vagas/${vagaId}/candidaturas`);
        setCandidaturas(candidaturasResponse.data);

      } catch (err) {
        console.error('Erro ao buscar dados da vaga/candidaturas:', err.response ? err.response.data : err.message);
        setError('Não foi possível carregar os dados das candidaturas. Verifique se a vaga existe.');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchData();
    }
  }, [vagaId, isTecnico, authLoading]);

  // Função para atualizar o status de uma candidatura
  const handleUpdateStatus = async (candidaturaId, novoStatus) => {
    setUpdatingStatus(prev => ({ ...prev, [candidaturaId]: true })); // Inicia loading para este botão
    setError('');
    try {
      const response = await apiClient.patch(`/candidaturas/${candidaturaId}/status`, { status: novoStatus });
      // Atualiza o status na lista local
      setCandidaturas(prev => 
        prev.map(c => c.id === candidaturaId ? { ...c, status: response.data.status } : c)
      );
      // Poderia adicionar uma notificação de sucesso aqui
    } catch (err) {
      console.error('Erro ao atualizar status da candidatura:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.error || 'Erro ao atualizar status.');
      alert(err.response?.data?.error || 'Erro ao atualizar status.'); // Mostra erro
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [candidaturaId]: false })); // Finaliza loading
    }
  };

  // Formatar data
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
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
        <p className="mt-2">Carregando candidaturas...</p>
      </div>
    );
  }

  if (!isTecnico()) {
     return (
        <div className="container">
            <div className="alert alert-danger" role="alert">
                Acesso não autorizado.
            </div>
        </div>
     );
  }

  return (
    <div className="container my-4">
       <button 
        className="btn btn-outline-secondary mb-3"
        onClick={() => navigate('/admin')} // Volta para a lista de vagas do admin
      >
        <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
        Voltar para Vagas
      </button>

      <h2>Candidaturas para: {vaga?.titulo || 'Vaga não encontrada'}</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {candidaturas.length === 0 && !error ? (
        <div className="alert alert-info">Nenhuma candidatura recebida para esta vaga ainda.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th scope="col">Aluno</th>
                <th scope="col">Email</th>
                <th scope="col">Data Inscrição</th>
                <th scope="col">Status Atual</th>
                <th scope="col">Currículo</th>
                <th scope="col">Ações</th>
              </tr>
            </thead>
            <tbody>
              {candidaturas.map((c) => (
                <tr key={c.id}>
                  <td>{c.aluno?.nome_completo || 'Aluno não encontrado'}</td>
                  <td>{c.aluno?.email || 'N/A'}</td>
                  <td>{formatDate(c.data_inscricao)}</td>
                  <td>
                     <span className={`badge bg-${c.status === 'APROVADO' ? 'success' : c.status === 'REJEITADO' ? 'danger' : 'warning'}`}>
                         {c.status || 'Pendente'}
                     </span>
                  </td>
                  <td>
                    {/* Assumindo que a API retorna o currículo junto ou um link */}
                    {c.aluno?.curriculoUrl ? (
                      <a href={c.aluno.curriculoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary">
                        <FontAwesomeIcon icon={faFilePdf} className="me-1" /> Ver
                      </a>
                    ) : (
                      <span className="text-muted">N/D</span>
                    )}
                  </td>
                  <td>
                    {/* Botões para aprovar/rejeitar */}
                    <button 
                      className="btn btn-sm btn-success me-1"
                      onClick={() => handleUpdateStatus(c.id, 'APROVADO')} // Status a ser enviado para a API
                      disabled={updatingStatus[c.id] || c.status === 'APROVADO'}
                      title="Aprovar Candidatura"
                    >
                      {updatingStatus[c.id] ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faUserCheck} />}
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleUpdateStatus(c.id, 'REJEITADO')} // Status a ser enviado para a API
                      disabled={updatingStatus[c.id] || c.status === 'REJEITADO'}
                      title="Rejeitar Candidatura"
                    >
                       {updatingStatus[c.id] ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faUserTimes} />}
                    </button>
                    {/* Adicionar link para perfil do aluno se necessário */}
                    {/* <Link to={`/admin/aluno/${c.aluno?.id}`} className="btn btn-sm btn-outline-info ms-1">Perfil</Link> */}
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

export default InscricoesVagaPage;

