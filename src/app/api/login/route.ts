import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('chatapp');

    // Find the user by username
    const user = await db.collection('users').findOne({ username });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 400 });
    }

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '1d' });

    // Return the token and user information
    return NextResponse.json({ token, userId: user._id, username: user.username });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'An error occurred during login' }, { status: 500 });
  }
}
