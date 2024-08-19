// src/app/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Container, Row, Col, ListGroup, Form, Button, InputGroup } from 'react-bootstrap';
import io from 'socket.io-client';

const socket = io();
interface Message {
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
}
const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  // const [messages, setMessages] = useState([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
    }
  };

  const groupMessagesByDate = (messages: Message[]): [string, Message[]][] => {
    const groups: { [key: string]: Message[] } = {};
    messages.forEach(message => {
      const date = new Date(message.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return Object.entries(groups).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()) as [string, Message[]][];
  };
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('newMessage', (message) => {
      console.log('Received new message:', message);
      if (
        (message.senderId === localStorage.getItem('currentUserId') && message.receiverId === selectedUser._id) ||
        (message.senderId === selectedUser._id && message.receiverId === localStorage.getItem('currentUserId'))
      ) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    return () => {
      socket.off('newMessage');
    };
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const searchUsers = async () => {
    try {
      const response = await axios.get(`/api/users/search?username=${searchQuery}`);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error('Failed to search users:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUserId');
    router.push('/');
  };

  const selectUser = async (user) => {
    setSelectedUser(user);
    const currentUserId = localStorage.getItem('currentUserId');
    if (!currentUserId) {
      console.error('Current user ID is null');
      return;
    }

    try {
      const response = await axios.get(`/api/get-message?userId1=${currentUserId}&userId2=${user._id}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    try {
      const messageData = {
        senderId: localStorage.getItem('currentUserId'),
        receiverId: selectedUser._id,
        content: message,
        timestamp: new Date().toISOString(),
      };

      await axios.post('/api/send-message', messageData);
      socket.emit('sendMessage', messageData);
      setMessage('');
      console.log('Message sent and emitted:', messageData);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <Container fluid className="vh-100 d-flex flex-column bg-grayish">
      <Row className="py-3 ">
        <Col>
          <h1 className="mb-0">Chat Dashboard</h1>
        </Col>
        <Col xs="auto">
          <Button variant="outline-danger" onClick={handleLogout}>Logout</Button>
        </Col>
      </Row>
      <Row className="flex-grow-1">
        <Col md={4} className="border-end">
          <h2 className="h5 mb-3 mt-3">Users</h2>
          <InputGroup className="mb-3">
            <Form.Control
              placeholder="Search by username"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="outline-secondary" onClick={searchUsers}>Search</Button>
          </InputGroup>
          <ListGroup>
            {filteredUsers.map(user => (
              <ListGroup.Item 
                key={user._id}  // Added key here
                action 
                onClick={() => selectUser(user)}
                active={selectedUser && selectedUser._id === user._id}
              >
                {user.username}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
        <Col md={8}>
        {selectedUser ? (
          <>
            <h2 className="h5 mb-3 mt-3">Chat with {selectedUser.username}</h2>
            <div className="messages-container bg-dark p-3 mb-3" style={{ height: '70vh', overflowY: 'auto' }}>
              {messages.length === 0 ? (
                <p>No messages</p>
              ) : (
                groupMessagesByDate(messages).map(([date, dateMessages]) => (
                  <div key={date}>
                    <div className="text-center my-3">
                      <span className="bg-secondary text-white px-2 py-1 rounded-pill" style={{ fontSize: '0.8em' }}>
                        {formatDate(date)}
                      </span>
                    </div>
                    {dateMessages.map((msg, index) => (
                      <div 
                        key={index}
                        className={`mb-2 ${msg.senderId === selectedUser._id ? 'text-start' : 'text-end'}`}
                      >
                        <div className={`d-inline-block p-2 rounded ${msg.senderId === selectedUser._id ? 'bg-primary text-white' : 'bg-secondary text-white'}`}>
                          <span>{msg.content}</span>
                          <span className="ms-2 text-white-50" style={{ fontSize: '0.75em' }}>{formatMessageTime(msg.timestamp)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
            <Form onSubmit={sendMessage}>
              <Form.Group className="d-flex">
                <Form.Control
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message"
                />
                <Button type="submit" variant="primary" className="ms-2">Send</Button>
              </Form.Group>
            </Form>
          </>
        ) : (
          <p className="text-center mt-5">Select a user to start chatting</p>
        )}
      </Col>

      </Row>
    </Container>
  );
};

export default Dashboard;
