import React, { useState } from 'react';

const LoginForm = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('grant_type', 'password'); // Requerido pelo OAuth2PasswordRequestForm
    formData.append('scope', '');           // Opcional, mas pode ser necessário
    formData.append('client_id', '');       // Opcional
    formData.append('client_secret', '');   // Opcional

    console.log('Dados de login sendo enviados:', formData.toString()); // Verifique a formatação

    try {
      const response = await fetch('http://localhost:8000/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login realizado com sucesso:', data);
        localStorage.setItem('accessToken', data.access_token);
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } else {
        console.error('Falha no login:', data);
        let errorMessage = 'Falha ao fazer login. Verifique suas credenciais.';
        if (data && data.detail && Array.isArray(data.detail)) {
          errorMessage = data.detail.map(err => err.msg).join(', ');
        } else if (data && data.detail) {
          errorMessage = data.detail;
        } else if (data && data.message) {
          errorMessage = data.message;
        } else if (typeof data === 'object' && data !== null) {
          errorMessage = JSON.stringify(data);
        }
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Erro ao comunicar com o servidor:', error);
      setError('Erro ao comunicar com o servidor.');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Usuário:</label>
          <input
            type="text"
            id="username"
            name='username'
            value={username}
            onChange={handleUsernameChange}
          />
        </div>
        <div>
          <label htmlFor="password">Senha:</label>
          <input
            type="password"
            id="password"
            name='password'
            value={password}
            onChange={handlePasswordChange}
          />
        </div>
        <button type="submit">Entrar</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
};

export default LoginForm;