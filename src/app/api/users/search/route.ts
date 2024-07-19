// src/app/api/users/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ message: 'Username query parameter is required' }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db('chatapp');

  // Find users with a username that matches the search query
  const users = await db.collection('users').find({ username: { $regex: username, $options: 'i' } }).toArray();

  return NextResponse.json(users);
}
