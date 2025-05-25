import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside style={{ width: '200px', backgroundColor: '#e0e0e0', padding: '20px' }}>
      <ul>
        <li><Link to="/products">Products</Link></li>
        <li><Link to="/search-configs">Search Configs</Link></li>
        <li><Link to="/source-websites">Source Websites</Link></li>
      </ul>
    </aside>
  );
};

export default Sidebar;
