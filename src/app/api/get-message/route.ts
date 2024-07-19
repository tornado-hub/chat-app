import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId1 = searchParams.get('userId1');
  const userId2 = searchParams.get('userId2');

  if (!userId1 || !userId2) {
    return NextResponse.json({ message: 'Missing user IDs' }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db('chatapp');

  const messages = await db.collection('messages').find({
    $or: [
      { senderId: new ObjectId(userId1), receiverId: new ObjectId(userId2) },
      { senderId: new ObjectId(userId2), receiverId: new ObjectId(userId1) },
    ],
  }).sort({ timestamp: 1 }).toArray();

  return NextResponse.json(messages);
}