import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import VendorProfile from '@/models/VendorProfile';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      businessName,
      description,
      initialInventory
    } = await req.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !phoneNumber || !businessName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create vendor user account
    const vendor = await User.create({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      username: email, // Using email as username
      role: 'vendor',
      status: 'approved', // Auto-approve since admin is creating
      mailingAddress: 'N/A', // Required by schema but not needed for vendor
      creditCard: 'N/A', // Required by schema but not needed for vendor
    });

    // Create vendor profile
    const vendorProfile = await VendorProfile.create({
      userId: vendor._id,
      businessName,
      description: description || `${businessName} - Currency Exchange Services`,
      inventory: initialInventory || [],
      isProfileComplete: true
    });

    return NextResponse.json({
      message: 'Vendor account created successfully',
      vendor: {
        id: vendor._id,
        email: vendor.email,
        businessName: vendorProfile.businessName
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating vendor account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 