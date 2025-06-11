'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Box, Button, TextField, Typography, Container, Paper, Alert, Link } from '@mui/material';
import { PersonAdd } from '@mui/icons-material';
import NextLink from 'next/link';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password) {
      return setError('Please fill in all fields');
    }
    
    if (password !== confirmPassword) {
      return setError("Passwords don't match");
    }
    
    if (password.length < 6) {
      return setError('Password must be at least 6 characters long');
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      await signup(username, password);
      // No need to navigate here, the AuthContext will handle it
    } catch (err) {
      console.error('Signup error:', err);
      setError('Failed to create an account. The username might already be taken.');
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ mb: 2 }}>
          <PersonAdd color="primary" sx={{ fontSize: 40 }} />
        </Box>
        <Typography component="h1" variant="h5">
          Create an account
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            inputProps={{
              minLength: 3,
              maxLength: 30
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            inputProps={{
              minLength: 6
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={!!error && (password !== confirmPassword || password.length < 6)}
            helperText={
              password !== confirmPassword 
                ? "Passwords don't match" 
                : password.length > 0 && password.length < 6 
                  ? 'Password must be at least 6 characters' 
                  : ''
            }
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{ mt: 3, mb: 2 }}
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <Link href="/login" component={NextLink}>
              <Typography variant="body2" color="primary">
                Already have an account? Sign in
              </Typography>
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
