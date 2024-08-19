
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';
// src/app/api/friends/remove/route.ts

interface RemoveFriendRequest {
    userId: string;
    friendId: string;
  }
  
  interface ApiResponse {
    message: string;
  }
  interface User {
    _id: ObjectId;
    username: string;
    friends: string[]; // Array of friend IDs
  }
export async function POST(request: NextRequest) {
  try {
    const { userId, friendId } = await request.json();
    
    const client = await clientPromise;
    const db = client.db('chatapp');

    // Remove friendId from userId's friends list
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $pull: { friends: friendId } }
    );

    // Remove userId from friendId's friends list
    await db.collection('users').updateOne(
      { _id: new ObjectId(friendId) },
      { $pull: { friends: userId } }
    );

    return NextResponse.json({ message: 'Friend removed' }, { status: 200 });
  } catch (error) {
    console.error('Failed to remove friend:', error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}
