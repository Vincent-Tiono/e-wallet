import AuthService from './AuthService';

export default function AuthHeader() {
  const user = AuthService.getCurrentUser();
  
  if (!user) {
    console.warn('No user found for authentication header');
    return {};
  }
  
  const token = user.token;
  
  if (!token) {
    console.warn('User exists but no token found');
    return {};
  }
  
  console.log('Creating auth header with token');
  
  // Most JWT implementations expect "Bearer " prefix
  return { 
    'Accept': 'application/json', 
    'Authorization': `Bearer ${token}` 
  };
}
