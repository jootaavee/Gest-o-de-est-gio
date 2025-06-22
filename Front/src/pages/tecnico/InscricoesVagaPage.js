import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faUserCheck, faUserTimes, faFilePdf, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const InscricoesVagaPage = () => {
  const { id: vagaId } = useParams();
  const navigate = useNavigate();
  const { isTecnico, loading: authLoading } = useAuth();

  const [vaga, setVaga] = useState(null);
  const [candidaturas, setCandidaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState({});

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
        const vagaResponse = await apiClient.get(`/vagas/${vagaId}`);
        setVaga(vagaResponse.data);

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

  const handleUpdateStatus = async (candidaturaId, novoStatus) => {
    setUpdatingStatus(prev => ({ ...prev, [candidaturaId]: true }));
    setError('');
    try {
      const response = await apiClient.patch(`/candidaturas/${candidaturaId}/status`, { status: novoStatus });
      setCandidaturas(prev => 
        prev.map(c => c.id === candidaturaId ? { ...c, status: response.data.status } : c)
      );
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Erro ao atualizar status.';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [candidaturaId]: false }));
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
        onClick={() => navigate('/admin')}
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
                     <span className={`badge bg-${c.status === 'APROVADO' ? 'success' : c.status === 'REPROVADO' ? 'danger' : 'warning'}`}>
                         {c.status}
                     </span>
                  </td>
                  <td>
                    {c.aluno?.curriculoUrl ? (
                      <a href={c.aluno.curriculoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary">
                        <FontAwesomeIcon icon={faFilePdf} className="me-1" /> Ver
                      </a>
                    ) : (
                      <span className="text-muted">N/D</span>
                    )}
                  </td>
                  {/* --- LÓGICA DE AÇÕES ATUALIZADA --- */}
                  <td>
                    {c.status === 'APROVADO' && (
                      <button className="btn btn-sm btn-success" disabled title="Aprovado">
                        <FontAwesomeIcon icon={faUserCheck} />
                      </button>
                    )}

                    {c.status === 'REPROVADO' && (
                      <button className="btn btn-sm btn-danger" disabled title="Reprovado">
                        <FontAwesomeIcon icon={faUserTimes} />
                      </button>
                    )}

                    {c.status === 'PENDENTE' && (
                      <>
                        <button 
                          className="btn btn-sm btn-success me-1"
                          onClick={() => handleUpdateStatus(c.id, 'APROVADO')}
                          disabled={updatingStatus[c.id]}
                          title="Aprovar Candidatura"
                        >
                          {updatingStatus[c.id] ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faUserCheck} />}
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleUpdateStatus(c.id, 'REPROVADO')}
                          disabled={updatingStatus[c.id]}
                          title="Reprovar Candidatura"
                        >
                          {updatingStatus[c.id] ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faUserTimes} />}
                        </button>
                      </>
                    )}
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