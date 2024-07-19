import React from 'react';
import Chat from '../../../components/Chats';
import { useParams } from 'next/navigation';

export default function ChatPage() {
  const params = useParams();
  const otherUserId = params.userId as string;
  const currentUserId = 'current-user-id'; // Replace with actual logic to get the current user's ID

  return (
    <div>
      <h1>Chat with User {otherUserId}</h1>
      <Chat currentUserId={currentUserId} otherUserId={otherUserId} />
    </div>
  );
}
