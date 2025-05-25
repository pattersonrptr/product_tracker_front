import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Main from './components/Main';
import Footer from './components/Footer';
import SourceWebsites from './components/SourceWebsites';
import SearchConfigs from './components/SearchConfigs';
import Products from './components/Products';
import axios from 'axios';
import './App.css';
import { SnackbarProvider } from 'notistack';
import { jwtDecode } from 'jwt-decode';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState('');

  const saveToken = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    // Decode username from token
    try {
      const decoded = jwtDecode(newToken);
      setUsername(decoded.username || decoded.sub || '');
    } catch {
      setUsername('');
    }
  };

  const clearToken = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUsername('');
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      const verifyToken = async () => {
        try {
          await axios.post('http://127.0.0.1:8000/auth/verify-token', { token: storedToken });
          setToken(storedToken);
          // Decode username from token
          try {
            const decoded = jwtDecode(storedToken);
            setUsername(decoded.username || decoded.sub || '');
          } catch {
            setUsername('');
          }
        } catch (error) {
          localStorage.removeItem('token');
          setToken(null);
          setUsername('');
        }
      };
      verifyToken();
    }
  }, []);

  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        {token ? (
          <>
            <Header username={username} onLogout={clearToken} />
            <div style={{ display: 'flex', flex: 1 }}>
              <Sidebar />
              <Main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/source-websites" element={<SourceWebsites />} />
                  <Route path="/search-configs" element={<SearchConfigs />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Main>
            </div>
            <Footer />
          </>
        ) : (
          <Routes>
            <Route path="/login" element={<Login saveToken={saveToken} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </SnackbarProvider>
    </div>
  );
}

export default App;
