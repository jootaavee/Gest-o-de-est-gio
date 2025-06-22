// src/pages/CadastroVagaPage.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faSave, faTimes, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const CadastroVagaPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isTecnico, loading: authLoading } = useAuth();

  const initialFormData = {
    titulo: '',
    descricao: '',
    empresa: '',
    localizacao: '',
    remuneracao: '',
    carga_horaria: '',
    requisitos: '',
    beneficios: '',
    data_abertura: '',
    data_expiracao: '',
    ativa: true,
    curso_requerido: '',
    periodo_minimo: '',
    turno: '',
    imagem: '',
    link_edital: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(!!id);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const isEditing = !!id;

  useEffect(() => {
    const fetchVagaParaEdicao = async () => {
      if (isEditing && isTecnico()) {
        setPageLoading(true);
        setError('');
        try {
          const response = await apiClient.get(`/vagas/${id}`);
          const vagaData = response.data;
          setFormData({
            titulo: vagaData.titulo || '',
            descricao: vagaData.descricao || '',
            empresa: vagaData.empresa || '',
            localizacao: vagaData.local || '',
            remuneracao: vagaData.bolsa || '',
            carga_horaria: vagaData.carga_horaria?.toString() || '',
            requisitos: vagaData.requisitos || '',
            beneficios: vagaData.beneficios || '',
            data_abertura: vagaData.data_abertura ? new Date(vagaData.data_abertura).toISOString().split('T')[0] : '',
            data_expiracao: vagaData.data_encerramento ? new Date(vagaData.data_encerramento).toISOString().split('T')[0] : '',
            ativa: vagaData.ativa !== undefined ? vagaData.ativa : true,
            curso_requerido: vagaData.curso_requerido || '',
            periodo_minimo: vagaData.periodo_minimo?.toString() || '',
            turno: vagaData.turno || '',
            imagem: vagaData.imagem || '',
            link_edital: vagaData.link_edital || '',
          });
        } catch (err) {
          console.error('Erro ao buscar vaga para edição:', err.response ? err.response.data : err.message);
          setError('Não foi possível carregar os dados da vaga para edição.');
        } finally {
          setPageLoading(false);
        }
      } else {
         setPageLoading(false);
      }
    };

    if (!authLoading) {
      fetchVagaParaEdicao();
    }
  }, [id, isEditing, isTecnico, authLoading]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.titulo || !formData.descricao || !formData.empresa || !formData.localizacao || !formData.carga_horaria || !formData.data_abertura || !formData.data_expiracao) {
      setError('Campos marcados com * são obrigatórios.');
      return;
    }
    setLoading(true);

    try {
      if (isEditing) {
        await apiClient.put(`/vagas/${id}`, formData);
        setSuccess('Vaga atualizada com sucesso!');
      } else {
        await apiClient.post('/vagas', formData);
        setSuccess('Vaga cadastrada com sucesso!');
        setFormData(initialFormData);
      }
      setTimeout(() => navigate('/admin/vagas'), 2000);
    } catch (err) {
      const serverError = err.response?.data?.error || err.response?.data?.message || `Erro ao processar a solicitação.`;
      setError(serverError);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || pageLoading) {
    return (
      <div className="container d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary"/>
        <p className="mt-3">Carregando dados da vaga...</p>
      </div>
    );
  }

  if (!isTecnico()) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger text-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          Acesso não autorizado.
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="mx-auto" style={{ maxWidth: '900px' }}>
        <h2 className="text-center mb-4">{isEditing ? 'Editar Vaga' : 'Cadastrar Nova Vaga'}</h2>
        {error && <div className="alert alert-danger mt-3">{error}</div>}
        {success && <div className="alert alert-success mt-3">{success}</div>}
        
        <form onSubmit={handleSubmit} className="mt-4">
          
          <div className="card shadow-sm mb-4">
            <div className="card-header"><h5 className="mb-0">Informações Principais</h5></div>
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-12">
                  <label htmlFor="titulo" className="form-label">Título da Vaga*</label>
                  <input type="text" className="form-control" id="titulo" name="titulo" value={formData.titulo} onChange={handleChange} required disabled={loading} />
                </div>
                <div className="col-12">
                  <label htmlFor="empresa" className="form-label">Nome da Empresa*</label>
                  <input type="text" className="form-control" id="empresa" name="empresa" value={formData.empresa} onChange={handleChange} required disabled={loading} />
                </div>
                <div className="col-12">
                  <label htmlFor="descricao" className="form-label">Descrição Completa da Vaga*</label>
                  <textarea className="form-control" id="descricao" name="descricao" rows="5" value={formData.descricao} onChange={handleChange} required disabled={loading} style={{ resize: 'none' }}></textarea>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card shadow-sm mb-4">
            <div className="card-header"><h5 className="mb-0">Detalhes e Requisitos</h5></div>
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="localizacao" className="form-label">Localização*</label>
                  <input type="text" className="form-control" id="localizacao" name="localizacao" value={formData.localizacao} onChange={handleChange} required disabled={loading} />
                </div>
                <div className="col-md-6">
                  <label htmlFor="carga_horaria" className="form-label">Carga Horária Semanal*</label>
                  <input type="number" className="form-control" id="carga_horaria" name="carga_horaria" value={formData.carga_horaria} onChange={handleChange} required disabled={loading} placeholder="Ex: 30" min="1" />
                </div>
                <div className="col-md-6">
                  <label htmlFor="remuneracao" className="form-label">Remuneração (Bolsa)</label>
                  <input type="text" className="form-control" id="remuneracao" name="remuneracao" value={formData.remuneracao} onChange={handleChange} disabled={loading} placeholder="Ex: 700,00 ou A Combinar" />
                </div>
                <div className="col-12">
                  <label htmlFor="requisitos" className="form-label">Requisitos</label>
                  <textarea className="form-control" id="requisitos" name="requisitos" rows="3" value={formData.requisitos} onChange={handleChange} disabled={loading} placeholder="Liste os principais requisitos" style={{ resize: 'none' }}></textarea>
                </div>
                <div className="col-12">
                  <label htmlFor="beneficios" className="form-label">Benefícios</label>
                  <textarea className="form-control" id="beneficios" name="beneficios" rows="3" value={formData.beneficios} onChange={handleChange} disabled={loading} placeholder="Ex: Vale Transporte, Vale Refeição" style={{ resize: 'none' }}></textarea>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card shadow-sm mb-4">
            <div className="card-header"><h5 className="mb-0">Critérios Acadêmicos e Turno</h5></div>
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="curso_requerido" className="form-label">Curso Requerido</label>
                  <input type="text" className="form-control" id="curso_requerido" name="curso_requerido" value={formData.curso_requerido} onChange={handleChange} disabled={loading} placeholder="Ex: Ciência da Computação" />
                </div>
                <div className="col-md-3">
                  <label htmlFor="periodo_minimo" className="form-label">Período Mínimo</label>
                  <input type="number" className="form-control" id="periodo_minimo" name="periodo_minimo" value={formData.periodo_minimo} onChange={handleChange} disabled={loading} placeholder="Ex: 3" min="1" />
                </div>
                <div className="col-md-3">
                  <label htmlFor="turno" className="form-label">Turno</label>
                  <select className="form-select" id="turno" name="turno" value={formData.turno} onChange={handleChange} disabled={loading}>
                    <option value="">Selecione...</option>
                    <option value="Manhã">Manhã</option>
                    <option value="Tarde">Tarde</option>
                    <option value="Noite">Noite</option>
                    <option value="Integral">Integral</option>
                    <option value="Flexível">Flexível</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card shadow-sm mb-4">
            <div className="card-header"><h5 className="mb-0">Prazos, Mídia e Status</h5></div>
            <div className="card-body p-4">
              <div className="row g-3 align-items-center">
                <div className="col-md-6">
                  <label htmlFor="data_abertura" className="form-label">Data de Abertura*</label>
                  <input type="date" className="form-control" id="data_abertura" name="data_abertura" value={formData.data_abertura} onChange={handleChange} required disabled={loading} />
                </div>
                <div className="col-md-6">
                  <label htmlFor="data_expiracao" className="form-label">Data de Expiração*</label>
                  <input type="date" className="form-control" id="data_expiracao" name="data_expiracao" value={formData.data_expiracao} onChange={handleChange} required disabled={loading} />
                </div>
                <div className="col-md-6">
                  <label htmlFor="link_edital" className="form-label">Link do Edital (URL)</label>
                  <input type="url" className="form-control" id="link_edital" name="link_edital" value={formData.link_edital} onChange={handleChange} disabled={loading} placeholder="https://exemplo.com/edital.pdf" />
                </div>
                <div className="col-md-6">
                  <label htmlFor="imagem" className="form-label">URL da Imagem</label>
                  <input type="url" className="form-control" id="imagem" name="imagem" value={formData.imagem} onChange={handleChange} disabled={loading} placeholder="https://exemplo.com/imagem.png" />
                </div>
                <div className="col-12 mt-4">
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" role="switch" id="ativa" name="ativa" checked={formData.ativa} onChange={handleChange} disabled={loading} />
                    <label className="form-check-label" htmlFor="ativa">Vaga Ativa (visível para os alunos)</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <div className="d-flex justify-content-end mt-4">
            <button type="button" className="btn btn-secondary me-3" onClick={() => navigate('/admin/vagas')} disabled={loading}>
              <FontAwesomeIcon icon={faTimes} className="me-2" /> Cancelar
            </button>
            <button type="submit" className="btn btn-primary px-4" disabled={loading}>
              {loading ? <><FontAwesomeIcon icon={faSpinner} spin className="me-2" /> Salvando...</> : <><FontAwesomeIcon icon={faSave} className="me-2" /> {isEditing ? 'Salvar Alterações' : 'Cadastrar Vaga'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CadastroVagaPage;