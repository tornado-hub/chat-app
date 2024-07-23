import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('chatapp');

    const users = await db.collection('users').find().toArray();
    return NextResponse.json(users);
  } 
  catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'An error occurred while fetching users' }, { status: 500 });
  }
}

