import React, { useState, useEffect } from "react";
import LoginForm from "./components/auth/LoginForm";
import ProductList from "./components/ProductList";
import Sidebar from "./components/Sidebar";
import SearchConfig from "./components/SearchConfig";
import "./App.css";
import { Routes, Route, useNavigate } from 'react-router-dom';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    navigate('/products');
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setIsLoggedIn(false);
    navigate('/login');
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const response = await fetch('http://localhost:8000/auth/verify-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.is_valid) {
              setIsLoggedIn(true);
            } else {
              localStorage.removeItem('accessToken');
              setIsLoggedIn(false);
            }
          } else {
            console.error('Erro ao verificar o token');
            localStorage.removeItem('accessToken');
            setIsLoggedIn(false);
          }
        } catch (error) {
          console.error('Erro ao comunicar com o servidor para verificar o token:', error);
          localStorage.removeItem('accessToken');
          setIsLoggedIn(false);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Price Monitoring</h1>
        {isLoggedIn && <button onClick={handleLogout}>Logout</button>}
      </header>
      <div className="App-body">
        {isLoggedIn ? (
          <div className="app-container">
            <Sidebar />
            <main className="App-main">
              <Routes>
                <Route path="/products" element={<ProductList setIsLoggedIn={setIsLoggedIn} />} />
                <Route path="/search-config" element={<SearchConfig />} />
                <Route path="/add-website" element={<div>Página de Adicionar Website</div>} />
              </Routes>
            </main>
          </div>
        ) : (
          <main className="App-main">
            <Routes>
              <Route path="/login" element={<LoginForm onLoginSuccess={handleLoginSuccess} />} />
              <Route path="/" element={<LoginForm onLoginSuccess={handleLoginSuccess} />} />
            </Routes>
          </main>
        )}
      </div>
      <footer className="App-footer">
        &copy; {new Date().getFullYear()} Products System
      </footer>
    </div>
  );
}

export default App;
