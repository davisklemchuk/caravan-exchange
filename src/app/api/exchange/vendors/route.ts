import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import VendorProfile from '@/models/VendorProfile';

export async function POST(req: Request) {
  try {
    const { fromCurrency, toCurrency, amount } = await req.json();
    console.log('Searching for vendors with:', { fromCurrency, toCurrency, amount });

    if (!fromCurrency || !toCurrency || !amount) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get base exchange rate from ExchangeRate-API
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    const rateResponse = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${fromCurrency}/${toCurrency}`
    );

    if (!rateResponse.ok) {
      throw new Error('Failed to fetch base exchange rate');
    }

    const rateData = await rateResponse.json();
    const baseRate = rateData.conversion_rate;
    console.log('Base rate:', baseRate);

    await dbConnect();

    // First, let's find all vendors and log their inventory
    const allVendors = await VendorProfile.find({}).select('businessName inventory userId');
    console.log('All vendors:', JSON.stringify(allVendors, null, 2));

    // Find vendors who have the target currency (toCurrency) in their inventory
    const vendors = await VendorProfile.find({
      isProfileComplete: true,
      inventory: {
        $elemMatch: { 
          currency: toCurrency,
          amount: { $gte: amount * baseRate }
        }
      }
    }).select('businessName inventory userId');

    console.log('Matching vendors:', JSON.stringify(vendors, null, 2));

    // Calculate final rates with markups for each vendor
    const vendorRates = vendors.map((vendor) => {
      const toCurrencyInfo = vendor.inventory.find(
        (i: { currency: string }) => i.currency === toCurrency
      );
      
      const effectiveRate = baseRate * (1 + (toCurrencyInfo?.markup || 0));
      
      const vendorRate = {
        vendorId: vendor.userId,
        businessName: vendor.businessName,
        baseRate,
        finalRate: effectiveRate,
        toCurrencyAvailable: toCurrencyInfo?.amount || 0,
        markup: {
          to: toCurrencyInfo?.markup || 0
        }
      };

      console.log('Vendor rate calculated:', vendorRate);
      return vendorRate;
    });

    vendorRates.sort((a, b) => a.finalRate - b.finalRate);

    return NextResponse.json({
      baseRate,
      vendors: vendorRates
    });
  } catch (error) {
    console.error('Error fetching vendor rates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 