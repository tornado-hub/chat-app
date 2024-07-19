import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  const { username, email, password } = await request.json();

  const client = await clientPromise;
  const db = client.db('chatapp');

  const existingUser = await db.collection('users').findOne({ email });
  if (existingUser) {
    return NextResponse.json({ message: 'User already exists' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await db.collection('users').insertOne({
    username,
    email,
    password: hashedPassword,
  });

  return NextResponse.json({ message: 'User created', userId: result.insertedId }, { status: 201 });
}