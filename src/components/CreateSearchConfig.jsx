// src/components/CreateSearchConfig.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './CreateSearchConfig.css';

function CreateSearchConfig() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('accessToken');

    if (!token) {
      console.error('Token de acesso não encontrado.');
      // Adicionar lógica para lidar com a falta de token (redirecionar para login?)
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/search_configs/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ search_term: searchTerm }), // Ajuste os campos conforme o seu backend espera
      });

      if (response.ok) {
        console.log('Configuração de busca criada com sucesso!');
        // Adicionar lógica para feedback ao usuário (mensagem, redirecionamento?)
        // navigate('/'); // Redirecionar para a página principal após a criação
      } else {
        const errorData = await response.json();
        console.error('Erro ao criar configuração de busca:', errorData);
        // Adicionar lógica para exibir erros ao usuário
      }
    } catch (error) {
      console.error('Erro de rede ao criar configuração de busca:', error);
      // Adicionar lógica para lidar com erros de rede
    }
  };

  return (
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
      <button onClick={() => navigate('/')}>Voltar</button>
    </div>
  );
}

export default CreateSearchConfig;
