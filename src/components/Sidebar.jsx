import React from 'react';
import { Link } from 'react-router-dom';

import './Sidebar.css';

function Sidebar() {
  return (
    <div className="sidebar">
      <ul>
        <li>
          <Link to="/products">Products</Link>
        </li>
        <li>
          <Link to="/search-config">Searches</Link>
        </li>
        <li>
          <Link to="/add-website">Web Sites</Link>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
