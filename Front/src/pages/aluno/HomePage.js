// frontend/src/pages/HomePage.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
// Removido useAuth se não estiver sendo usado diretamente para lógica de exibição aqui
// import { useAuth } from '../../contexts/AuthContext';

const HomePage = () => {
  const [vagas, setVagas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVagas, setFilteredVagas] = useState([]);
  
  const navigate = useNavigate();
  // const { user } = useAuth(); // Descomente se precisar de lógica baseada no usuário

  useEffect(() => {
    const fetchVagas = async () => {
      setLoading(true);
      setError('');
      try {
        // CORREÇÃO: Chamar a rota principal de listagem de vagas
        const response = await apiClient.get('/vagas'); // Acessa GET /api/vagas
        setVagas(response.data);
        setFilteredVagas(response.data); // Inicialmente, todas as vagas buscadas são "filtradas"
      } catch (err) {
        console.error('Erro ao carregar vagas na HomePage:', err.response ? err.response.data : err.message);
        setError('Não foi possível carregar as vagas disponíveis. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchVagas();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredVagas(vagas); // Se não há busca, mostra todas as vagas originais
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = vagas.filter(vaga => 
      vaga.titulo?.toLowerCase().includes(lowerSearchTerm) ||
      (vaga.descricao && vaga.descricao.toLowerCase().includes(lowerSearchTerm)) || // 'descricao' pode não vir no select de getAllVagas
      vaga.local?.toLowerCase().includes(lowerSearchTerm) || // 'local' é o nome do campo no backend após mapeamento
      vaga.empresa?.toLowerCase().includes(lowerSearchTerm)
    );
    
    setFilteredVagas(filtered);
  }, [searchTerm, vagas]);

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

  const formatCurrency = (value) => {
    // O campo 'bolsa' no backend é String, então não tentamos formatar como número.
    // Exibimos como está ou 'N/A'.
    return value || 'N/A';
  };

  const handleVagaClick = (vagaId) => {
    if (!vagaId) {
        console.error("Tentativa de navegar para detalhes com ID inválido:", vagaId);
        setError("ID da vaga inválido para navegação.");
        return;
    }
    console.log("Navegando para detalhes da vaga com ID:", vagaId);
    navigate(`/vaga/${vagaId}`); // Assegure-se que suas rotas no React Router estão configuradas para /vaga/:id
  };

  if (loading) {
    return (
        <div className="container text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-2">Carregando vagas...</p>
        </div>
    );
  }
  
  return (
    <div className="container mt-4">
      <h1>Vagas de Estágio</h1>
      
      <div className="input-group my-3">
        <span className="input-group-text">
          <FontAwesomeIcon icon={faSearch} />
        </span>
        <input
          type="text"
          className="form-control"
          placeholder="Buscar por título, empresa ou local..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      {!loading && filteredVagas.length === 0 && !error && (
        <div className="alert alert-info mt-3" role="alert">
          {searchTerm ? 'Nenhuma vaga encontrada com os termos da busca.' : 'Nenhuma vaga disponível no momento.'}
        </div>
      )}

      {!loading && filteredVagas.length > 0 && (
        <div className="row">
          {filteredVagas.map(vaga => (
            <div className="col-md-6 col-lg-4 mb-4" key={vaga.id}>
              <div className="card h-100 shadow-sm">
                 {vaga.imagem ? ( // Checa se 'imagem' existe e tem valor
                  <img 
                    src={vaga.imagem} 
                    className="card-img-top" 
                    alt={`Imagem da vaga ${vaga.titulo}`}
                    style={{ height: '180px', objectFit: 'contain', paddingTop: '10px' }} // 'contain' para não cortar muito
                  />
                ) : (
                  <div 
                    className="card-img-top bg-light d-flex align-items-center justify-content-center"
                    style={{ height: '180px' }}
                  >
                    <span className="text-muted fs-5">🏢</span> {/* Emoji ou ícone padrão */}
                  </div>
                )}
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{vaga.titulo}</h5>
                  <p className="card-text small text-muted">
                    <strong>Empresa:</strong> {vaga.empresa || 'Não informado'}<br />
                    <strong>Local:</strong> {vaga.local || 'Não informado'}<br /> {/* 'local' vem do backend */}
                    <strong>Bolsa:</strong> {formatCurrency(vaga.bolsa)}<br /> {/* 'bolsa' vem do backend */}
                    <strong>Expira em:</strong> {formatDate(vaga.data_encerramento)} {/* 'data_encerramento' vem do backend */}
                  </p>
                  <button 
                    className="btn btn-outline-primary btn-sm mt-auto" // Botão no final do card
                    onClick={() => {
                        // Adicionar log para depurar o ID antes de navegar
                        console.log("HomePage - Clicou em Ver Detalhes, ID:", vaga.id, "Tipo:", typeof vaga.id);
                        if (typeof vaga.id === 'string' && vaga.id.length === 24) { // Checagem básica para ObjectId string
                            handleVagaClick(vaga.id);
                        } else {
                            console.error("ID da vaga inválido ou não é string de 24 chars:", vaga.id);
                            setError("ID da vaga parece estar inválido na listagem.");
                        }
                    }}
                  >
                    <FontAwesomeIcon icon={faExternalLinkAlt} className="me-1" />
                    Ver Detalhes
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;