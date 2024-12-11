import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'vendor') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const vendor = await User.findOne({ email: session.user.email });
    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Add logging to debug
    console.log('Fetching transactions for vendor:', vendor._id);

    // Fetch transactions where this vendor was selected
    const transactions = await Transaction.find({ vendorId: vendor._id })
      .populate('userId', 'email firstName lastName')
      .populate('paymentMethod', 'type cardNumber bankName')
      .populate('deliveryAddress', 'street city state postalCode country')
      .sort({ createdAt: -1 });

    // Log the found transactions
    console.log('Found transactions:', transactions.length);
    console.log('Transaction IDs:', transactions.map(t => t._id));

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching vendor transactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 