// frontend/src/pages/aluno/EditarPerfilPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient'; // Ajuste o caminho
import { useAuth } from '../../contexts/AuthContext'; // Ajuste o caminho
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faSave, faTimes, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const EditarPerfilPage = () => {
  const { user, setUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false); // Para o botão de submit
  const [errorMessage, setError] = useState('');
  const [successMessage, setSuccess] = useState('');
  
  const initialFormState = {
    nome_completo: '',
    email: '',         // Não editável, apenas exibição
    numero: '',        // Editável
    curso: '',         // Editável
    periodo: '',       // Editável
    matricula: '',     // Não editável, apenas exibição
    cpf: '',           // Não editável, apenas exibição
    data_nascimento: '' // Editável
  };
  const [formData, setFormData] = useState(initialFormState);

  // Preenche o formulário com os dados do usuário atual
  useEffect(() => {
    if (!authLoading && user) {
      setFormData({
        nome_completo: user.nome_completo || '',
        email: user.email || '',
        numero: user.numero || '',
        curso: user.curso || '',
        periodo: user.periodo?.toString() || '', // Converte para string se for número
        matricula: user.matricula || '',
        cpf: user.cpf || '',
        data_nascimento: user.data_nascimento // Formato YYYY-MM-DD já deve vir do formatUserData do backend
                        // ou if (user.data_nascimento) {
                        //      const date = new Date(user.data_nascimento);
                        //      // Ajuste para o fuso horário local antes de formatar para input date
                        //      const offset = date.getTimezoneOffset() * 60000;
                        //      const localDate = new Date(date.getTime() - offset);
                        //      setFormData(prev => ({ ...prev, data_nascimento: localDate.toISOString().split('T')[0] }));
                        // } else { '' }
      });
    } else if (!authLoading && !user) {
        setError("Sessão expirada ou usuário não encontrado. Por favor, faça login novamente.");
        // Opcional: redirecionar para login após um tempo ou ao clicar em OK
        // setTimeout(() => navigate('/login'), 3000);
    }
  }, [user, authLoading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Limpa erros ao digitar
    setSuccess(''); // Limpa sucesso
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Apenas os campos que podem ser atualizados pelo aluno
    // Campos como email, cpf, matricula geralmente não são alterados pelo próprio usuário
    const dataParaEnviar = {
      nome_completo: formData.nome_completo,
      numero: formData.numero,
      data_nascimento: formData.data_nascimento, // Backend espera new Date(data_nascimento)
      // Campos específicos do aluno (se permitido editar)
      curso: formData.curso,
      periodo: formData.periodo ? parseInt(formData.periodo, 10) : null,
      // foto_perfil: se houver upload, será tratado diferente
      // senha: se a atualização de senha for feita aqui, adicione lógica
    };

    try {
      // A rota no backend é PUT /api/users/profile ou /api/usuarios/profile
      const response = await apiClient.put('/users/profile', dataParaEnviar); 

      console.log("FRONTEND - Resposta da API ao atualizar perfil (Aluno):", JSON.stringify(response.data, null, 2)); // DEBUG

      if (response.data && response.data.user && response.data.user.tipo) { // Verifica se 'user' e 'user.tipo' existem
        // ** CORREÇÃO PRINCIPAL AQUI **
        setUser(response.data.user); 
        localStorage.setItem('user', JSON.stringify(response.data.user)); 
        
        setSuccess(response.data.message || 'Perfil atualizado com sucesso!');
        // Limpar mensagem de sucesso após alguns segundos
        setTimeout(() => setSuccess(''), 4000);
      } else {
        console.error("FRONTEND - Resposta da API inesperada (sem user ou user.tipo):", response.data);
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
        <div className="container d-flex justify-content-center align-items-center" style={{minHeight: '80vh'}}>
            <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary"/>
        </div>
    );
  }

  if (!user) { // Se não estiver autenticado (user é null após authLoading ser false)
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
    <div className="container my-4">
      <h2 className="mb-4">Editar Meu Perfil</h2>

      {errorMessage && <div className="alert alert-danger animate__animated animate__fadeIn">{errorMessage}</div>}
      {successMessage && <div className="alert alert-success animate__animated animate__fadeIn">{successMessage}</div>}

      <form onSubmit={handleSubmit}>
        <div className="card shadow-sm">
            <div className="card-header">
                Informações Pessoais
            </div>
            <div className="card-body">
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label htmlFor="nome_completo" className="form-label">Nome Completo*</label>
                        <input type="text" className="form-control" id="nome_completo" name="nome_completo"
                            value={formData.nome_completo} onChange={handleChange} required disabled={loading} />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label htmlFor="email" className="form-label">Email (Não editável)</label>
                        <input type="email" className="form-control" id="email" name="email"
                            value={formData.email} readOnly disabled />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label htmlFor="numero" className="form-label">Número de Telefone</label>
                        <input type="tel" className="form-control" id="numero" name="numero"
                            value={formData.numero} onChange={handleChange} placeholder="(00) 00000-0000" disabled={loading} />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label htmlFor="data_nascimento" className="form-label">Data de Nascimento</label>
                        <input type="date" className="form-control" id="data_nascimento" name="data_nascimento"
                            value={formData.data_nascimento} onChange={handleChange} disabled={loading} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label htmlFor="cpf" className="form-label">CPF (Não editável)</label>
                        <input type="text" className="form-control" id="cpf" name="cpf"
                            value={formData.cpf} readOnly disabled />
                    </div>
                </div>
            </div>
        </div>

        {user.tipo === 'ALUNO' && (
            <div className="card shadow-sm mt-4">
                <div className="card-header">
                    Informações Acadêmicas (Aluno)
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6 mb-3">
                        <label htmlFor="curso" className="form-label">Curso</label>
                        <input type="text" className="form-control" id="curso" name="curso"
                            value={formData.curso} onChange={handleChange} disabled={loading} />
                        </div>
                        <div className="col-md-6 mb-3">
                        <label htmlFor="periodo" className="form-label">Período</label>
                        <input type="number" className="form-control" id="periodo" name="periodo"
                            value={formData.periodo} onChange={handleChange} min="1" disabled={loading} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                        <label htmlFor="matricula" className="form-label">Matrícula (Não editável)</label>
                        <input type="text" className="form-control" id="matricula" name="matricula"
                            value={formData.matricula} readOnly disabled />
                        </div>
                    </div>
                </div>
            </div>
        )}
        
        {/* Adicionar seção para mudar senha aqui, se desejar */}

        <div className="mt-4 d-flex justify-content-end">
          <button type="button" className="btn btn-outline-secondary me-2"
            onClick={() => navigate(-1)} disabled={loading}>
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

export default EditarPerfilPage;