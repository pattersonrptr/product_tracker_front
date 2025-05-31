import React, {useEffect} from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import UserAccount from './components/UserAccount';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Main from './components/Main';
import Footer from './components/Footer';
import SourceWebsites from './components/SourceWebsites';
import SearchConfigs from './components/SearchConfigs';
import Products from './components/Products';
import ProductDetail from './components/ProductDetail';
import ConfirmationDialog from './components/ConfirmationDialog';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { setSessionExpiredCallback } from './api/axiosConfig';
import './App.css';
import { SnackbarProvider } from 'notistack';

function AppContent() {
    const { token, logout, handleSessionExpired } = useAuth();
    const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
    const [sidebarWidth, setSidebarWidth] = React.useState(200); // default expanded

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
        <div className="App">
            {token ? (
                <>
                    <Header onLogout={handleLogoutConfirmation} isLoggedIn={!!token} />
                    <div style={{ display: 'flex' }}>
                        <Sidebar onWidthChange={setSidebarWidth} />
                        <div
                            style={{
                                flex: 1,
                                marginTop: 64, // appBar height MUI pattern
                                marginLeft: sidebarWidth, // sidebar extended width
                                transition: 'margin-left 0.2s',
                            }}
                            id="main-content"
                        >
                            <Main>
                                <Routes>
                                    <Route path="/account" element={<ProtectedRoute><UserAccount /></ProtectedRoute>} />
                                    <Route path="/source-websites" element={<ProtectedRoute><SourceWebsites /></ProtectedRoute>} />
                                    <Route path="/search-configs" element={<ProtectedRoute><SearchConfigs /></ProtectedRoute>} />
                                    <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
                                    <Route path="/products/:productId" element={<ProductDetail />} />
                                    <Route path="*" element={<Navigate to="/products" replace />} />
                                </Routes>
                            </Main>
                        </div>
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
                    <Route path="*" element={<Navigate to="/login" replace />} />
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
