import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

const EditarPerfilPage = () => {
  const { user, setUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Definição dos estados
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Inicialização do estado do formulário com valores vazios
  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    numero: '',
    curso: '',
    periodo: '',
    matricula: '',
    cpf: '',
    data_nascimento: ''
  });

  console.log('EditarPerfilPage - Renderizando. AuthLoading:', authLoading, 'User:', user);

  // Preenche o formulário com os dados do usuário atual quando o usuário é carregado
  useEffect(() => {
    console.log('EditarPerfilPage - useEffect executado. User:', user); // LOG B
    if (user) {
      console.log('EditarPerfilPage - useEffect: User existe. Preenchendo formData.'); // LOG C
      setFormData({
        nome_completo: user.nome_completo || '',
        email: user.email || '',
        numero: user.numero || '',
        curso: user.curso || '',
        periodo: user.periodo || '',
        matricula: user.matricula || '',
        cpf: user.cpf || '',
        data_nascimento: user.data_nascimento ? new Date(user.data_nascimento).toISOString().split('T')[0] : ''
      });
    } else {
      console.log('EditarPerfilPage - useEffect: User NÃO existe. Não preenchendo formData.'); // LOG D
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const { email, matricula, cpf, ...dataToUpdate } = formData;

    try {
      const response = await apiClient.put('/users/profile', dataToUpdate);
      setUser(response.data); 
      localStorage.setItem('user', JSON.stringify(response.data)); 
      setSuccess('Perfil atualizado com sucesso!');
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.error || 'Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    console.log('EditarPerfilPage - AuthLoading é true, mostrando spinner.'); // LOG E
    return <div className="container text-center my-5"><FontAwesomeIcon icon={faSpinner} spin size="3x" /></div>;
  }

  if (!user) {
    console.log('EditarPerfilPage - User NÃO existe (e AuthLoading é false), mostrando aviso de login.'); // LOG F
     return (
        <div className="container">
            <div className="alert alert-warning" role="alert">
                Você precisa estar logado para editar seu perfil.
            </div>
        </div>
     );
  }

  console.log('EditarPerfilPage - Renderizando formulário com formData:', formData);

  return (
    <div className="container my-4">
      <h2>Editar Perfil</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        {/* Campos Editáveis */}
        <div className="mb-3">
          <label htmlFor="nome_completo" className="form-label">Nome Completo*</label>
          <input
            type="text"
            className="form-control"
            id="nome_completo"
            name="nome_completo"
            value={formData.nome_completo}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="numero" className="form-label">Número de Telefone*</label>
          <input
            type="tel"
            className="form-control"
            id="numero"
            name="numero"
            value={formData.numero}
            onChange={handleChange}
            required
            placeholder="(00) 00000-0000"
            disabled={loading}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="curso" className="form-label">Curso*</label>
          <input
            type="text"
            className="form-control"
            id="curso"
            name="curso"
            value={formData.curso}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="periodo" className="form-label">Período*</label>
          <input
            type="number"
            className="form-control"
            id="periodo"
            name="periodo"
            value={formData.periodo}
            onChange={handleChange}
            required
            min="1"
            disabled={loading}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="data_nascimento" className="form-label">Data de Nascimento*</label>
          <input
            type="date"
            className="form-control"
            id="data_nascimento"
            name="data_nascimento"
            value={formData.data_nascimento}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        {/* Campos Não Editáveis (Apenas Exibição) */}
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={formData.email}
            readOnly // Torna não editável
            disabled // Aparência de desabilitado
          />
        </div>

        <div className="mb-3">
          <label htmlFor="matricula" className="form-label">Matrícula</label>
          <input
            type="text"
            className="form-control"
            id="matricula"
            name="matricula"
            value={formData.matricula}
            readOnly
            disabled
          />
        </div>

        <div className="mb-3">
          <label htmlFor="cpf" className="form-label">CPF</label>
          <input
            type="text"
            className="form-control"
            id="cpf"
            name="cpf"
            value={formData.cpf}
            readOnly
            disabled
          />
        </div>

        <div className="d-flex justify-content-end">
          <button 
            type="button" 
            className="btn btn-secondary me-2"
            onClick={() => navigate(-1)} // Volta para a página anterior
            disabled={loading}
          >
             <FontAwesomeIcon icon={faTimes} className="me-1" />
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
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

export default EditarPerfilPage;
