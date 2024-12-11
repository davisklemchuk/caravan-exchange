import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
import PaymentMethod from '@/models/PaymentMethod';
import Address from '@/models/Address';

const GRAY_PERIOD_HOURS = 24; // Define the gray period (in hours)
const CONVERSION_FEE = 25; // $25 conversion fee

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Extract and validate the data from the request
    const { transactions, action } = await req.json();

    // Check if the action is valid
    if (!['create', 'cancel', 'convert'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    // Validate transactions data
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json(
        { error: 'Invalid transactions data' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Process the action based on the `action` parameter
    if (action === 'create') {
      return createTransactions(user, transactions);
    } else if (action === 'cancel') {
      // Assuming `transactionId` is provided in each transaction object for cancel action
      const transactionId = transactions[0]?.transactionId;
      if (!transactionId) {
        return NextResponse.json(
          { error: 'Transaction ID is required for cancel action' },
          { status: 400 }
        );
      }
      return cancelTransaction(user, transactionId);
    } else if (action === 'convert') {
      return convertTransaction(user, transactions[0]);
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in transactions route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to create transactions
const createTransactions = async (user: any, transactions: any) => {
  const paymentMethod = await PaymentMethod.findOne({
    _id: transactions[0].paymentMethod,
    userId: user._id
  });

  if (!paymentMethod) {
    return NextResponse.json(
      { error: 'Invalid payment method' },
      { status: 400 }
    );
  }

  const address = await Address.findOne({
    _id: transactions[0].deliveryAddress,
    userId: user._id
  });

  if (!address) {
    return NextResponse.json(
      { error: 'Invalid delivery address' },
      { status: 400 }
    );
  }

  const createdTransactions = await Promise.all(
    transactions.map(async (transaction: any) => {
      const newTransaction = new Transaction({
        userId: user._id,
        vendorId: transaction.vendorId,
        fromCurrency: transaction.fromCurrency,
        toCurrency: transaction.toCurrency,
        amount: transaction.amount,
        convertedAmount: transaction.convertedAmount,
        exchangeRate: transaction.convertedAmount / transaction.amount,
        paymentMethod: transaction.paymentMethod,
        deliveryAddress: transaction.deliveryAddress,
        deliveryMethod: transaction.deliveryMethod,
        deliveryDate: transaction.deliveryDate,
        status: 'pending',
      });

      const savedTransaction = await newTransaction.save();
      return savedTransaction;
    })
  );

  return NextResponse.json(createdTransactions);
};

// Helper function to cancel a transaction
const cancelTransaction = async (user: any, transactionId: string) => {
  const transaction = await Transaction.findOne({ _id: transactionId, userId: user._id });

  if (!transaction) {
    return NextResponse.json(
      { error: 'Transaction not found or not authorized' },
      { status: 404 }
    );
  }

  // Check if the transaction is within the gray period
  const transactionTime = new Date(transaction.createdAt);
  const currentTime = new Date();
  const diffInHours = (currentTime.getTime() - transactionTime.getTime()) / (1000 * 60 * 60);

  if (diffInHours > GRAY_PERIOD_HOURS) {
    return NextResponse.json(
      { error: `Transaction cannot be canceled after ${GRAY_PERIOD_HOURS} hours` },
      { status: 400 }
    );
  }

  // Update the transaction status to 'cancelled'
  transaction.status = 'cancelled';
  await transaction.save();

  return NextResponse.json({ message: 'Transaction canceled successfully' });
};

// New helper function to convert a transaction
const convertTransaction = async (user: any, conversionData: any) => {
  const { transactionId, fromCurrency, toCurrency, amount } = conversionData;

  // Find the original transaction
  const transaction = await Transaction.findOne({ 
    _id: transactionId, 
    userId: user._id,
    status: 'pending'
  });

  if (!transaction) {
    return NextResponse.json(
      { error: 'Transaction not found or not eligible for conversion' },
      { status: 404 }
    );
  }

  // Check if within gray period
  const transactionTime = new Date(transaction.createdAt);
  const currentTime = new Date();
  const diffInHours = (currentTime.getTime() - transactionTime.getTime()) / (1000 * 60 * 60);

  if (diffInHours > GRAY_PERIOD_HOURS) {
    return NextResponse.json(
      { error: `Transaction cannot be converted after ${GRAY_PERIOD_HOURS} hours` },
      { status: 400 }
    );
  }

  // Get current exchange rate
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  const rateResponse = await fetch(
    `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${fromCurrency}/${toCurrency}`
  );

  if (!rateResponse.ok) {
    return NextResponse.json(
      { error: 'Failed to fetch exchange rate' },
      { status: 500 }
    );
  }

  const rateData = await rateResponse.json();
  const convertedAmount = amount * rateData.conversion_rate;

  // Save the original transaction details to history
  transaction.conversionHistory.push({
    fromCurrency: transaction.fromCurrency,
    toCurrency: transaction.toCurrency,
    amount: transaction.amount,
    convertedAmount: transaction.convertedAmount,
    conversionFee: transaction.conversionFee,
    convertedAt: new Date()
  });

  // Update transaction with new values
  transaction.fromCurrency = fromCurrency;
  transaction.toCurrency = toCurrency;
  transaction.amount = amount;
  transaction.convertedAmount = convertedAmount;
  transaction.conversionFee = (transaction.conversionFee || 0) + CONVERSION_FEE;
  transaction.exchangeRate = rateData.conversion_rate;

  await transaction.save();

  return NextResponse.json({
    message: 'Transaction converted successfully',
    transaction: {
      ...transaction.toObject(),
      conversionFee: CONVERSION_FEE
    }
  });
};
