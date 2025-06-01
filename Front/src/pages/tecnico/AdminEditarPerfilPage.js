import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient'; // Importar o cliente API
import { useAuth } from '../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

// Este componente é muito similar ao EditarPerfilPage do aluno
// A diferença principal pode ser o layout ou campos específicos do técnico
const AdminEditarPerfilPage = () => {
  const { user, setUser, loading: authLoading, isTecnico } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '', // Email geralmente não é editável
    numero: '',
    // Adicionar campos específicos do técnico se houver (ex: departamento, cargo)
    // departamento: '', 
    // cargo: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Preenche o formulário com os dados do usuário atual
  useEffect(() => {
    console.log('EditarPerfilPage - useEffect executado. User:', user); // LOG B
    if (user) {
      console.log('EditarPerfilPage - useEffect: User existe. Preenchendo formData.'); // LOG C
      setFormData({
        nome_completo: user.nome_completo || '',
        email: user.email || '',
        numero: user.numero || '',
      });
    } else {
      console.log('EditarPerfilPage - useEffect: User NÃO existe. Não preenchendo formData.'); // LOG D
    }
  }, [user, isTecnico]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Prepara os dados para enviar (exclui campos não editáveis como email)
    const { email, ...dataToUpdate } = formData;

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
    console.log('AdminEditarPerfilPage - User NÃO existe (e AuthLoading é false), mostrando aviso de login.'); // LOG F
    return (
      <div className="container">
        <div className="alert alert-warning" role="alert">
          Você precisa estar logado para editar seu perfil.
        </div>
      </div>
    );
  };

  if (!isTecnico()) {
    return (
      <div className="container">
        <div className="alert alert-danger" role="alert">
          Acesso não autorizado.
        </div>
      </div>
    );
  }

  return (
    <div className="container my-4">
      <h2>Editar Perfil - Técnico</h2>

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

        {/* Adicionar campos específicos do técnico aqui, se houver */}
        {/* Exemplo:
        <div className="mb-3">
          <label htmlFor="departamento" className="form-label">Departamento</label>
          <input type="text" className="form-control" id="departamento" name="departamento" value={formData.departamento} onChange={handleChange} disabled={loading} />
        </div>
        */}

        {/* Campos Não Editáveis (Apenas Exibição) */}
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={formData.email}
            readOnly
            disabled
          />
        </div>

        <div className="d-flex justify-content-end">
          <button
            type="button"
            className="btn btn-secondary me-2"
            onClick={() => navigate('/admin')} // Volta para a home do admin
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

export default AdminEditarPerfilPage;

