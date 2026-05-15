import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated }  from '../auth/authService';

export default function PrivateRoute({ children }) {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }
    // Si children es Layout lo renderiza, si no usa Outlet
    return children ?? <Outlet />;
}