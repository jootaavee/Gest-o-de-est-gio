// src/components/layout/Header.js (COMPLETO)

import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/apiClient';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const [notificacoes, setNotificacoes] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0); // Estado separado para o contador
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const fetchNotificacoes = useCallback(async () => {
    try {
      const response = await apiClient.get('/notificacoes/nao-lidas');
      // Atualiza tanto a lista visível quanto o contador
      setNotificacoes(response.data || []);
      setUnreadCount(response.data?.length || 0);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    }
  }, []);

  useEffect(() => {
    fetchNotificacoes();
    const intervalId = setInterval(fetchNotificacoes, 30000);
    return () => clearInterval(intervalId);
  }, [fetchNotificacoes]);

  const handleSinoClick = () => {
    // Apenas alterna a visibilidade do dropdown
    setDropdownOpen(prev => !prev);
    
    // Se o dropdown está sendo aberto e existem notificações não lidas...
    if (!dropdownOpen && unreadCount > 0) {
      // Marca como lidas no backend, mas não altera a UI imediatamente
      apiClient.post('/notificacoes/marcar-como-lidas').catch(err => {
          console.error("Falha ao marcar como lida:", err);
      });
      // Agenda a remoção do contador da UI para daqui a 5 segundos
      setTimeout(() => {
        setUnreadCount(0);
      }, 5000); 
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
              {/* O contador agora usa o seu próprio estado */}
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>
            {dropdownOpen && (
              <div className="notification-dropdown">
                <div className="dropdown-header">Notificações</div>
                <ul className="dropdown-list">
                  {/* A lista visível agora usa 'notificacoes', que não é limpa imediatamente */}
                  {notificacoes.length > 0 ? (
                    notificacoes.map((notif) => (
                      <li key={notif.id || notif._id} className="dropdown-item">
                        <a href={notif.link_url || '#'} target="_blank" rel="noopener noreferrer">
                            <p className="item-title">{notif.titulo}</p>
                            <p className="item-message">{notif.mensagem}</p>
                            <span className="item-time">{new Date(notif.data_envio).toLocaleDateString()}</span>
                        </a>
                      </li>
                    ))
                  ) : (
                    <li className="dropdown-item empty">Nenhuma nova notificação</li>
                  )}
                </ul>
              </div>
            )}
          </div>
          
          <div className="user-menu">
            <button className="user-button">
              <FontAwesomeIcon icon={faUserCircle} size="lg" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;