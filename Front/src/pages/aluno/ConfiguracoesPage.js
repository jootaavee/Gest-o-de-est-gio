import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faSun, faMoon, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const ConfiguracoesPage = () => {
  const { user, setUser } = useAuth();

  const [configuracoes, setConfiguracoes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Preencher as configurações assim que o `user` estiver disponível
  useEffect(() => {
    if (user && user.configuracoes) {
      setConfiguracoes({
        tema: user.configuracoes.tema || 'light',
        idioma: user.configuracoes.idioma || 'pt-br',
      });

      document.body.classList.toggle('dark-theme', user.configuracoes.tema === 'dark');
    }
  }, [user]);

  const handleTemaChange = (tema) => {
    setConfiguracoes(prev => ({ ...prev, tema }));
  };

  const handleIdiomaChange = (idioma) => {
    setConfiguracoes(prev => ({ ...prev, idioma }));
  };

  const handleSave = async () => {
    if (!configuracoes) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.put('/api/usuarios/me/configuracoes', configuracoes);

      setUser(prev => ({
        ...prev,
        configuracoes: response.data.configuracoes
      }));

      document.body.classList.toggle('dark-theme', configuracoes.tema === 'dark');

      setSuccess('Configurações atualizadas com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erro ao atualizar configurações:', err);
      setError(err.response?.data?.error || 'Erro ao atualizar configurações. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Se ainda não carregou o `user` ou `configuracoes`, mostrar carregando
  if (!user || !configuracoes) {
    return <div>Carregando configurações...</div>;
  }

  return (
    <div className="container">
      <h1>
        <FontAwesomeIcon icon={faCog} className="mr-2" />
        Configurações
      </h1>

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Preferências</h5>
        </div>
        <div className="card-body">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success" role="alert">
              {success}
            </div>
          )}

          <div className="form-group">
            <label>
              <FontAwesomeIcon icon={configuracoes.tema === 'light' ? faSun : faMoon} className="mr-2" />
              Tema
            </label>
            <div className="btn-group d-block mb-3">
              <button
                type="button"
                className={`btn ${configuracoes.tema === 'light' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => handleTemaChange('light')}
              >
                <FontAwesomeIcon icon={faSun} className="mr-2" />
                Claro
              </button>
              <button
                type="button"
                className={`btn ${configuracoes.tema === 'dark' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => handleTemaChange('dark')}
              >
                <FontAwesomeIcon icon={faMoon} className="mr-2" />
                Escuro
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>
              <FontAwesomeIcon icon={faGlobe} className="mr-2" />
              Idioma
            </label>
            <div className="btn-group d-block mb-3">
              <button
                type="button"
                className={`btn ${configuracoes.idioma === 'pt-br' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => handleIdiomaChange('pt-br')}
              >
                Português (BR)
              </button>
              <button
                type="button"
                className={`btn ${configuracoes.idioma === 'en' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => handleIdiomaChange('en')}
              >
                English
              </button>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracoesPage;
