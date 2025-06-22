import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/apiClient';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  
  const [unreadCount, setUnreadCount] = useState(0); 
  const [notificacoes, setNotificacoes] = useState([]);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const fetchNotificacoesData = useCallback(async () => {
    if (!user) return;

    try {
      const [resNaoLidas, resTodas] = await Promise.all([
        apiClient.get('/notificacoes/nao-lidas'),
        apiClient.get('/notificacoes/usuario/me')
      ]);
      
      setUnreadCount(resNaoLidas.data?.length || 0);
      setNotificacoes(resTodas.data || []);
      
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchNotificacoesData();
    const intervalId = setInterval(fetchNotificacoesData, 30000);
    return () => clearInterval(intervalId);
  }, [fetchNotificacoesData]);

  const handleSinoClick = () => {
    setDropdownOpen(prev => !prev);
    
    if (!dropdownOpen && unreadCount > 0) {
      setUnreadCount(0); 
      apiClient.post('/notificacoes/marcar-como-lidas').catch(err => {
        console.error("Falha ao marcar como lida no backend:", err);
      });
      setNotificacoes(prevNotifs => 
        prevNotifs.map(notif => ({ ...notif, lida: true }))
      );
    }
  };
  
  const handleDeleteNotificacao = async (notificacaoId, event) => {
    event.stopPropagation();

    setNotificacoes(prevNotificacoes =>
      prevNotificacoes.filter(notif => notif.id !== notificacaoId)
    );
    
    try {
      await apiClient.delete(`/notificacoes/${notificacaoId}`);
    } catch (error) {
      console.error('Falha ao deletar notificação:', error);
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-title">Olá, {user?.nome_completo || 'Usuário'}</div>
        <div className="header-actions">
          <div className="notification-wrapper">
            <button className="notification-bell" onClick={handleSinoClick}>
              <FontAwesomeIcon icon={faBell} />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>
            {dropdownOpen && (
              <div className="notification-dropdown">
                <div className="dropdown-header">Notificações</div>
                <ul className="dropdown-list">
                  {notificacoes.length > 0 ? (
                    notificacoes.map((notif) => (
                      <li key={notif.id} className={`dropdown-item ${notif.lida ? 'lida' : ''}`}>
                        <button 
                          className="close-notification-btn"
                          onClick={(e) => handleDeleteNotificacao(notif.id, e)}
                          title="Dispensar notificação"
                        >
                          ×
                        </button>
                        <p className="item-title">{notif.titulo}</p>
                        <p className="item-message">{notif.mensagem}</p>
                        <span className="item-time">{new Date(notif.data_envio).toLocaleDateString()}</span>
                      </li>
                    ))
                  ) : (
                    <li className="dropdown-item empty">Nenhuma notificação recente</li>
                  )}
                </ul>
              </div>
            )}
          </div>
          
          <div className="user-menu">
            <button className="user-button" onClick={() => setUserMenuOpen(prev => !prev)}>
              <FontAwesomeIcon icon={faUserCircle} size="lg" />
            </button>
            {userMenuOpen && (
              <div className="user-dropdown">
                <ul className="user-dropdown-list">
                  <li className="user-dropdown-item">
                    <button onClick={logout} className="logout-button">Sair</button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;