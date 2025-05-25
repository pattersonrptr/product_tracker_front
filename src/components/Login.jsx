import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ saveToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('http://127.0.0.1:8000/auth/login', {
        username: username,
        password: password,
        grant_type: 'password',
        scope: '',
        client_id: '',
        client_secret: ''
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const token = response.data.access_token;
      saveToken(token);
      navigate('/');

    } catch (error) {
      console.error('Erro ao fazer login:', error);
      if (error.response) {
        // O servidor respondeu com um status code diferente de 2xx
        console.error('Dados da resposta:', error.response.data);
        console.error('Status da resposta:', error.response.status);
        setError(`Erro de login: ${error.response.data.detail || 'Erro desconhecido'}`);
      } else if (error.request) {
        // A requisição foi feita, mas não houve resposta
        console.error('Nenhuma resposta recebida:', error.request);
        setError('Erro ao conectar ao servidor.');
      } else {
        // Algum outro erro aconteceu
        console.error('Erro ao configurar a requisição:', error.message);
        setError('Erro ao processar a requisição.');
      }
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Usuário:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Senha:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
};

export default Login;
