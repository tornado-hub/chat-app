'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useRouter } from 'next/navigation';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post('/api/login', { username, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('currentUserId', response.data.userId);
      router.push('/dashboard');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message || 'An error occurred during login');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form.Group className="mb-3" controlId="formBasicUsername">
        <Form.Label>Username</Form.Label>
        <Form.Control 
          type="text" 
          placeholder="Enter username" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          required 
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
      </Form.Group>

      <Button variant="primary" type="submit" className="w-100" disabled={loading}>
        {loading ? <Spinner animation="border" size="sm" /> : 'Login'}
      </Button>
    </Form>
  );
};

export default LoginForm;
