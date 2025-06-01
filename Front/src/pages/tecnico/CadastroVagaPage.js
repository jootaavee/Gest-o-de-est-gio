// Exemplo: src/pages/CadastroVagaPage.js ou similar

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient'; // Verifique a baseURL deste arquivo!
import { useAuth } from '../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

const CadastroVagaPage = () => {
  const { id } = useParams(); // Para edição
  const navigate = useNavigate();
  const { isTecnico, loading: authLoading } = useAuth();

  const initialFormData = {
    titulo: '',
    descricao: '',
    empresa: '',
    localizacao: '',    // Será enviado como 'localizacao' para o backend
    remuneracao: '',    // Será enviado como 'remuneracao' para o backend
    carga_horaria: '',
    requisitos: '',
    beneficios: '',
    data_abertura: '',
    data_expiracao: '', // Será enviado como 'data_expiracao' para o backend
    ativa: true,
    curso_requerido: '',
    periodo_minimo: '',
    turno: '',
    imagem: '', // URL da imagem
    link_edital: '', // URL do edital
  };

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false); // Para o botão de submit
  const [pageLoading, setPageLoading] = useState(!!id); // Carregando dados da vaga para edição
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const isEditing = !!id;

  useEffect(() => {
    const fetchVagaParaEdicao = async () => {
      if (isEditing && isTecnico()) {
        setPageLoading(true);
        setError('');
        try {
          const response = await apiClient.get(`/vagas/${id}`); // Backend GET /vagas/:id
          const vagaData = response.data;
          // Mapeia os nomes do backend para o estado do formulário
          setFormData({
            titulo: vagaData.titulo || '',
            descricao: vagaData.descricao || '',
            empresa: vagaData.empresa || '',
            localizacao: vagaData.local || '', // Backend envia 'local', formulário usa 'localizacao'
            remuneracao: vagaData.bolsa || '', // Backend envia 'bolsa', formulário usa 'remuneracao'
            carga_horaria: vagaData.carga_horaria?.toString() || '',
            requisitos: vagaData.requisitos || '',
            beneficios: vagaData.beneficios || '',
            data_abertura: vagaData.data_abertura ? new Date(vagaData.data_abertura).toISOString().split('T')[0] : '',
            data_expiracao: vagaData.data_encerramento ? new Date(vagaData.data_encerramento).toISOString().split('T')[0] : '', // Backend envia 'data_encerramento'
            ativa: vagaData.ativa !== undefined ? vagaData.ativa : true,
            curso_requerido: vagaData.curso_requerido || '',
            periodo_minimo: vagaData.periodo_minimo?.toString() || '',
            turno: vagaData.turno || '',
            imagem: vagaData.imagem || '',
            link_edital: vagaData.link_edital || '',
          });
        } catch (err) {
          console.error('Erro ao buscar vaga para edição:', err.response ? err.response.data : err.message);
          setError('Não foi possível carregar os dados da vaga para edição. Verifique se a vaga existe.');
        } finally {
          setPageLoading(false);
        }
      } else if (!isEditing) {
         setPageLoading(false); // Se não está editando, não precisa carregar
      }
    };

    if (!authLoading) { // Executa apenas se o status de autenticação já foi determinado
      fetchVagaParaEdicao();
    }
  }, [id, isEditing, isTecnico, authLoading]); // Dependências do useEffect

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // Prepara os dados para enviar ao backend, usando os nomes que o backend espera no req.body
  const prepareDataToSend = (data) => {
    return {
      titulo: data.titulo,
      descricao: data.descricao,
      empresa: data.empresa,
      localizacao: data.localizacao, // Backend controller espera 'localizacao'
      remuneracao: data.remuneracao, // Backend controller espera 'remuneracao'
      carga_horaria: data.carga_horaria,
      requisitos: data.requisitos,
      beneficios: data.beneficios,
      data_abertura: data.data_abertura,
      data_expiracao: data.data_expiracao, // Backend controller espera 'data_expiracao'
      ativa: data.ativa,
      curso_requerido: data.curso_requerido,
      periodo_minimo: data.periodo_minimo,
      turno: data.turno,
      imagem: data.imagem,
      link_edital: data.link_edital,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validação dos campos obrigatórios no frontend
    if (
      !formData.titulo || !formData.descricao || !formData.empresa ||
      !formData.localizacao || !formData.carga_horaria ||
      !formData.data_abertura || !formData.data_expiracao
    ) {
      setError('Campos marcados com * (Título, Descrição, Empresa, Localização, Carga Horária, Datas) são obrigatórios.');
      return;
    }
    setLoading(true);
    const dataToSend = prepareDataToSend(formData);

    try {
      let response;
      if (isEditing) {
        response = await apiClient.put(`/vagas/${id}`, dataToSend); // PUT /api/vagas/:id
        setSuccess('Vaga atualizada com sucesso!');
      } else {
        response = await apiClient.post('/vagas', dataToSend); // POST /api/vagas (graças à baseURL do apiClient)
        setSuccess('Vaga cadastrada com sucesso!');
        setFormData(initialFormData); // Limpa o formulário após cadastro
      }
      // console.log('Resposta do servidor:', response.data);
      setTimeout(() => navigate('/admin/vagas'), 2000); // Redireciona após 2s
    } catch (err) {
      console.error(`Erro ao ${isEditing ? 'atualizar' : 'cadastrar'} vaga:`, err);
      // Tenta pegar a mensagem de erro do backend, ou uma genérica
      const serverError = err.response?.data?.error || err.response?.data?.message || `Erro ao ${isEditing ? 'atualizar' : 'cadastrar'} a vaga. Verifique os dados e tente novamente.`;
      setError(serverError);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || pageLoading) {
    return (
      <div className="container text-center my-5">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
        <p className="mt-2">Carregando...</p>
      </div>
    );
  }

  if (!isTecnico()) { // Verifica se o usuário é técnico após o authLoading
    return (
      <div className="container my-4">
        <div className="alert alert-danger" role="alert">
          Acesso não autorizado. Você precisa ser um técnico para acessar esta página.
        </div>
      </div>
    );
  }

  return (
    <div className="container my-4">
      <h2>{isEditing ? 'Editar Vaga' : 'Cadastrar Nova Vaga'}</h2>
      {error && <div className="alert alert-danger mt-3">{error}</div>}
      {success && <div className="alert alert-success mt-3">{success}</div>}
      
      <form onSubmit={handleSubmit} className="mt-3">
        {/* Título */}
        <div className="mb-3">
          <label htmlFor="titulo" className="form-label">Título da Vaga*</label>
          <input type="text" className="form-control" id="titulo" name="titulo" value={formData.titulo} onChange={handleChange} required disabled={loading} />
        </div>
        {/* Empresa */}
        <div className="mb-3">
          <label htmlFor="empresa" className="form-label">Nome da Empresa*</label>
          <input type="text" className="form-control" id="empresa" name="empresa" value={formData.empresa} onChange={handleChange} required disabled={loading} />
        </div>
        {/* Localização */}
        <div className="mb-3">
          <label htmlFor="localizacao" className="form-label">Localização*</label>
          <input type="text" className="form-control" id="localizacao" name="localizacao" value={formData.localizacao} onChange={handleChange} required disabled={loading} />
        </div>
        {/* Remuneração e Carga Horária */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="remuneracao" className="form-label">Remuneração (Bolsa)</label>
            <input type="text" className="form-control" id="remuneracao" name="remuneracao" value={formData.remuneracao} onChange={handleChange} disabled={loading} placeholder="Ex: 700,00 ou A Combinar" />
          </div>
          <div className="col-md-6">
            <label htmlFor="carga_horaria" className="form-label">Carga Horária Semanal*</label>
            <input type="number" className="form-control" id="carga_horaria" name="carga_horaria" value={formData.carga_horaria} onChange={handleChange} required disabled={loading} placeholder="Ex: 30" min="1" />
          </div>
        </div>
        {/* Descrição */}
        <div className="mb-3">
          <label htmlFor="descricao" className="form-label">Descrição Completa da Vaga*</label>
          <textarea className="form-control" id="descricao" name="descricao" rows="5" value={formData.descricao} onChange={handleChange} required disabled={loading}></textarea>
        </div>
        {/* Requisitos */}
        <div className="mb-3">
          <label htmlFor="requisitos" className="form-label">Requisitos</label>
          <textarea className="form-control" id="requisitos" name="requisitos" rows="3" value={formData.requisitos} onChange={handleChange} disabled={loading} placeholder="Liste os principais requisitos"></textarea>
        </div>
        {/* Benefícios */}
        <div className="mb-3">
          <label htmlFor="beneficios" className="form-label">Benefícios</label>
          <textarea className="form-control" id="beneficios" name="beneficios" rows="3" value={formData.beneficios} onChange={handleChange} disabled={loading} placeholder="Ex: Vale Transporte, Vale Refeição"></textarea>
        </div>
         {/* Curso Requerido */}
         <div className="mb-3">
            <label htmlFor="curso_requerido" className="form-label">Curso Requerido (Se aplicável)</label>
            <input type="text" className="form-control" id="curso_requerido" name="curso_requerido" value={formData.curso_requerido} onChange={handleChange} disabled={loading} placeholder="Ex: Ciência da Computação, Administração" />
        </div>
        {/* Período Mínimo e Turno */}
        <div className="row mb-3">
            <div className="col-md-6">
                <label htmlFor="periodo_minimo" className="form-label">Período Mínimo (Semestre)</label>
                <input type="number" className="form-control" id="periodo_minimo" name="periodo_minimo" value={formData.periodo_minimo} onChange={handleChange} disabled={loading} placeholder="Ex: 3" min="1" />
            </div>
            <div className="col-md-6">
                <label htmlFor="turno" className="form-label">Turno</label>
                <select className="form-select" id="turno" name="turno" value={formData.turno} onChange={handleChange} disabled={loading}>
                    <option value="">Selecione...</option>
                    <option value="Manhã">Manhã</option>
                    <option value="Tarde">Tarde</option>
                    <option value="Noite">Noite</option>
                    <option value="Integral">Integral</option>
                    <option value="Flexível">Flexível</option>
                    <option value="Comercial">Comercial</option>
                </select>
            </div>
        </div>
        {/* Link do Edital e Imagem (URL) */}
        <div className="mb-3">
            <label htmlFor="link_edital" className="form-label">Link do Edital (URL)</label>
            <input type="url" className="form-control" id="link_edital" name="link_edital" value={formData.link_edital} onChange={handleChange} disabled={loading} placeholder="https://exemplo.com/edital.pdf" />
        </div>
        <div className="mb-3">
            <label htmlFor="imagem" className="form-label">URL da Imagem da Vaga</label>
            <input type="url" className="form-control" id="imagem" name="imagem" value={formData.imagem} onChange={handleChange} disabled={loading} placeholder="https://exemplo.com/imagem.png" />
        </div>
        {/* Datas */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="data_abertura" className="form-label">Data de Abertura*</label>
            <input type="date" className="form-control" id="data_abertura" name="data_abertura" value={formData.data_abertura} onChange={handleChange} required disabled={loading} />
          </div>
          <div className="col-md-6">
            <label htmlFor="data_expiracao" className="form-label">Data de Expiração das Inscrições*</label>
            <input type="date" className="form-control" id="data_expiracao" name="data_expiracao" value={formData.data_expiracao} onChange={handleChange} required disabled={loading} />
          </div>
        </div>
        {/* Ativa */}
        <div className="row mb-3">
             <div className="col-md-12">
                <div className="form-check form-switch d-flex align-items-center">
                    <input className="form-check-input me-2" type="checkbox" role="switch" id="ativa" name="ativa" checked={formData.ativa} onChange={handleChange} disabled={loading} />
                    <label className="form-check-label" htmlFor="ativa">Vaga Ativa</label>
                </div>
            </div>
        </div>

        <div className="d-flex justify-content-end mt-4">
          <button type="button" className="btn btn-outline-secondary me-2" onClick={() => navigate('/admin/vagas')} disabled={loading}>
            <FontAwesomeIcon icon={faTimes} className="me-1" /> Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <><FontAwesomeIcon icon={faSpinner} spin className="me-1" /> Salvando...</> : <><FontAwesomeIcon icon={faSave} className="me-1" /> {isEditing ? 'Salvar Alterações' : 'Cadastrar Vaga'}</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CadastroVagaPage;