// frontend/src/pages/aluno/EditarPerfilPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faSave, faTimes, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const EditarPerfilPage = () => {
  const { user, setUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setError] = useState('');
  const [successMessage, setSuccess] = useState('');

  const initialFormState = {
    nome_completo: '',
    email: '',
    numero: '',
    curso: '',
    periodo: '',
    matricula: '',
    cpf: '',
    data_nascimento: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (!authLoading && user) {
      setFormData({
        nome_completo: user.nome_completo || '',
        email: user.email || '',
        numero: user.numero || '',
        curso: user.curso || '',
        periodo: user.periodo?.toString() || '',
        matricula: user.matricula || '',
        cpf: user.cpf || '',
        data_nascimento: user.data_nascimento || '',
      });
    } else if (!authLoading && !user) {
      setError("Sessão expirada ou usuário não encontrado. Por favor, faça login novamente.");
    }
  }, [user, authLoading]);

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

    const dataParaEnviar = {
      nome_completo: formData.nome_completo,
      numero: formData.numero,
      data_nascimento: formData.data_nascimento,
      curso: formData.curso,
      periodo: formData.periodo ? parseInt(formData.periodo, 10) : null,
    };

    try {
      const response = await apiClient.put('/users/profile', dataParaEnviar);
      console.log("FRONTEND - Resposta da API ao atualizar perfil (Aluno):", JSON.stringify(response.data, null, 2));

      if (response.data && response.data.user && response.data.user.tipo) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setSuccess(response.data.message || 'Perfil atualizado com sucesso!');
        setTimeout(() => setSuccess(''), 4000);
      } else {
        console.error("FRONTEND - Resposta da API inesperada:", response.data);
        setError("Erro ao processar a resposta do servidor após a atualização.");
      }
    } catch (err) {
      console.error('FRONTEND - Erro ao atualizar perfil (Aluno):', err.response ? err.response.data : err.message, err);
      setError(err.response?.data?.error || 'Erro ao atualizar perfil. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container my-5">
        <div className="alert alert-warning text-center" role="alert">
          <FontAwesomeIcon icon={faExclamationTriangle} size="lg" className="me-2" />
          {errorMessage || "Você precisa estar logado para editar seu perfil."}
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4 text-center">Editar Meu Perfil</h2>

      <div className="mx-auto" style={{ maxWidth: '900px' }}>
        {errorMessage && <div className="alert alert-danger animate__animated animate__fadeIn mb-4">{errorMessage}</div>}
        {successMessage && <div className="alert alert-success animate__animated animate__fadeIn mb-4">{successMessage}</div>}

        <form onSubmit={handleSubmit}>
          <div className="card shadow-sm mb-4">
            <div className="card-header">
              <h5 className="mb-0">Informações Pessoais</h5>
            </div>
            <div className="card-body p-4">
              <div className="row g-4"> {/* Aumentado o espaçamento para g-4 */}
                <div className="col-12">
                  <label htmlFor="nome_completo" className="form-label">Nome Completo*</label>
                  <input type="text" className="form-control" id="nome_completo" name="nome_completo"
                    value={formData.nome_completo} onChange={handleChange} required disabled={loading} />
                </div>
                <div className="col-md-6">
                  <label htmlFor="email" className="form-label">Email (Não editável)</label>
                  <input type="email" className="form-control-plaintext" id="email" name="email"
                    value={formData.email} readOnly />
                </div>
                <div className="col-md-6">
                  <label htmlFor="cpf" className="form-label">CPF (Não editável)</label>
                  <input type="text" className="form-control-plaintext" id="cpf" name="cpf"
                    value={formData.cpf} readOnly />
                </div>
                <div className="col-md-6">
                  <label htmlFor="numero" className="form-label">Número de Telefone</label>
                  <input type="tel" className="form-control" id="numero" name="numero"
                    value={formData.numero} onChange={handleChange} placeholder="(00) 00000-0000" disabled={loading} />
                </div>
                <div className="col-md-6">
                  <label htmlFor="data_nascimento" className="form-label">Data de Nascimento</label>
                  <input type="date" className="form-control" id="data_nascimento" name="data_nascimento"
                    value={formData.data_nascimento} onChange={handleChange} disabled={loading} />
                </div>
              </div>
            </div>
          </div>

          {user.tipo === 'ALUNO' && (
            <div className="card shadow-sm">
              <div className="card-header">
                <h5 className="mb-0">Informações Acadêmicas (Aluno)</h5>
              </div>
              <div className="card-body p-4">
                <div className="row g-4"> {/* Aumentado o espaçamento para g-4 */}
                  <div className="col-md-4">
                    <label htmlFor="matricula" className="form-label">Matrícula (Não editável)</label>
                    <input type="text" className="form-control-plaintext" id="matricula" name="matricula"
                      value={formData.matricula} readOnly />
                  </div>
                  <div className="col-md-5">
                    <label htmlFor="curso" className="form-label">Curso</label>
                    <input type="text" className="form-control" id="curso" name="curso"
                      value={formData.curso} onChange={handleChange} disabled={loading} />
                  </div>
                  <div className="col-md-3">
                    <label htmlFor="periodo" className="form-label">Período</label>
                    <input type="number" className="form-control" id="periodo" name="periodo"
                      value={formData.periodo} onChange={handleChange} min="1" disabled={loading} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 pt-2 d-flex justify-content-end">
            <button type="button" className="btn btn-secondary me-3"
              onClick={() => navigate(-1)} disabled={loading}>
              <FontAwesomeIcon icon={faTimes} className="me-2" /> Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ?
                <><FontAwesomeIcon icon={faSpinner} spin className="me-2" /> Salvando...</> :
                <><FontAwesomeIcon icon={faSave} className="me-2" /> Salvar Alterações</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarPerfilPage;  