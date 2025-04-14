import { LoadingButton } from '@mui/lab';
import { IconButton, InputAdornment, Stack, TextField } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Iconify from '../../components/iconify';
import AuthService from '../../services/AuthService';

export default function SignupForm() {
  const defaultValues = {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    phoneNumber: '',
    roles: ['ROLE_USER'],
  };

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [formValues, setFormValues] = useState(defaultValues);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    
    // Validate field lengths before submission
    const fieldLimits = {
      username: 20,
      phoneNumber: 20,
      firstName: 50,
      lastName: 50,
      email: 50,
    };
    
    let hasErrors = false;
    Object.entries(fieldLimits).forEach(([field, limit]) => {
      if (formValues[field] && formValues[field].length > limit) {
        enqueueSnackbar(`${field} must be ${limit} characters or less`, { variant: 'error' });
        hasErrors = true;
      }
    });
    
    if (hasErrors) return;
    
    AuthService.signup(formValues)
      .then((response) => {
        enqueueSnackbar('Signed up successfully', { variant: 'success' });
        navigate('/login');
      })
      .catch((error) => {
        if (error.response?.data?.errors) {
          error.response?.data?.errors.map((e) => enqueueSnackbar(e.message, { variant: 'error' }));
        } else if (error.response?.data?.message) {
          enqueueSnackbar(error.response?.data?.message, { variant: 'error' });
        } else {
          enqueueSnackbar(error.message, { variant: 'error' });
        }
      });
  };

  return (
    <>
      <Stack spacing={3}>
        <TextField
          id="firstName"
          name="firstName"
          label="First Name"
          autoComplete="given-name"
          autoFocus
          required
          value={formValues.firstName}
          onChange={handleInputChange}
        />
        <TextField
          id="lastName"
          name="lastName"
          label="Last Name"
          autoComplete="lastName"
          required
          value={formValues.lastName}
          onChange={handleInputChange}
        />
        <TextField
          id="username"
          name="username"
          label="Username"
          autoComplete="username"
          required
          value={formValues.username}
          onChange={handleInputChange}
          inputProps={{ maxLength: 20 }}
          helperText="Maximum 20 characters"
        />
        <TextField
          id="email"
          name="email"
          label="Email"
          autoComplete="email"
          required
          value={formValues.email}
          onChange={handleInputChange}
        />
        <TextField
          id="phoneNumber"
          name="phoneNumber"
          label="Phone Number"
          autoComplete="tel"
          required
          value={formValues.phoneNumber}
          onChange={handleInputChange}
          inputProps={{ maxLength: 20 }}
          helperText="Maximum 20 characters"
        />
        <TextField
          id="password"
          name="password"
          label="Password"
          autoComplete="current-password"
          type={showPassword ? 'text' : 'password'}
          required
          value={formValues.password}
          onChange={handleInputChange}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }} />
      <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={handleSubmit}>
        Sign up
      </LoadingButton>
    </>
  );
}
