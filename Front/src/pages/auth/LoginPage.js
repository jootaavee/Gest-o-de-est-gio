import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext, { useAuth } from '../../contexts/AuthContext';
import './LoginPage.css';
// import logoPath from '../../Assets/LogoGE.png' // Ajustar caminho se necessário ou remover se não usado

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  // Usar o loading e error do AuthContext para refletir o estado real da chamada API
  const { login, loading, error: authError } = useAuth(AuthContext); 
  const [localError, setLocalError] = useState(''); // Erro específico da página, se necessário
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(''); // Limpa erro local
    
    try {
      const user = await login(email, senha); // Chama a função de login real do contexto
      // Redirecionar com base no tipo de usuário (role vindo da API)
      if (user.tipo === 'TECNICO') {
        navigate('/admin'); // Rota para admin/tecnico
      } else if (user.tipo === 'ALUNO') {
        navigate('/'); // Rota para aluno
      } else {
        // Caso inesperado, talvez redirecionar para uma página padrão ou mostrar erro
        navigate('/'); 
      }
    } catch (err) {
      // O erro já é tratado e armazenado no AuthContext (authError)
      // Podemos usar um erro local se quisermos mensagens mais específicas aqui
      setLocalError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
      console.error("Erro no componente LoginPage:", err); 
    }
    // O setLoading(false) é tratado dentro da função login do AuthContext
  };

   return (
    <div className="login-container-split">
      <div className="login-info-column">
        <div> 
          <h1>Sistema de Gerenciamento de Estágio</h1>
          <h2>Acompanhe tudo o que acontece com o seu Estágio! </h2>
          <p>
            Visualize em uma linha do tempo todos os eventos e
            atualizações relacionadas ao seu estágio, incluindo
            registros de envio de documentos, aprovações pela
            coordenação, avaliações do supervisor e andamento
            do plano de atividades. Fique por dentro de cada
            etapa do processo, desde a solicitação até a
            conclusão do estágio.
          </p>
        </div>
        <div className="login-info-footer">
          © 2025 | Desenvolvido por ACK/JR
        </div>
      </div>

      <div className="login-form-column">
        <div className="login-form-wrapper">
          <div className="login-logo">
            {/* <img src={logoPath} alt="GE UERN Logo" /> */}
            {/* Ajustar ou remover imagem do logo */}
          </div>
          <h2>Login</h2>

          {/* Exibe o erro vindo do AuthContext ou erro local */}
          {(authError || localError) && (
            <div className="alert alert-danger" role="alert">
              {localError || authError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Entre com seu email"
                disabled={loading} // Desabilita enquanto carrega
              />
            </div>
            <div className="form-group">
              <label htmlFor="senha">Senha</label>
              <input
                type="password"
                className="form-control"
                id="senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                placeholder="Entre com sua senha"
                disabled={loading} // Desabilita enquanto carrega
              />
            </div>

            <div className="login-options">
              {/* Funcionalidade "Mantenha-me conectado" não implementada */}
              {/* <div>
                <input type="checkbox" id="rememberMe" />
                <label htmlFor="rememberMe" style={{ marginLeft: '5px' }}> Mantenha-me conectado.</label>
              </div> */}
              {/* Link "Esqueceu a senha?" não implementado */}
              {/* <Link to="/esqueci-senha">Esqueceu a senha?</Link> */}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading} // Usa o loading do AuthContext
            >
              {loading ? 'Entrando...' : 'Login'}
            </button>
          </form>

          {/* Botão Google não implementado */}
          {/* <button type="button" className="btn-google">
            <span>Entre com Google</span>
          </button> */}

          <div className="login-signup-link">
            Não tem conta? <Link to="/cadastro">Cadastre-se</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

