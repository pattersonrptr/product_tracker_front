import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ListSearchConfigs from './ListSearchConfigs';
import './CreateSearchConfig.css';

function SearchConfig() {
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('accessToken');

    if (!token) {
      console.error('Token de acesso não encontrado.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/search_configs/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ search_term: searchTerm }),
      });

      if (response.ok) {
        console.log('Configuração de busca criada com sucesso!');
        setSuccessMessage('Busca criada com sucesso!');
        setSearchTerm('');
      } else {
        const errorData = await response.json();
        console.error('Erro ao criar configuração de busca:', errorData);
        setSuccessMessage('');

      }
    } catch (error) {
      console.error('Erro de rede ao criar configuração de busca:', error);
      setSuccessMessage('');

    }
  };

  return (
    <div>
      <div className="create-search-config">
        <h2>Criar Nova Busca</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="searchTerm">Termo de Busca:</label>
            <input
              type="text"
              id="searchTerm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              required
            />
          </div>
          <button type="submit">Criar Busca</button>
        </form>
        {successMessage && <p className="success-message">{successMessage}</p>}
        <button onClick={() => navigate('/')}>Voltar</button>
      </div>
      <ListSearchConfigs />
    </div>
  );
}

export default SearchConfig;
