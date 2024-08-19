// src/components/Chat.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import io from 'socket.io-client';

const socket = io();

interface Message {
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
}

interface User {
  _id: string;
  username: string;
}

interface ChatProps {
  selectedUser: User | null;
  currentUserId: string | null;
}

const Chat: React.FC<ChatProps> = ({ selectedUser, currentUserId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!selectedUser || !currentUserId) return;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('newMessage', (message: Message) => {
      if (
        (message.senderId === currentUserId && message.receiverId === selectedUser._id) ||
        (message.senderId === selectedUser._id && message.receiverId === currentUserId)
      ) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    const fetchMessages = async () => {
      try {
        const response = await axios.get(`/api/get-message?userId1=${currentUserId}&userId2=${selectedUser._id}`);
        setMessages(response.data);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    };

    fetchMessages();

    return () => {
      socket.off('newMessage');
    };
  }, [selectedUser, currentUserId]);

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
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

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId || !selectedUser) return;

    try {
      const messageData: Message = {
        senderId: currentUserId,
        receiverId: selectedUser._id,
        content: message,
        timestamp: new Date().toISOString(),
      };

      await axios.post('/api/send-message', messageData);
      socket.emit('sendMessage', messageData);
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <>
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
    </>
  );
};

export default Chat;
