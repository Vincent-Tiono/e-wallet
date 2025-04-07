import axios from './axios';

const login = (body) => {
  const url = '/auth/login';
  return axios.post(url, body).then((response) => {
    console.log('Login response:', response);
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  });
};

const signup = (body) => {
  const url = '/auth/signup';
  return axios.post(url, body).then((response) => response.data);
};

const logout = () => {
  localStorage.removeItem('user');
};

const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

const AuthService = {
  login,
  signup,
  logout,
  getCurrentUser,
};

export default AuthService;
