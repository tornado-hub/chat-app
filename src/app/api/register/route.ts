import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  const client = await clientPromise;
  const db = client.db('chatapp');

  // Check if the username already exists
  const existingUser = await db.collection('users').findOne({ username });
  if (existingUser) {
    return NextResponse.json({ message: 'Username already taken' }, { status: 400 });
  }

  // Hash the password before storing it
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await db.collection('users').insertOne({
    username,
    password: hashedPassword,
  });

  return NextResponse.json({ message: 'User created', userId: result.insertedId }, { status: 201 });
}
