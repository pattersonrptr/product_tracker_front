import React, { useState, useEffect, useCallback } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Main from './components/Main';
import Footer from './components/Footer';
import SourceWebsites from './components/SourceWebsites';
import SearchConfigs from './components/SearchConfigs';
import Products from './components/Products';
import ConfirmationDialog from './components/ConfirmationDialog';
import axios from 'axios';
import './App.css';
import { SnackbarProvider, useSnackbar } from 'notistack';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const saveToken = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogoutConfirmation = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    clearToken();
    setShowLogoutConfirm(false);
    enqueueSnackbar('You have been logged out.', { variant: 'info' });
    navigate('/login');
  };

  const clearToken = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      const verifyToken = async () => {
        try {
          await axios.post('http://127.0.0.1:8000/auth/verify-token', { token: storedToken });
          setToken(storedToken);
        } catch (error) {
          localStorage.removeItem('token');
          setToken(null);
          enqueueSnackbar('Your session has expired, please log in again.', { variant: 'error' });
        }
      };
      verifyToken();
    }
  }, []);

  const handleCancelLogout = useCallback(() => {
    setShowLogoutConfirm(false);
  }, []);

  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        {token ? (
          <>
            <Header onLogout={handleLogoutConfirmation} isLoggedIn={!!token} />
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
            {console.log('Rendering ConfirmationDialog. showLogoutConfirm:', showLogoutConfirm)}
            <ConfirmationDialog
              open={showLogoutConfirm}
              title="Confirm Logout"
              message="Are you sure you want to log out?"
              onCancel={handleCancelLogout}
              onConfirm={handleConfirmLogout}
            />
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
