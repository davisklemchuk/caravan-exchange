import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
import VendorProfile from '@/models/VendorProfile';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  const session = mongoose.startSession();

  try {
    const authSession = await getServerSession(authOptions);

    if (!authSession?.user || authSession.user.role !== 'vendor') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { transactionId, signature } = await req.json();

    if (!transactionId || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await dbConnect();
    (await session).startTransaction();

    const vendor = await User.findOne({ email: authSession.user.email });
    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Get the transaction details
    const transaction = await Transaction.findOne({
      _id: transactionId,
      vendorId: vendor._id,
      status: 'pending'
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found or already fulfilled' },
        { status: 404 }
      );
    }

    // Get vendor profile and check inventory
    const vendorProfile = await VendorProfile.findOne({ userId: vendor._id });
    if (!vendorProfile) {
      return NextResponse.json(
        { error: 'Vendor profile not found' },
        { status: 404 }
      );
    }

    // Find the relevant currencies in inventory
    const fromCurrencyInventory = vendorProfile.inventory.find(
      item => item.currency === transaction.fromCurrency
    );
    const toCurrencyInventory = vendorProfile.inventory.find(
      item => item.currency === transaction.toCurrency
    );

    if (!fromCurrencyInventory || !toCurrencyInventory) {
      await (await session).abortTransaction();
      return NextResponse.json(
        { error: 'Currency not found in inventory' },
        { status: 400 }
      );
    }

    // Check if vendor has enough of the currency to fulfill
    if (toCurrencyInventory.amount < transaction.convertedAmount) {
      await (await session).abortTransaction();
      return NextResponse.json(
        { error: 'Insufficient currency in inventory' },
        { status: 400 }
      );
    }

    // Update inventory amounts
    await VendorProfile.updateOne(
      { 
        userId: vendor._id,
        'inventory.currency': transaction.fromCurrency 
      },
      { 
        $inc: { 'inventory.$.amount': transaction.amount }
      }
    );

    await VendorProfile.updateOne(
      { 
        userId: vendor._id,
        'inventory.currency': transaction.toCurrency 
      },
      { 
        $inc: { 'inventory.$.amount': -transaction.convertedAmount }
      }
    );

    // Update transaction status
    const updatedTransaction = await Transaction.findOneAndUpdate(
      { _id: transactionId },
      { 
        status: 'completed',
        fulfillmentSignature: signature,
        fulfilledAt: new Date()
      },
      { new: true }
    );

    await (await session).commitTransaction();
    return NextResponse.json(updatedTransaction);

  } catch (error) {
    await (await session).abortTransaction();
    console.error('Error fulfilling transaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    (await session).endSession();
  }
} 