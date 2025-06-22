import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faPaperPlane, faTimes, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { cursosDisponiveis } from '../../constants/cursos'; // IMPORTA A LISTA CENTRALIZADA

const CadastrarNotificacaoPage = () => {
  const navigate = useNavigate();
  const { isTecnico, loading: authLoading } = useAuth();
  
  const initialState = { tipo_destinatario: 'MATRICULA', valor_destinatario: '', titulo: '', mensagem: '' };

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

    if (!formData.titulo || !formData.mensagem) {
      setError('Título e Mensagem são obrigatórios.');
      return;
    }
    if (formData.tipo_destinatario !== 'TODOS' && !formData.valor_destinatario) {
      setError('Por favor, preencha o valor do destinatário (Curso ou Matrícula).');
      return;
    }
    setLoading(true);

    try {
      await apiClient.post('/notificacoes/enviar', formData);
      setSuccess('Notificação(ões) enviada(s) com sucesso!');
      setFormData(initialState); 

      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      const serverError = err.response?.data?.error || 'Erro ao enviar notificação.';
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
        <div className="container my-5"><div className="alert alert-danger text-center"><FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />Acesso não autorizado para esta funcionalidade.</div></div>
      );
  }

  return (
    <div className="container my-5">
      <div className="mx-auto" style={{ maxWidth: '800px' }}>
        <h2 className="text-center mb-4">Enviar Notificação para Alunos</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="card shadow-sm">
            <div className="card-header"><h5 className="mb-0">Destinatário</h5></div>
            <div className="card-body p-4">
              <label className="form-label">Tipo de Envio*</label>
              <div className="btn-group w-100 mb-3">
                  <input type="radio" className="btn-check" name="tipo_destinatario" id="radioMatricula" value="MATRICULA" checked={formData.tipo_destinatario === 'MATRICULA'} onChange={handleChange} />
                  <label className="btn btn-outline-primary" htmlFor="radioMatricula">Matrícula Específica</label>
                  <input type="radio" className="btn-check" name="tipo_destinatario" id="radioCurso" value="CURSO" checked={formData.tipo_destinatario === 'CURSO'} onChange={handleChange} />
                  <label className="btn btn-outline-primary" htmlFor="radioCurso">Por Curso</label>
                  <input type="radio" className="btn-check" name="tipo_destinatario" id="radioTodos" value="TODOS" checked={formData.tipo_destinatario === 'TODOS'} onChange={handleChange} />
                  <label className="btn btn-outline-primary" htmlFor="radioTodos">Todos os Alunos</label>
              </div>

              {formData.tipo_destinatario === 'MATRICULA' && (
                  <div>
                    <label htmlFor="valor_destinatario" className="form-label">Matrícula do Aluno*</label>
                    <input type="text" id="valor_destinatario" name="valor_destinatario" className="form-control" value={formData.valor_destinatario} onChange={handleChange} placeholder="Digite a matrícula" required />
                  </div>
              )}
              {formData.tipo_destinatario === 'CURSO' && (
                  <div>
                    <label htmlFor="valor_destinatario" className="form-label">Curso*</label>
                    {/* ESTE DROPDOWN AGORA USARÁ A LISTA COMPLETA */}
                    <select id="valor_destinatario" name="valor_destinatario" className="form-select" value={formData.valor_destinatario} onChange={handleChange} required>
                        <option value="" disabled>Selecione o curso</option>
                        {cursosDisponiveis.map(curso => <option key={curso} value={curso}>{curso}</option>)}
                    </select>
                  </div>
              )}
              {formData.tipo_destinatario === 'TODOS' && (
                <div className="alert alert-info small p-2">A notificação será enviada para todos os alunos cadastrados no sistema.</div>
              )}
            </div>
          </div>
          <div className="card shadow-sm mt-4">
            <div className="card-header"><h5 className="mb-0">Conteúdo da Notificação</h5></div>
            <div className="card-body p-4">
                <div className="mb-3">
                  <label htmlFor="titulo" className="form-label">Título*</label>
                  <input type="text" id="titulo" name="titulo" className="form-control" value={formData.titulo} onChange={handleChange} required />
                </div>
                <div>
                  <label htmlFor="mensagem" className="form-label">Mensagem*</label>
                  <textarea id="mensagem" name="mensagem" className="form-control" rows="5" value={formData.mensagem} onChange={handleChange} required></textarea>
                </div>
            </div>
          </div>
          <div className="d-flex justify-content-end mt-4">
            <button type="button" className="btn btn-secondary me-3" onClick={() => navigate(-1)} disabled={loading}><FontAwesomeIcon icon={faTimes} className="me-2"/>Cancelar</button>
            <button type="submit" className="btn btn-primary px-4" disabled={loading}>{loading ? <><FontAwesomeIcon icon={faSpinner} spin /> Enviando...</> : <><FontAwesomeIcon icon={faPaperPlane}/> Enviar</>}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CadastrarNotificacaoPage;