import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const {
      firstName,
      lastName,
      middleInitial,
      mailingAddress,
      phoneNumber,
      creditCard,
      username,
      email,
      password,
      role,
    } = await req.json();

    // Validate all fields
    if (
      !firstName ||
      !lastName ||
      !mailingAddress ||
      !phoneNumber ||
      !creditCard ||
      !username ||
      !email ||
      !password ||
      !role
    ) {
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      middleInitial,
      mailingAddress,
      phoneNumber,
      creditCard,
      username,
      email,
      password,
      role,
    });

    return NextResponse.json(
      { message: 'User created successfully', userId: user._id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
