// src/pages/tecnico/CadastrarNotificacaoPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faSave, faTimes, faPaperPlane, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const CadastrarNotificacaoPage = () => {
  const navigate = useNavigate();
  const { isTecnico, loading: authLoading } = useAuth();

  const initialState = {
    destinatario_matricula: '',
    titulo: '',
    mensagem: '',
  };

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.destinatario_matricula || !formData.titulo || !formData.mensagem) {
      setError('Matrícula do Aluno, Título e Mensagem são obrigatórios.');
      return;
    }

    setLoading(true);

    try {
      const dataToSend = {
        destinatario_matricula: formData.destinatario_matricula,
        titulo: formData.titulo,
        mensagem: formData.mensagem,
      };

      await apiClient.post('/notificacoes/enviar', dataToSend);
      setSuccess('Notificação enviada com sucesso para o aluno!');
      setFormData(initialState); // Limpa o formulário

      setTimeout(() => setSuccess(''), 4000);

    } catch (err) {
      const serverError = err.response?.data?.error || 'Erro ao enviar notificação. Verifique se a matrícula do aluno é válida.';
      setError(serverError);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="container d-flex justify-content-center align-items-center vh-100"><FontAwesomeIcon icon={faSpinner} spin size="3x"/></div>;
  }
  
  if (!isTecnico()) {
      return (
        <div className="container my-5">
            <div className="alert alert-danger text-center">
                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                Acesso não autorizado para esta funcionalidade.
            </div>
        </div>
      );
  }

  return (
    <div className="container my-5">
      <div className="mx-auto" style={{ maxWidth: '800px' }}>
        <h2 className="text-center mb-4">Enviar Notificação para Aluno</h2>
        
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="card shadow-sm">
            <div className="card-header"><h5 className="mb-0">Conteúdo da Notificação</h5></div>
            <div className="card-body p-4">
              <div className="row g-4">
                
                <div className="col-12">
                  <label htmlFor="destinatario_matricula" className="form-label">Matrícula do Aluno (Destinatário)*</label>
                  <input
                    type="text"
                    id="destinatario_matricula"
                    name="destinatario_matricula"
                    className="form-control"
                    value={formData.destinatario_matricula}
                    onChange={handleChange}
                    placeholder="Digite a matrícula do aluno"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="col-12">
                  <label htmlFor="titulo" className="form-label">Título da Notificação*</label>
                  <input
                    type="text"
                    id="titulo"
                    name="titulo"
                    className="form-control"
                    value={formData.titulo}
                    onChange={handleChange}
                    placeholder="Ex: Pendência de Documentos"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="col-12">
                  <label htmlFor="mensagem" className="form-label">Mensagem*</label>
                  <textarea
                    id="mensagem"
                    name="mensagem"
                    className="form-control"
                    rows="5"
                    value={formData.mensagem}
                    onChange={handleChange}
                    placeholder="Escreva a mensagem detalhada para o aluno aqui."
                    required
                    disabled={loading}
                    style={{ resize: 'none' }}
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end mt-4">
            <button type="button" className="btn btn-secondary me-3" onClick={() => navigate(-1)} disabled={loading}>
                <FontAwesomeIcon icon={faTimes} className="me-2" /> Cancelar
            </button>
            <button type="submit" className="btn btn-primary px-4" disabled={loading}>
              {loading ? 
                <><FontAwesomeIcon icon={faSpinner} spin className="me-2" /> Enviando...</> : 
                <><FontAwesomeIcon icon={faPaperPlane} className="me-2" /> Enviar Notificação</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CadastrarNotificacaoPage;