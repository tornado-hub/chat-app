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

  if (!ObjectId.isValid(userId1) || !ObjectId.isValid(userId2)) {
    return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db('chatapp');
    const messages = await db.collection('messages').find({}).toArray();
    console.log(messages);
    console.log('userId1:', userId1);
    console.log('userId2:', new ObjectId('669a10d3726146d04d034254'));
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ message: 'Failed to fetch messages' }, { status: 500 });
  }
}
