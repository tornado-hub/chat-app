'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
}

interface ChatProps {
  currentUserId: string;
  otherUserId: string;
}

const socket = io();

const Chat: React.FC<ChatProps> = ({ currentUserId, otherUserId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchMessages();

    socket.on('newMessage', (message: Message) => {
      if (
        (message.senderId === currentUserId && message.receiverId === otherUserId) ||
        (message.senderId === otherUserId && message.receiverId === currentUserId)
      ) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    return () => {
      socket.off('newMessage');
    };
  }, [currentUserId, otherUserId]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`/api/get-messages?userId1=${currentUserId}&userId2=${otherUserId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const message = {
        senderId: currentUserId,
        receiverId: otherUserId,
        content: newMessage,
        timestamp: new Date().toISOString(),
      };

      await axios.post('/api/send-message', message);
      socket.emit('sendMessage', message);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div>
      <div>
        {messages.map((message) => (
          <div key={message._id}>
            <p>{message.content}</p>
            <small>{new Date(message.timestamp).toLocaleString()}</small>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;
