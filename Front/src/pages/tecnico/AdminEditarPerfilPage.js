// frontend/src/pages/tecnico/AdminEditarPerfilPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient'; // Ajuste o caminho
import { useAuth } from '../../contexts/AuthContext'; // Ajuste o caminho
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faSave, faTimes, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const AdminEditarPerfilPage = () => {
  const { user, setUser, loading: authLoading, isTecnico } = useAuth();
  const navigate = useNavigate();

  const initialFormState = {
    nome_completo: '',
    email: '', // Não editável, apenas exibição
    numero: '',
    // Adicionar campos específicos do técnico aqui se houver no schema
    // departamento: '', 
    // cargo: '',
  };
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false); // Para o botão de submit
  const [errorMessage, setError] = useState('');
  const [successMessage, setSuccess] = useState('');

  // Preenche o formulário com os dados do usuário atual
  useEffect(() => {
    if (!authLoading && user && isTecnico()) { // Verifica se é técnico também
      setFormData({
        nome_completo: user.nome_completo || '',
        email: user.email || '',
        numero: user.numero || '',
        // Adicione aqui outros campos do técnico para preencher o formulário
        // departamento: user.departamento || '',
      });
    } else if (!authLoading && (!user || !isTecnico())) {
        setError("Acesso não autorizado ou usuário não encontrado.");
    }
  }, [user, authLoading, isTecnico]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Prepara os dados para enviar (apenas campos editáveis)
    const dataParaEnviar = {
      nome_completo: formData.nome_completo,
      numero: formData.numero,
      // Adicione aqui outros campos específicos do técnico que são editáveis
      // departamento: formData.departamento,
    };

    try {
      // A rota no backend é PUT /api/users/profile ou /api/usuarios/profile
      const response = await apiClient.put('/users/profile', dataParaEnviar);

      console.log("FRONTEND - Resposta da API ao atualizar perfil (Técnico):", JSON.stringify(response.data, null, 2)); // DEBUG

      if (response.data && response.data.user && response.data.user.tipo) { // Verifica se 'user' e 'user.tipo' existem
        // ** CORREÇÃO PRINCIPAL AQUI **
        setUser(response.data.user); 
        localStorage.setItem('user', JSON.stringify(response.data.user)); 
        
        setSuccess(response.data.message || 'Perfil atualizado com sucesso!');
        setTimeout(() => setSuccess(''), 4000);
      } else {
        console.error("FRONTEND - Resposta da API inesperada (sem user ou user.tipo):", response.data);
        setError("Erro ao processar a resposta do servidor após a atualização.");
      }
    } catch (err) {
      console.error('FRONTEND - Erro ao atualizar perfil (Técnico):', err.response ? err.response.data : err.message, err);
      setError(err.response?.data?.error || 'Erro ao atualizar perfil. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="container d-flex justify-content-center align-items-center" style={{minHeight: '80vh'}}>
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary"/>
      </div>
    );
  }

  if (!isTecnico()) { // Se, após o loading da autenticação, não for técnico
     return (
        <div className="container my-5">
            <div className="alert alert-danger text-center" role="alert">
              <FontAwesomeIcon icon={faExclamationTriangle} size="lg" className="me-2" />
              Acesso não autorizado. Esta página é apenas para administradores/técnicos.
            </div>
        </div>
     );
  }
  
  // Adicionalmente, verifica se 'user' existe, caso 'isTecnico' seja true mas 'user' seja null por algum motivo
  if (!user) {
    return (
        <div className="container my-5">
            <div className="alert alert-warning text-center" role="alert">
                <FontAwesomeIcon icon={faExclamationTriangle} size="lg" className="me-2" />
                {errorMessage || "Informações do usuário não carregadas. Tente recarregar a página ou faça login novamente."}
            </div>
        </div>
    );
  }

  return (
    <div className="container my-4">
      <h2 className="mb-4">Editar Perfil - Administrador/Técnico</h2>

      {errorMessage && <div className="alert alert-danger animate__animated animate__fadeIn">{errorMessage}</div>}
      {successMessage && <div className="alert alert-success animate__animated animate__fadeIn">{successMessage}</div>}

      <form onSubmit={handleSubmit}>
        <div className="card shadow-sm">
          <div className="card-header">Informações Pessoais</div>
          <div className="card-body">
            <div className="mb-3">
              <label htmlFor="nome_completo" className="form-label">Nome Completo*</label>
              <input type="text" className="form-control" id="nome_completo" name="nome_completo"
                value={formData.nome_completo} onChange={handleChange} required disabled={loading} />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email (Não editável)</label>
              <input type="email" className="form-control" id="email" name="email"
                value={formData.email} readOnly disabled />
            </div>

            <div className="mb-3">
              <label htmlFor="numero" className="form-label">Número de Telefone</label>
              <input type="tel" className="form-control" id="numero" name="numero"
                value={formData.numero} onChange={handleChange} placeholder="(00) 00000-0000" disabled={loading}/>
            </div>
            
            {/* Adicione aqui outros campos específicos para o perfil do técnico que podem ser editados */}
            {/* 
            <div className="mb-3">
              <label htmlFor="departamento" className="form-label">Departamento</label>
              <input type="text" className="form-control" id="departamento" name="departamento" value={formData.departamento} onChange={handleChange} disabled={loading} />
            </div> 
            */}
          </div>
        </div>

        {/* Adicionar seção para mudar senha aqui, se desejar */}

        <div className="mt-4 d-flex justify-content-end">
          <button type="button" className="btn btn-outline-secondary me-2"
            onClick={() => navigate('/admin')} disabled={loading}>
            <FontAwesomeIcon icon={faTimes} className="me-1" /> Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 
              <><FontAwesomeIcon icon={faSpinner} spin className="me-1" /> Salvando...</> : 
              <><FontAwesomeIcon icon={faSave} className="me-1" /> Salvar Alterações</>
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminEditarPerfilPage;