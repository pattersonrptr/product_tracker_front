import React from 'react';
import { Link } from 'react-router-dom';

import './Sidebar.css';

function Sidebar() {
  return (
    <div className="sidebar">
      <h2>Ações</h2>
      <ul>
        <li>
          <Link to="/search-config">Criar Busca</Link>
        </li>
        <li>
          <Link to="/add-website">Adicionar Website</Link>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
