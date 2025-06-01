import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useAuth, AuthProvider } from '../../contexts/AuthContext';
import apiClient from '../../api/apiClient';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notificacoes, setNotificacoes] = useState([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [showNotificacoes, setShowNotificacoes] = useState(false);

  // Buscar notificações do usuário
  useEffect(() => {
    const fetchNotificacoes = async () => {
      if (!user) return; // Evita chamar se não houver usuário logado
      try {
        const response = await apiClient.get('/notificacoes/usuario/me');
        setNotificacoes(response.data.notificacoes || []); // Garanta que seja um array
        setNaoLidas(response.data.nao_lidas || 0);
      } catch (error) {
        console.error('Erro ao buscar notificações:', error.response ? error.response.data : error.message);
      }
    };

    if (user && user.tipo !== 'TECNICO') { 
      fetchNotificacoes();
      const interval = setInterval(fetchNotificacoes, 30000);
      return () => clearInterval(interval);
    }

  }, [user]); 



  // Marcar notificação como lida
  const marcarComoLida = async (id) => {
    try {
      // ----> USE apiClient
      await apiClient.put(`/notificacoes/usuario/me/${id}/lida`);
      setNotificacoes(notificacoes.map(notif =>
        notif._id === id ? { ...notif, lida: true } : notif
      ));
      setNaoLidas(prev => (prev > 0 ? prev - 1 : 0));
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error.response ? error.response.data : error.message);
    }
  };

  // Marcar todas como lidas
  const marcarTodasComoLidas = async () => {
    try {
      // ----> USE apiClient
      await apiClient.put('/notificacoes/usuario/me/marcar-todas-lidas');
      setNotificacoes(notificacoes.map(notif => ({ ...notif, lida: true })));
      setNaoLidas(0);
    } catch (error) {
      console.error('Erro ao marcar todas notificações como lidas:', error.response ? error.response.data : error.message);
    }
  };

  // Função para lidar com o logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Obter iniciais do nome do usuário para o avatar
  const getInitials = () => {
    if (!user || !user.nome_completo) return '?';

    const names = user.nome_completo.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="header">
      <div className="header-title">
        {user?.tipo === 'TECNICO' ? 'Painel Administrativo' : 'Sistema de Estágio'}
      </div>
      <div className="header-actions">
        <div className="notification-icon" onClick={() => setShowNotificacoes(!showNotificacoes)}>
          <FontAwesomeIcon icon={faBell} />
          {naoLidas > 0 && <span className="notification-badge">{naoLidas}</span>}

          {showNotificacoes && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <span>Notificações</span>
                {notificacoes.length > 0 && naoLidas > 0 && ( // Mostrar botão apenas se houver não lidas
                  <button
                    className="btn btn-sm btn-link"
                    onClick={(e) => {
                      e.stopPropagation();
                      marcarTodasComoLidas();
                    }}
                  >
                    Marcar todas como lidas
                  </button>
                )}
              </div>
              <ul className="notification-list">
                {notificacoes.length === 0 ? (
                  <li className="notification-item">
                    <div className="notification-message">Nenhuma notificação</div>
                  </li>
                ) : (
                  notificacoes.map(notif => (
                    <li
                      key={notif._id}
                      className={`notification-item ${!notif.lida ? 'unread' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation(); // Para não fechar o dropdown imediatamente se ele fechar no click do container pai
                        if (!notif.lida) { // Marcar como lida apenas se não estiver lida
                          marcarComoLida(notif._id);
                        }
                        // Você pode querer adicionar navegação aqui, por exemplo:
                        // if (notif.link) navigate(notif.link);
                        // setShowNotificacoes(false); // Opcional: fechar dropdown após click
                      }}
                    >
                      <div className="notification-title">{notif.titulo}</div>
                      <div className="notification-message">{notif.mensagem}</div>
                      <div className="notification-time">
                        {new Date(notif.data_criacao).toLocaleString()}
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="user-profile">
          <div className="user-avatar">
            {user?.foto_perfil_url ? (
              <img src={user.foto_perfil_url} alt={user.nome_completo} />
            ) : (
              getInitials()
            )}
          </div>
          <span>{user?.nome_completo}</span>
          <button
            className="btn btn-link"
            onClick={handleLogout}
            title="Sair"
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;