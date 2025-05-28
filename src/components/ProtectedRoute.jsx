import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from 'notistack';

const ProtectedRoute = ({ children }) => {
    const { token, handleSessionExpired } = useAuth();
    const { enqueueSnackbar } = useSnackbar();

    const [shouldRedirect, setShouldRedirect] = React.useState(false);
    const [redirectMessage, setRedirectMessage] = React.useState('');

    useEffect(() => {
        let redirect = false;
        let message = '';

        if (!token) {
            message = 'You need to log in to access this page.';
            redirect = true;
        } else {
            try {
                const decodedToken = jwtDecode(token);
                const currentTime = Date.now() / 1000;

                if (decodedToken.exp < currentTime) {
                    message = 'Your session has expired. Please log in again.';
                    redirect = true;
                }
            } catch (error) {
                message = 'Invalid session. Please log in again.';
                redirect = true;
            }
        }

        if (redirect) {
            console.log("ProtectedRoute: Triggering handleSessionExpired with message:", message);
            handleSessionExpired(message);
        }
    }, [token, handleSessionExpired, enqueueSnackbar]);

    if (!token) {
        return null;
    }

    return children;
};

export default ProtectedRoute;
