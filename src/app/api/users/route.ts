import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('chatapp');

    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const friends = await db.collection('users').find({ _id: { $in: user.friends.map(id => new ObjectId(id)) } }).toArray();
    return NextResponse.json(friends);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}
