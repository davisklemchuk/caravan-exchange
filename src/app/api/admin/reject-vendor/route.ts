import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { vendorId, rejectionReason } = await req.json();

    if (!vendorId || !rejectionReason) {
      return NextResponse.json(
        { error: 'Vendor ID and rejection reason are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Update vendor status to rejected and add rejection reason
    const updatedVendor = await User.findByIdAndUpdate(
      vendorId,
      { 
        status: 'rejected',
        rejectionReason 
      },
      { new: true }
    );

    if (!updatedVendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Vendor rejected successfully' });
  } catch (error) {
    console.error('Error rejecting vendor:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 