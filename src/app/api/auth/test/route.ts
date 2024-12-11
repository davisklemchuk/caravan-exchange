import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json({ message: "Successfully connected to MongoDB!" });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { error: "Failed to connect to MongoDB" }, 
      { status: 500 }
    );
  }
}