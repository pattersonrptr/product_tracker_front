import React from 'react';

const Home = ({ clearToken }) => {
  const handleLogout = () => {
    clearToken();
  };

  return (
    <div>
      <h1>Bem-vindo à Página Inicial!</h1>
      <button onClick={handleLogout}>Sair</button>
    </div>
  );
};

export default Home;
