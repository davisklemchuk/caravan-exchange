import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
import PaymentMethod from '@/models/PaymentMethod';
import Address from '@/models/Address';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Ensure all models are loaded
    await Promise.all([
      import('@/models/PaymentMethod'),
      import('@/models/Address')
    ]);

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get all transactions for the user, sorted by creation date (newest first)
    const transactions = await Transaction.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .populate('paymentMethod', 'type cardNumber bankName')
      .populate('deliveryAddress', 'street city state postalCode country');

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 