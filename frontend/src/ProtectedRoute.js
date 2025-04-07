import { Navigate, Outlet } from 'react-router-dom';
import PropTypes from 'prop-types';
import AuthService from './services/AuthService';

const ProtectedRoute = ({ roles = [] }) => {
  const user = AuthService.getCurrentUser();
  const userRoles = user?.roles || [];
  const isAuthorized = !roles.length || roles.some((r) => userRoles.includes(r));

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return isAuthorized ? <Outlet /> : <Navigate to="/unauthorized" replace />;
};

ProtectedRoute.propTypes = {
  roles: PropTypes.array,
}

export default ProtectedRoute;
