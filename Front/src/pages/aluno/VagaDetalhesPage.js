// frontend/src/pages/VagaDetalhesPage.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faFileAlt, faCheckCircle, faTimesCircle, faSpinner, faExclamationTriangle, faHourglassHalf } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';

const VagaDetalhesPage = () => {
  const { id: vagaIdParam } = useParams(); // Renomeado para clareza, é o ID da vaga da URL
  const navigate = useNavigate();
  const { user, loading: authLoading, isAluno } = useAuth(); // Usar isAluno do context se disponível
  
  const [vaga, setVaga] = useState(null);
  const [loadingVaga, setLoadingVaga] = useState(true);
  const [error, setError] = useState('');
  const [candidatura, setCandidatura] = useState(null); // Armazena a candidatura completa, se houver
  const [loadingCandidatura, setLoadingCandidatura] = useState(true);
  const [inscrevendo, setInscrevendo] = useState(false);
  const [temCurriculo, setTemCurriculo] = useState(false);
  const [loadingCurriculo, setLoadingCurriculo] = useState(true);

  // Buscar detalhes da vaga
  useEffect(() => {
    const fetchVagaDetalhes = async () => {
      if (!vagaIdParam) {
        setError("ID da vaga não encontrado na URL.");
        setLoadingVaga(false);
        return;
      }
      setLoadingVaga(true);
      setError('');
      try {
        const response = await apiClient.get(`/vagas/${vagaIdParam}`);
        setVaga(response.data);
      } catch (err) {
        console.error('Erro ao buscar detalhes da vaga:', err.response ? err.response.data : err.message);
        if (err.response && err.response.status === 404) {
          setError('Vaga não encontrada. Pode ter sido removida ou o link está incorreto.');
        } else if (err.response && err.response.data && err.response.data.error === "O ID da vaga fornecido é inválido.") {
            setError("O ID da vaga na URL parece ser inválido. Verifique o link.");
        } else {
          setError('Não foi possível carregar os detalhes da vaga. Tente novamente mais tarde.');
        }
      } finally {
        setLoadingVaga(false);
      }
    };
    fetchVagaDetalhes();
  }, [vagaIdParam]);

  // Verificar candidatura e currículo do aluno
  useEffect(() => {
    const verificarStatusAluno = async () => {
      if (user && user.tipo === 'ALUNO' && vagaIdParam) {
        setLoadingCandidatura(true);
        setLoadingCurriculo(true);

        // Verificar candidatura existente para esta vaga
        try {
          const candidaturaResponse = await apiClient.get(`/candidaturas/vaga/${vagaIdParam}/minha`);
          if (candidaturaResponse.data && candidaturaResponse.data.id) {
            setCandidatura(candidaturaResponse.data);
          } else {
            setCandidatura(null); // Nenhuma candidatura ou dados insuficientes
          }
        } catch (err) {
          if (err.response && err.response.status === 404) {
            setCandidatura(null); // 404 significa que não há candidatura, o que é um estado válido.
          } else {
            console.error('Erro ao verificar candidatura:', err.response ? err.response.data : err.message);
            // Pode setar um erro específico para falha ao buscar candidatura aqui, se desejar
          }
        } finally {
          setLoadingCandidatura(false);
        }

        // Verificar se o aluno tem currículo
        try {
           const docResponse = await apiClient.get('/documentos/meus'); // Supondo que este endpoint lista documentos do usuário
           const curriculoEncontrado = docResponse.data.find(doc => doc.tipo === 'CURRICULO');
           setTemCurriculo(!!curriculoEncontrado);
        } catch (err) {
           console.error('Erro ao verificar documentos do aluno:', err.response ? err.response.data : err.message);
           // Tratar erro, talvez mostrar um aviso para o aluno verificar seus documentos.
        } finally {
           setLoadingCurriculo(false);
        }
      } else {
        // Se não for aluno ou não estiver logado, reseta os loadings
        setLoadingCandidatura(false);
        setLoadingCurriculo(false);
      }
    };

    if (!authLoading && user) { // Só executa se a autenticação estiver completa e houver um usuário
      verificarStatusAluno();
    } else if (!authLoading && !user) { // Se auth carregou e não há usuário
        setLoadingCandidatura(false);
        setLoadingCurriculo(false);
    }

  }, [vagaIdParam, user, authLoading]); // Dependências

  const formatDate = (dateString) => {
    if (!dateString) return 'N/D';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Data Inválida';
      return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' }); // Adicionar timezone para consistência
    } catch (e) {
      return 'Erro ao formatar';
    }
  };

  // Bolsa é string, então apenas exibe ou retorna 'N/D'
  const formatBolsa = (bolsaValor) => {
    return bolsaValor || 'N/D';
  };

  const handleInscrever = async () => {
    if (!temCurriculo) {
      setError('Atenção! Você precisa enviar seu currículo antes de se inscrever. Acesse a página "Meus Documentos".');
      return;
    }

    setInscrevendo(true);
    setError(''); // Limpa erros anteriores
    
    try {
      // CORREÇÃO: Enviar vaga_id (com underscore) no corpo da requisição
      const response = await apiClient.post('/candidaturas', { vaga_id: vagaIdParam });
      
      // A resposta do backend agora é: { message: "...", candidatura: { ... } }
      // Então, pegue a propriedade 'candidatura' para atualizar o estado
      if (response.data && response.data.candidatura) {
          setCandidatura(response.data.candidatura);
          alert(response.data.message || 'Inscrição realizada com sucesso!');
      } else {
          throw new Error("Resposta da inscrição inválida do servidor.");
      }

    } catch (err) {
      console.error('Erro ao realizar inscrição:', err);
      const serverError = err.response?.data?.error || err.message || 'Erro desconhecido ao realizar inscrição. Tente novamente.';
      setError(serverError);
      // Não precisa de alert aqui, pois o setError vai mostrar a mensagem na tela.
    } finally {
      setInscrevendo(false);
    }
  };

  const handleVoltar = () => navigate(-1);

  const renderCandidaturaStatus = () => {
    if (loadingCandidatura) return <p className="text-muted"><em>Verificando status da sua candidatura...</em></p>;
    if (!candidatura) return null;

    let statusText = `Status da Candidatura: ${candidatura.status}`;
    let icon = faFileAlt;
    let alertClass = 'alert-info'; // Classe padrão

    switch (candidatura.status?.toUpperCase()) { // Usa optional chaining e toUpperCase para ser robusto
      case 'PENDENTE':
        statusText = 'Sua candidatura está em análise pela empresa.';
        icon = faHourglassHalf;
        alertClass = 'alert-warning';
        break;
      case 'APROVADO': // Pode ser 'APROVADO PARA ENTREVISTA' etc., ajuste conforme seus status
        statusText = 'Parabéns! Sua candidatura foi aprovada para a próxima etapa.';
        icon = faCheckCircle;
        alertClass = 'alert-success';
        break;
      case 'REPROVADO':
        statusText = 'Sua candidatura não foi aprovada para esta vaga.';
        icon = faTimesCircle;
        alertClass = 'alert-danger';
        break;
    }

    return (
      <div className={`alert ${alertClass} d-flex align-items-center my-3`} role="alert">
        <FontAwesomeIcon icon={icon} className={`me-2 ${candidatura.status === 'PENDENTE' ? 'fa-spin' : ''}`} />
        <div>{statusText}</div>
      </div>
    );
  };

  if (authLoading || loadingVaga) {
    return (
      <div className="container text-center my-5">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary" />
        <p className="mt-2">Carregando detalhes da vaga...</p>
      </div>
    );
  }

  if (error && !vaga) { // Se houver erro e nenhuma vaga foi carregada
    return (
      <div className="container my-4">
        <button className="btn btn-outline-secondary mb-3" onClick={handleVoltar}>
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Voltar
        </button>
        <div className="alert alert-danger" role="alert">{error}</div>
      </div>
    );
  }

  if (!vaga) { // Se não estiver carregando e não houver vaga (improvável se o erro for tratado)
    return (
      <div className="container my-4">
        <button className="btn btn-outline-secondary mb-3" onClick={handleVoltar}>
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Voltar
        </button>
        <div className="alert alert-info">Vaga não disponível.</div>
      </div>
    );
  }

  // Lógica para desabilitar o botão de inscrição
  const dataAtual = new Date();
  const dataEncerramentoVaga = new Date(vaga.data_encerramento);
  dataEncerramentoVaga.setUTCHours(23,59,59,999); // Considerar o fim do dia
  const podeInscrever = vaga.ativa && dataAtual <= dataEncerramentoVaga;


  return (
    <div className="container my-4">
      <button className="btn btn-outline-secondary mb-3 d-print-none" onClick={handleVoltar}>
        <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Voltar
      </button>
      
      <div className="card shadow-sm">
        {vaga.imagem && ( // Supondo que vaga.imagem é a URL
          <img src={vaga.imagem} className="card-img-top" alt={`Imagem da vaga ${vaga.titulo}`} style={{ maxHeight: '350px', objectFit: 'contain', borderBottom: '1px solid #eee', padding: '1rem', backgroundColor: '#f8f9fa' }} />
        )}
        <div className="card-body p-4">
          <h2 className="card-title mb-3">{vaga.titulo}</h2>

          {user && user.tipo === 'ALUNO' && renderCandidaturaStatus()}
          {error && <div className="alert alert-danger mt-2">{error}</div>} {/* Erro da candidatura */}

          <div className="row mb-3">
            <div className="col-md-7">
              <h5 className="text-primary">Detalhes da Oportunidade</h5>
              <ul className="list-unstyled">
                <li><strong>Empresa:</strong> {vaga.empresa || 'Não informado'}</li>
                <li><strong>Local:</strong> {vaga.local || 'Não informado'}</li>
                <li><strong>Turno:</strong> {vaga.turno || 'Não informado'}</li>
                <li><strong>Carga Horária:</strong> {vaga.carga_horaria ? `${vaga.carga_horaria}h semanais` : 'Não informado'}</li>
                <li><strong>Bolsa:</strong> {formatBolsa(vaga.bolsa)}</li>
                {vaga.beneficios && <li><strong>Benefícios:</strong> {vaga.beneficios}</li>}
              </ul>
            </div>
            <div className="col-md-5">
                <h5 className="text-primary">Prazos</h5>
                 <ul className="list-unstyled">
                    <li><strong>Publicada em:</strong> {formatDate(vaga.data_abertura)}</li>
                    <li><strong>Inscrições até:</strong> {formatDate(vaga.data_encerramento)}</li>
                    <li><strong>Status da Vaga:</strong> <span className={`badge bg-${vaga.ativa ? 'success' : 'danger'}`}>{vaga.ativa ? 'Ativa' : 'Inativa'}</span></li>
                </ul>
                {vaga.link_edital && (
                    <a href={vaga.link_edital} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-info mt-2">
                        Ver Edital <FontAwesomeIcon icon={faFileAlt} className="ms-1" />
                    </a>
                )}
            </div>
          </div>
          
          <hr />
          <h5 className="text-primary mt-3">Descrição Completa</h5>
          <p style={{ whiteSpace: 'pre-wrap' }}>{vaga.descricao || "Descrição não fornecida."}</p>
          
          {vaga.requisitos && (
            <>
              <h5 className="text-primary mt-3">Requisitos</h5>
              <p style={{ whiteSpace: 'pre-wrap' }}>{vaga.requisitos}</p>
            </>
          )}

          {vaga.curso_requerido && (
            <p><strong>Curso Requerido:</strong> {vaga.curso_requerido} {vaga.periodo_minimo ? `(a partir do ${vaga.periodo_minimo}º período)` : ''}</p>
          )}
          
          {user && user.tipo === 'ALUNO' && !candidatura && podeInscrever && (
            <div className="mt-4 text-center">
              {loadingCurriculo ? (
                 <p className="text-muted"><em>Verificando seu currículo...</em> <FontAwesomeIcon icon={faSpinner} spin /></p>
              ) : !temCurriculo ? (
                <div className="alert alert-warning d-flex align-items-center justify-content-center">
                  <FontAwesomeIcon icon={faExclamationTriangle} size="lg" className="me-2 flex-shrink-0" />
                  <div>
                    <strong>Atenção!</strong> Para se candidatar, você precisa ter um currículo cadastrado em "Meus Documentos".
                    <Link to="/meus-documentos" className="alert-link stretched-link ms-1">Clique aqui para adicionar seu currículo.</Link>
                  </div>
                </div>
              ) : (
                <button 
                  className="btn btn-success btn-lg"
                  onClick={handleInscrever}
                  disabled={inscrevendo}
                >
                  {inscrevendo ? (
                    <><FontAwesomeIcon icon={faSpinner} spin className="me-2" /> Enviando Candidatura...</>
                  ) : (
                    'Quero me Candidatar!'
                  )}
                </button>
              )}
            </div>
          )}
           {!podeInscrever && user && user.tipo === 'ALUNO' && !candidatura && (
                <div className="alert alert-secondary text-center mt-4">
                    { vaga.ativa ? "As inscrições para esta vaga estão encerradas." : "Esta vaga não está mais ativa."}
                </div>
           )}

        </div> {/* Fim card-body */}
      </div> {/* Fim card */}
    </div>
  );
};

export default VagaDetalhesPage;