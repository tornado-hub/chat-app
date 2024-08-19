// src/app/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Container, Row, Col, ListGroup, Form, Button, InputGroup } from 'react-bootstrap';
import Chat from '../../components/Chats';

interface User {
  _id: string;
  username: string;
  friends: string[]; 
  isFriend: boolean; // Add this to determine if the user is already a friend
}

const Dashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const currentUserId = localStorage.getItem('currentUserId');
      if (!currentUserId) throw new Error('Current user ID is not available');

      const response = await axios.get(`/api/users?userId=${currentUserId}`);
      const usersWithFriendship = response.data.map((user: User) => ({
        ...user,
        isFriend: user.friends.includes(currentUserId)
      }));
      setUsers(usersWithFriendship);
      setFilteredUsers(usersWithFriendship);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const searchUsers = async () => {
    try {
      const response = await axios.get(`/api/users/search?username=${searchQuery}`);
      const usersWithFriendship = response.data.map((user: User) => ({
        ...user,
        isFriend: users.some(u => u._id === user._id && u.isFriend)
      }));
      setFilteredUsers(usersWithFriendship);
    } catch (error) {
      console.error('Failed to search users:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUserId');
    router.push('/');
  };

  const selectUser = (user: User) => {
    setSelectedUser(user);
  };

  const handleAddFriend = async () => {
    if (selectedUser) {
      try {
        const currentUserId = localStorage.getItem('currentUserId');
        if (!currentUserId) throw new Error('Current user ID is not available');

        await axios.post('/api/friends/add', { userId: currentUserId, friendId: selectedUser._id });
        fetchUsers(); // Refresh user list after adding friend
      } catch (error) {
        console.error('Failed to add friend:', error);
      }
    }
  };

  const handleRemoveFriend = async () => {
    if (selectedUser) {
      try {
        console.log('Removing friend:', selectedUser._id);
        const currentUserId = localStorage.getItem('currentUserId');
        if (!currentUserId) throw new Error('Current user ID is not available');
  
        console.log('Current user ID:', currentUserId);
  
        await axios.post('/api/friends/remove', { userId: currentUserId, friendId: selectedUser._id });
        fetchUsers(); // Refresh user list after removing friend
      } catch (error) {
        console.error('Failed to remove friend:', error);
      }
    } else {
      console.warn('No user selected for removal');
    }
  };

  return (
    <Container fluid className="vh-100 d-flex flex-column bg-grayish">
      <Row className="py-3">
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
                key={user._id}
                action
                onClick={() => selectUser(user)}
                active={selectedUser && selectedUser._id === user._id}
              >
                {user.username}
                {selectedUser && selectedUser._id === user._id && (
                  user.isFriend ? (
                    <Button
                      variant="outline-danger"
                      className="ms-2 btn-smaller btn-hover-effect"
                      onClick={() => handleRemoveFriend()}
                    >
                      Remove Friend
                    </Button>
                  ) : (
                    <Button
                      variant="outline-primary"
                      className="ms-1 btn-smaller btn-hover-effect"
                      onClick={() => handleAddFriend()}
                    >
                      Add Friend
                    </Button>
                  )
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
        <Col md={8}>
        <Chat selectedUser={selectedUser} currentUserId={localStorage.getItem('currentUserId') || ''} onSelectUser={selectUser} />
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
