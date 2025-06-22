// frontend/src/pages/auth/RegisterPage.js (VERSÃO MELHORADA)

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { cursosDisponiveis } from '../../constants/cursos';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    nome_completo: '', email: '', senha: '', confirmar_senha: '', numero: '',
    curso: '', periodo: '', matricula: '', cpf: '', data_nascimento: ''
  });
  
  const { register, loading, error: authError } = useAuth(); 
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target; 
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccess('');
    
    if (formData.senha !== formData.confirmar_senha) {
      setLocalError('As senhas não conferem');
      return;
    }
    if (formData.senha.length < 6) {
       setLocalError('A senha deve ter pelo menos 6 caracteres');
       return;
    }
    if (Number(formData.periodo) > 10 || Number(formData.periodo) < 1) {
        setLocalError('O período deve ser entre 1 e 10.');
        return;
    }
    if (formData.curso === '') {
        setLocalError('Por favor, selecione um curso.');
        return;
    }

    // Convertendo período para número antes de enviar
    const dataToSend = { ...formData, periodo: Number(formData.periodo) };
    
    try {
      const response = await register(dataToSend);
      setSuccess(response.message || 'Cadastro realizado com sucesso! Você será redirecionado.');
      setFormData({
        nome_completo: '', email: '', senha: '', confirmar_senha: '', numero: '',
        curso: '', periodo: '', matricula: '', cpf: '', data_nascimento: ''
      });
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setLocalError(err.message || 'Erro ao realizar cadastro.');
      console.error("Erro no componente RegisterPage:", err);
    }
  };

  return (
    <div className="auth-container"> 
      <div className="auth-card">
        <h2 className="auth-title">Cadastro de Aluno</h2>
        {(localError || authError) && (<div className="alert alert-danger">{localError || authError}</div>)}
        {success && (<div className="alert alert-success">{success}</div>)}
        <form className="auth-form" onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label htmlFor="nome_completo">Nome Completo*</label>
            <input type="text" className="form-control" id="nome_completo" name="nome_completo" value={formData.nome_completo} onChange={handleChange} required disabled={loading} />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email*</label>
            <input type="email" className="form-control" id="email" name="email" value={formData.email} onChange={handleChange} required disabled={loading}/>
          </div>
          
          <div className="form-group">
            <label htmlFor="senha">Senha* (mínimo 6 caracteres)</label>
            <input type="password" className="form-control" id="senha" name="senha" value={formData.senha} onChange={handleChange} required minLength="6" disabled={loading} />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmar_senha">Confirmar Senha*</label>
            <input type="password" className="form-control" id="confirmar_senha" name="confirmar_senha" value={formData.confirmar_senha} onChange={handleChange} required disabled={loading} />
          </div>
          
          <div className="form-group">
            <label htmlFor="numero">Número de Telefone*</label>
            <input type="tel" className="form-control" id="numero" name="numero" value={formData.numero} onChange={handleChange} required placeholder="(00) 00000-0000" disabled={loading} maxLength="11" />
          </div>
          
          <div className="form-group">
            <label htmlFor="curso">Curso*</label>
            <select className="form-select" id="curso" name="curso" value={formData.curso} onChange={handleChange} required disabled={loading}>
                <option value="" disabled>Selecione um curso...</option>
                {cursosDisponiveis.map(curso => (
                    <option key={curso} value={curso}>{curso}</option>
                ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="periodo">Período*</label>
            <input type="number" className="form-control" id="periodo" name="periodo" value={formData.periodo} onChange={handleChange} required min="1" max="10" disabled={loading} />
          </div>
          
          <div className="form-group">
            <label htmlFor="matricula">Matrícula*</label>
            <input type="text" className="form-control" id="matricula" name="matricula" value={formData.matricula} onChange={handleChange} required disabled={loading}/>
          </div>
          
          <div className="form-group">
            <label htmlFor="cpf">CPF*</label>
            <input type="text" className="form-control" id="cpf" name="cpf" value={formData.cpf} onChange={handleChange} required placeholder="000.000.000-00" disabled={loading} maxLength="11" />
          </div>
          
          <div className="form-group">
            <label htmlFor="data_nascimento">Data de Nascimento*</label>
            <input type="date" className="form-control" id="data_nascimento" name="data_nascimento" value={formData.data_nascimento} onChange={handleChange} required disabled={loading} />
          </div>
          
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>
        <div className="auth-footer">
          <p>Já tem uma conta? <Link to="/login">Faça login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;