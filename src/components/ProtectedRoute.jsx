import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { token, handleSessionExpired } = useAuth();

    if (!token) {
        handleSessionExpired('You need to log in to access this page.');
        return null;
    }

    try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
            console.log("Token expired during route check. Triggering session expired handler.");
            handleSessionExpired('Your session has expired. Please log in again.');
            return null;
        }
    } catch (error) {
        console.error("Invalid token found during route check:", error);
        handleSessionExpired('Invalid session. Please log in again.');
        return null;
    }

    return children;
};

export default ProtectedRoute;
