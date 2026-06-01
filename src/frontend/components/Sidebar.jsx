import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';

const sidebarConfigs = {
  admin: {
    user: {
      name: 'Bela Canela',
      role: 'Admin',
      initial: 'B',
    },
    items: [
      {
        label: 'Atribuições',
        path: '/assignments',
      },
      {
        label: 'Drones',
        path: '/drones',
      },
      {
        label: 'Operadores',
        path: '/operators',
      },
    ],
  },

  drone: {
    user: {
      name: 'Tony Panetone',
      role: 'Operador',
      initial: 'T',
    },
    items: [
      {
        label: 'Seleção de drone',
        path: '/drone-visu',
      },
      {
        label: 'Mapa de calor',
        path: '/drones',
      },
      {
        label: 'Histórico',
        path: '/history',
      },
    ],
  },
};

const Sidebar = ({ variant = 'admin' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const config = sidebarConfigs[variant] || sidebarConfigs.admin;

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Pier Surveillance</h2>
        <p>Dashboard</p>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {config.items.map((item) => (
            <li key={item.path}>
              <button
                type="button"
                className={isActive(item.path) ? 'active' : ''}
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {config.user.initial}
          </div>

          <div>
            <p className="sidebar-user-name">{config.user.name}</p>
            <p className="sidebar-user-role">{config.user.role}</p>
          </div>
        </div>

        <button type="button" className="sidebar-logout">
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;