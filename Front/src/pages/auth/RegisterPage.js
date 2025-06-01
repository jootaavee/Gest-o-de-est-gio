import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    senha: '',
    confirmar_senha: '',
    numero: '',
    curso: '',
    periodo: 0,
    matricula: '',
    cpf: '',
    data_nascimento: ''
  });
  
  // Usar loading e error do AuthContext
  const { register, loading, error: authError } = useAuth(); 
  const [localError, setLocalError] = useState(''); // Erro específico da página
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target; 
    if(name ==="periodo")
      setFormData(prev => ({ ...prev, [name]: Number(value)}));
    else
      setFormData(prev => ({ ...prev, [name]: value }));
    
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccess('');
    
    // Validação básica
    if (formData.senha !== formData.confirmar_senha) {
      setLocalError('As senhas não conferem');
      return;
    }

    if (formData.senha.length < 6) {
       setLocalError('A senha deve ter pelo menos 6 caracteres');
       return;
    }
    

    // O setLoading(true) é tratado dentro da função register do AuthContext
    try {
      const response = await register(formData); // Chama a função de registro real
      setSuccess(response.message || 'Cadastro realizado com sucesso! Você será redirecionado para o login.');
      // Limpar formulário após sucesso
      setFormData({
        nome_completo: '',
        email: '',
        senha: '',
        confirmar_senha: '',
        numero: '',
        curso: '',
        periodo: 0,
        matricula: '',
        cpf: '',
        data_nascimento: ''
      });
      setTimeout(() => {
        navigate('/login'); // Redireciona para login após sucesso
      }, 3000); // Delay para mostrar mensagem de sucesso
    } catch (err) {
      // Usa o erro vindo do AuthContext ou a mensagem do erro capturado
      setLocalError(err.message || 'Erro ao realizar cadastro. Verifique os dados informados.');
      console.error("Erro no componente RegisterPage:", err);
    }
    // O setLoading(false) é tratado dentro da função register do AuthContext
  };

  return (
    // Manter a estrutura JSX do formulário, apenas ajustando o feedback de erro/sucesso/loading
    <div className="auth-container"> 
      <div className="auth-card">
        <div className="auth-logo">
          {/* <img src="..src\img\LogoGE.png" alt="GE UERN" /> */}
        </div>
        <h2 className="auth-title">Cadastro de Aluno</h2>
        
        {/* Exibe erro local ou do contexto */}
        {(localError || authError) && (
          <div className="alert alert-danger" role="alert">
            {localError || authError}
          </div>
        )}
        
        {success && (
          <div className="alert alert-success" role="alert">
            {success}
          </div>
        )}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Manter todos os campos do formulário como estavam */}
          <div className="form-group">
            <label htmlFor="nome_completo">Nome Completo*</label>
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
          
          <div className="form-group">
            <label htmlFor="email">Email*</label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="senha">Senha* (mínimo 6 caracteres)</label>
            <input
              type="password"
              className="form-control"
              id="senha"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              required
              minLength="6"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmar_senha">Confirmar Senha*</label>
            <input
              type="password"
              className="form-control"
              id="confirmar_senha"
              name="confirmar_senha"
              value={formData.confirmar_senha}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="numero">Número de Telefone*</label>
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
          
          <div className="form-group">
            <label htmlFor="curso">Curso*</label>
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
          
          <div className="form-group">
            <label htmlFor="periodo">Período*</label>
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
          
          <div className="form-group">
            <label htmlFor="matricula">Matrícula*</label>
            <input
              type="text"
              className="form-control"
              id="matricula"
              name="matricula"
              value={formData.matricula}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="cpf">CPF*</label>
            <input
              type="text"
              className="form-control"
              id="cpf"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              required
              placeholder="000.000.000-00"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="data_nascimento">Data de Nascimento*</label>
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
          
          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading} // Usa o loading do AuthContext
          >
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

