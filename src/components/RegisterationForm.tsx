'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';

interface RegistrationFormProps {
  onSuccess?: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/register', { username, password });
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message || 'An error occurred during registration');
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

      <Form.Group className="mb-3" controlId="formBasicConfirmPassword">
        <Form.Label>Confirm Password</Form.Label>
        <Form.Control 
          type="password" 
          placeholder="Confirm Password" 
          value={confirmPassword} 
          onChange={(e) => setConfirmPassword(e.target.value)} 
          required 
        />
      </Form.Group>

      <Button variant="primary" type="submit" className="w-100" disabled={loading}>
        {loading ? <Spinner animation="border" size="sm" /> : 'Register'}
      </Button>
    </Form>
  );
};

export default RegistrationForm;
