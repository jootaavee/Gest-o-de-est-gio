import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faFileAlt, faUser, faCog, faClipboardList, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { isAluno, isTecnico } = useAuth();
  
  const menuItems = isAluno() 
    ? [
        { path: '/', icon: faHome, text: 'Home' },
        { path: '/meus-documentos', icon: faFileAlt, text: 'Meus Documentos' },
        { path: '/minhas-inscricoes', icon: faClipboardList, text: 'Minhas Inscrições' },
        { path: '/editar-perfil', icon: faUser, text: 'Editar Perfil' },
        { path: '/configuracoes', icon: faCog, text: 'Configurações' },
      ]
    : isTecnico()
      ? [
          { path: '/admin', icon: faHome, text: 'Dashboard' },
          { path: '/admin/cadastro-vaga', icon: faFileAlt, text: 'Cadastrar Vaga' },
          { path: '/admin/notificacoes/cadastrar', icon: faPaperPlane, text: 'Enviar Notificação' },
          { path: '/admin/editar-perfil', icon: faUser, text: 'Editar Perfil' },
        ]
      : [];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src="/img/LogoGE.png" alt="GE UERN" />
        </div>
      </div>
      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li 
            key={item.path} 
            className={`sidebar-menu-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <Link to={item.path}>
              <FontAwesomeIcon icon={item.icon} />
              <span>{item.text}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;