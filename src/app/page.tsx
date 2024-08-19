'use client';

import React, { useState } from 'react';
import { Container, Row, Col, Tab, Nav, Card } from 'react-bootstrap';
import LoginForm from '../components/LoginForm';
import RegistrationForm from '../components/RegisterationForm';

export default function Home() {
  const [activeKey, setActiveKey] = useState('login'); // State to manage the active tab

  const handleRegistrationSuccess = () => {
    setActiveKey('login'); // Switch to the login form after successful registration
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
      <h2 className="text-center mb-4">Welcome to the Chat Application</h2>
        <Col md={6}>
          <Card>
            
            <Card.Body>
              <Tab.Container activeKey={activeKey} onSelect={(k) => setActiveKey(k || 'login')}>
                <Nav variant="tabs" className="justify-content-center mb-3">
                  <Nav.Item>
                    <Nav.Link eventKey="login">Login</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="register">Register</Nav.Link>
                  </Nav.Item>
                </Nav>
                <Tab.Content>
                  <Tab.Pane eventKey="login">
                    <LoginForm />
                  </Tab.Pane>
                  <Tab.Pane eventKey="register">
                    <RegistrationForm onSuccess={handleRegistrationSuccess} />
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}