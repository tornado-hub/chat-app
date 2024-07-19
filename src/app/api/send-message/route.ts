import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  const { senderId, receiverId, content } = await request.json();

  const client = await clientPromise;
  const db = client.db('chatapp');

  const result = await db.collection('messages').insertOne({
    senderId: new ObjectId(senderId),
    receiverId: new ObjectId(receiverId),
    content,
    timestamp: new Date(),
  });

  return NextResponse.json({ message: 'Message sent', messageId: result.insertedId }, { status: 201 });
}