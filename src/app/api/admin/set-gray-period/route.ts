import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route'; // Adjust the import path as needed
import dbConnect from '@/lib/mongodb'; // Assuming dbConnect is a helper to connect to MongoDB
import GrayPeriod from '@/models/GrayPeriod'; // Assuming you have a GrayPeriod model

// Handle PUT requests to update the gray period
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { grayPeriod } = await req.json();

    if (typeof grayPeriod !== 'number') {
      return NextResponse.json({ error: 'Gray period must be a number' }, { status: 400 });
    }

    await dbConnect();

    // Assuming you have a GrayPeriod collection or model
    const updatedGrayPeriod = await GrayPeriod.findOneAndUpdate(
      {}, // Assuming there is only one document storing the gray period
      { $set: { grayPeriod } },
      { new: true, upsert: true } // Create the document if it doesn't exist
    );

    if (!updatedGrayPeriod) {
      return NextResponse.json({ error: 'Failed to update gray period' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Gray period updated successfully', grayPeriod: updatedGrayPeriod.grayPeriod });
  } catch (error) {
    console.error('Error updating gray period:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle GET requests to fetch the current gray period
export async function GET() {
  try {
    await dbConnect();

    // Assuming there's only one document holding the gray period
    const grayPeriodData = await GrayPeriod.findOne({});

    if (!grayPeriodData) {
      return NextResponse.json({ error: 'Gray period not found' }, { status: 404 });
    }

    return NextResponse.json({ grayPeriod: grayPeriodData.grayPeriod });
  } catch (error) {
    console.error('Error fetching gray period:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
