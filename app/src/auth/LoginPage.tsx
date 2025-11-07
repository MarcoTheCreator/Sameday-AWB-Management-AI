import { useLogin, Notification } from 'react-admin';
import { Container, TextField, Button, Box, Typography, Paper } from '@mui/material';
import { useState } from 'react';

export default function LoginPage() {
  const login = useLogin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login({ username, password });
    } catch (e) {
      // handled by Notification
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Container maxWidth="xs" sx={{ mt: 12 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Sameday eAWB Login
          </Typography>
          <Box component="form" onSubmit={onSubmit}>
            <TextField fullWidth margin="normal" label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <TextField fullWidth margin="normal" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button disabled={submitting} type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
              {submitting ? 'Logging in...' : 'Login'}
            </Button>
          </Box>
        </Paper>
      </Container>
      <Notification />
    </>
  );
}


