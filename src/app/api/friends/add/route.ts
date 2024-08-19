import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';
export async function POST(request: NextRequest) {
  try {
    const { userId, friendId } = await request.json();
    
    const client = await clientPromise;
    const db = client.db('chatapp');

    // Add friendId to userId's friends list
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $addToSet: { friends: friendId } }
    );

    // Add userId to friendId's friends list
    await db.collection('users').updateOne(
      { _id: new ObjectId(friendId) },
      { $addToSet: { friends: userId } }
    );

    return NextResponse.json({ message: 'Friend added' }, { status: 200 });
  } catch (error) {
    console.error('Failed to add friend:', error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}
