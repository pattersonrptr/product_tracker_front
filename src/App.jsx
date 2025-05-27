import React, {useEffect} from 'react';
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
import ConfirmationDialog from './components/ConfirmationDialog';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { setSessionExpiredCallback } from './api/axiosConfig';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';
import { SnackbarProvider } from 'notistack';

function AppContent() {
    const { token, logout, handleSessionExpired } = useAuth();
    const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

    useEffect(() => {
        setSessionExpiredCallback(handleSessionExpired);
    }, [handleSessionExpired]);

    const handleLogoutConfirmation = () => {
        setShowLogoutConfirm(true);
    };

    const handleConfirmLogout = () => {
        setShowLogoutConfirm(false);
        logout();
    };

    const handleCancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    return (
        <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {token ? (
                <>
                    <Header onLogout={handleLogoutConfirmation} isLoggedIn={!!token} />
                    <div style={{ display: 'flex', flex: 1 }}>
                        <Sidebar />
                        <Main>
                            <Routes>
                                <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                                <Route path="/source-websites" element={<ProtectedRoute><SourceWebsites /></ProtectedRoute>} />
                                <Route path="/search-configs" element={<ProtectedRoute><SearchConfigs /></ProtectedRoute>} />
                                <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
                                <Route path="*" element={<Navigate to="/" />} />
                            </Routes>
                        </Main>
                    </div>
                    <Footer />
                    <ConfirmationDialog
                        open={showLogoutConfirm}
                        onCancel={handleCancelLogout}
                        onConfirm={handleConfirmLogout}
                        title="Confirm Logout"
                        message="Are you sure you want to log out?"
                    />
                </>
            ) : (
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            )}
        </div>
    );
}

function App() {
    return (
        <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </SnackbarProvider>
    );
}

export default App;
