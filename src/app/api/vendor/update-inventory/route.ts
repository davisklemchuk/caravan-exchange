import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import VendorProfile from '@/models/VendorProfile';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'vendor') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { inventory } = await req.json();

    if (!Array.isArray(inventory)) {
      return NextResponse.json(
        { error: 'Invalid inventory data' },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Update vendor profile with new inventory
    const updatedProfile = await VendorProfile.findOneAndUpdate(
      { userId: user._id },
      { 
        inventory,
        lastUpdated: new Date(),
        isProfileComplete: true
      },
      { new: true }
    );

    if (!updatedProfile) {
      return NextResponse.json(
        { error: 'Vendor profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Inventory updated successfully',
      inventory: updatedProfile.inventory
    });

  } catch (error) {
    console.error('Error updating inventory:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 