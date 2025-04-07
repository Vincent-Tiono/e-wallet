import AuthHeader from './AuthHeader';
import axios from './axios';

const postWithoutAuth = (url, body) => {
  const request = axios.post(url, body);
  return request.then((response) => response.data);
};

const getWithAuth = (url) => {
  const headers = AuthHeader();
  console.log('Making authenticated GET request to:', url);
  console.log('With headers:', headers);
  
  // Add more details about the authentication headers
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      console.log('Using auth token from user ID:', userData.id);
    } catch (e) {
      console.error('Error parsing user data from localStorage:', e);
    }
  } else {
    console.warn('No user data in localStorage for authenticated request');
  }
  
  const request = axios.get(url, { headers });
  return request.then((response) => {
    console.log('Response from', url, ':', response);
    return response.data;
  })
  .catch(error => {
    console.error('API Error for', url, ':', error.response || error);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    throw error;
  });
};

const postWithAuth = (url, body) => {
  const headers = AuthHeader();
  console.log('Making authenticated POST request to:', url);
  console.log('With headers:', headers);
  const request = axios.post(url, body, { headers });
  return request.then((response) => {
    console.log('Response:', response);
    return response.data;
  })
  .catch(error => {
    console.error('API Error:', error.response || error);
    throw error;
  });
};

const putWithAuth = (url, body) => {
  const request = axios.put(url, body, { headers: AuthHeader() });
  return request.then((response) => response.data);
};

const deleteWithAuth = (url) => {
  const request = axios.delete(url, { headers: AuthHeader() });
  return request.then((response) => response.data);
};

const HttpService = {
  postWithoutAuth,
  getWithAuth,
  postWithAuth,
  putWithAuth,
  deleteWithAuth,
};

export default HttpService;
