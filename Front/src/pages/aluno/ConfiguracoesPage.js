// frontend/src/pages/aluno/ConfiguracoesPage.js

import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCog, faSun, faMoon, faDesktop, faGlobe, faBell, 
    faSpinner, faSave, faCheckCircle, faExclamationTriangle 
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext'; // Ajuste o caminho
import apiClient from '../../api/apiClient';       // Ajuste o caminho
import './ConfiguracoesPage.css';                // Crie e importe este CSS

const ConfiguracoesPage = () => {
  const { user, setUser, loading: authLoading } = useAuth();

  const defaultUserConfigurations = {
    tema: 'light',
    idioma: 'pt-br',
    notificacoesEmail: true,
  };

  const [formConfig, setFormConfig] = useState(defaultUserConfigurations);
  const [initialConfig, setInitialConfig] = useState(defaultUserConfigurations);
  const [isSaving, setIsSaving] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const applyThemeToBody = useCallback((themePreference) => {
    document.body.classList.remove('theme-light', 'theme-dark');
    let effectiveTheme = themePreference;
    if (themePreference === 'system') {
      effectiveTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.body.classList.add(effectiveTheme === 'dark' ? 'theme-dark' : 'theme-light');
  }, []);

  useEffect(() => {
    if (authLoading) {
      setPageLoading(true);
      return;
    }
    if (user) {
      const loadedConfigurations = {
        ...defaultUserConfigurations,
        ...(typeof user.configuracoes === 'object' && user.configuracoes !== null ? user.configuracoes : {}),
      };
      setFormConfig(loadedConfigurations);
      setInitialConfig(loadedConfigurations);
      applyThemeToBody(loadedConfigurations.tema);
      setPageLoading(false);
    } else {
      setErrorMessage("Você precisa estar logado para acessar as configurações.");
      setPageLoading(false);
    }
  }, [user, authLoading, applyThemeToBody]);

  useEffect(() => {
    setHasUnsavedChanges(JSON.stringify(formConfig) !== JSON.stringify(initialConfig));
  }, [formConfig, initialConfig]);

  const handleConfigChange = (field, value) => {
    setFormConfig(prevConfig => ({ ...prevConfig, [field]: value }));
    setErrorMessage('');
    setSuccessMessage('');
    if (field === 'tema') {
      applyThemeToBody(value);
    }
  };

  const handleSaveChanges = async (event) => {
    event.preventDefault();
    if (!hasUnsavedChanges) {
      setErrorMessage("Nenhuma alteração detectada para salvar.");
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // O frontend está chamando /usuarios/me/configuracoes
      // Se seu apiClient tem baseURL: /api, então a chamada final é /api/usuarios/me/configuracoes
      const response = await apiClient.put('/usuarios/me/configuracoes', formConfig);

      if (response.data && response.data.configuracoes) {
        setUser(prevAuthUser => ({
          ...prevAuthUser,
          configuracoes: response.data.configuracoes,
        }));
        setInitialConfig(response.data.configuracoes);
        setFormConfig(response.data.configuracoes);
        applyThemeToBody(response.data.configuracoes.tema);
        setSuccessMessage(response.data.message || 'Configurações salvas com sucesso!');
      } else {
        throw new Error("Resposta inválida do servidor.");
      }
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Erro ao salvar configurações:', err.response ? err.response.data : err.message);
      const serverError = err.response?.data?.error || 'Falha ao salvar as configurações. Tente novamente.';
      setErrorMessage(serverError);
    } finally {
      setIsSaving(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary" />
        <span className="ms-3 fs-5">Carregando suas configurações...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container my-5">
        <div className="alert alert-warning text-center" role="alert">
          <FontAwesomeIcon icon={faExclamationTriangle} size="lg" className="me-2" />
          {errorMessage || "Por favor, faça login para gerenciar suas configurações."}
        </div>
      </div>
    );
  }

  return (
    <div className="container my-4 configuracoes-page">
      <header className="mb-4 pb-3 border-bottom">
        <h1 className="d-flex align-items-center">
          <FontAwesomeIcon icon={faCog} className="me-3 text-primary" />
          Configurações
        </h1>
        <p className="text-muted lead fs-6">
          Ajuste as preferências do sistema para personalizar sua experiência.
        </p>
      </header>

      {errorMessage && (
        <div className="alert alert-danger d-flex align-items-center animate__animated animate__fadeIn" role="alert">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2 flex-shrink-0" />
          <div>{errorMessage}</div>
        </div>
      )}
      {successMessage && (
        <div className="alert alert-success d-flex align-items-center animate__animated animate__fadeIn" role="alert">
          <FontAwesomeIcon icon={faCheckCircle} className="me-2 flex-shrink-0" />
          <div>{successMessage}</div>
        </div>
      )}

      <form onSubmit={handleSaveChanges}>
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-light">
            <h5 className="mb-0 d-flex align-items-center">
                <FontAwesomeIcon icon={faDesktop} className="me-2" /> Aparência Visual
            </h5>
          </div>
          <div className="card-body">
            <p className="card-text small text-muted">Selecione o tema de cores da plataforma.</p>
            <div className="btn-group w-100" role="group" aria-label="Opções de tema">
              {['light', 'dark', 'system'].map(themeOpt => (
                <button type="button" key={themeOpt}
                  className={`btn btn-outline-secondary btn-tema ${formConfig.tema === themeOpt ? 'active' : ''}`}
                  onClick={() => handleConfigChange('tema', themeOpt)}>
                  {themeOpt === 'light' && <FontAwesomeIcon icon={faSun} className="me-2" />}
                  {themeOpt === 'dark' && <FontAwesomeIcon icon={faMoon} className="me-2" />}
                  {themeOpt === 'system' && <FontAwesomeIcon icon={faDesktop} className="me-2" />}
                  {themeOpt.charAt(0).toUpperCase() + themeOpt.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card shadow-sm mb-4">
          <div className="card-header bg-light">
            <h5 className="mb-0 d-flex align-items-center">
                <FontAwesomeIcon icon={faGlobe} className="me-2" /> Idioma e Regionalização
            </h5>
          </div>
          <div className="card-body">
            <p className="card-text small text-muted">Escolha o idioma da interface.</p>
            <div className="btn-group w-100" role="group" aria-label="Opções de idioma">
              {[{ value: 'pt-br', label: 'Português (Brasil)' }, { value: 'en', label: 'English (US)' }].map(langOpt => (
                <button type="button" key={langOpt.value}
                  className={`btn btn-outline-secondary btn-idioma ${formConfig.idioma === langOpt.value ? 'active' : ''}`}
                  onClick={() => handleConfigChange('idioma', langOpt.value)}>
                  {langOpt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-light">
            <h5 className="mb-0 d-flex align-items-center">
                <FontAwesomeIcon icon={faBell} className="me-2" /> Preferências de Notificação
            </h5>
          </div>
          <div className="card-body">
            <div className="form-check form-switch form-switch-lg">
              <input
                className="form-check-input" type="checkbox" role="switch" id="notificacoesEmailSwitch"
                checked={formConfig.notificacoesEmail}
                onChange={(e) => handleConfigChange('notificacoesEmail', e.target.checked)}
              />
              <label className="form-check-label" htmlFor="notificacoesEmailSwitch">
                Receber e-mails sobre status de candidaturas e novas vagas relevantes.
              </label>
            </div>
          </div>
        </div>

        <div className="mt-4 d-flex justify-content-end">
          <button type="submit" className="btn btn-primary btn-lg px-4" disabled={isSaving || !hasUnsavedChanges}>
            {isSaving ? (
              <><FontAwesomeIcon icon={faSpinner} spin className="me-2" /> Salvando Alterações...</>
            ) : (
              <><FontAwesomeIcon icon={faSave} className="me-2" /> Salvar Configurações</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConfiguracoesPage;