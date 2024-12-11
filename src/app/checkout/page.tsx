'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useShoppingCart } from '../../../context/ShoppingCartContext';

interface VendorOption {
  vendorId: string;
  businessName: string;
  baseRate: number;
  finalRate: number;
  fromCurrencyAvailable: number;
  toCurrencyAvailable: number;
  markup: {
    from: number;
    to: number;
  };
}

interface ExchangeWithVendors {
  cartItemId: string;
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  convertedAmount: number;
  vendors: VendorOption[];
  selectedVendorId?: string;
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { cart, removeFromCart } = useShoppingCart();
  const [exchangeOptions, setExchangeOptions] = useState<ExchangeWithVendors[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (cart.length === 0) {
      router.push('/cart');
    }
  }, [status, cart, router]);

  useEffect(() => {
    const fetchVendorsForCart = async () => {
      setLoading(true);
      setError(null);

      try {
        const vendorPromises = cart.map(async (item) => {
          const response = await fetch('/api/exchange/vendors', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fromCurrency: item.fromCurrency,
              toCurrency: item.toCurrency,
              amount: item.amount,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to fetch vendors');
          }

          const data = await response.json();
          return {
            cartItemId: item.id,
            fromCurrency: item.fromCurrency,
            toCurrency: item.toCurrency,
            amount: item.amount,
            convertedAmount: item.convertedAmount,
            vendors: data.vendors,
          };
        });

        const results = await Promise.all(vendorPromises);
        setExchangeOptions(results);
      } catch (err) {
        setError('Failed to fetch vendor options. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (cart.length > 0) {
      fetchVendorsForCart();
    }
  }, [cart]);

  const handleVendorSelect = (exchangeId: string, vendorId: string) => {
    setExchangeOptions((prev) =>
      prev.map((exchange) =>
        exchange.cartItemId === exchangeId
          ? { ...exchange, selectedVendorId: vendorId }
          : exchange
      )
    );
  };

  const handleRemoveFromCart = (cartItemId: string) => {
    removeFromCart(cartItemId);
    setExchangeOptions((prev) =>
      prev.filter((exchange) => exchange.cartItemId !== cartItemId)
    );
  };

  const handleCheckout = () => {
    const selectedVendorsData = exchangeOptions.map((exchange) => ({
      cartItemId: exchange.cartItemId,
      vendorId: exchange.selectedVendorId,
      amount: exchange.amount,
      fromCurrency: exchange.fromCurrency,
      toCurrency: exchange.toCurrency,
      convertedAmount:
        exchange.vendors.find((v) => v.vendorId === exchange.selectedVendorId)
          ?.finalRate! * exchange.amount,
    }));

    localStorage.setItem('selectedVendors', JSON.stringify(selectedVendorsData));

    router.push('/payment');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="text-xl">Loading available vendors...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => router.push('/cart')}
            className="text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            ← Back to Cart
          </button>
          <h1 className="text-3xl font-bold">Choose Vendors</h1>
          <div className="w-24"></div>
        </div>

        {exchangeOptions.map((exchange) => (
          <div key={exchange.cartItemId} className="mb-8 bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between">
              <h2 className="text-xl font-semibold mb-4">
                Exchange {exchange.amount} {exchange.fromCurrency} to{' '}
                {exchange.toCurrency}
              </h2>
              <button
                onClick={() => handleRemoveFromCart(exchange.cartItemId)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>

            {exchange.vendors.length === 0 ? (
              <p className="text-red-500">
                No vendors available for this exchange. Please modify your request or try again later.
              </p>
            ) : (
              <div className="space-y-4">
                {exchange.vendors.map((vendor) => (
                  <div
                    key={vendor.vendorId}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      exchange.selectedVendorId === vendor.vendorId
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() => handleVendorSelect(exchange.cartItemId, vendor.vendorId)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{vendor.businessName}</h3>
                        <p className="text-sm text-gray-600">
                          Rate: 1 {exchange.fromCurrency} ={' '}
                          {vendor.finalRate.toFixed(4)} {exchange.toCurrency}
                        </p>
                        <p className="text-sm text-gray-600">
                          Markup: {((vendor.markup.from + vendor.markup.to) * 100).toFixed(2)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          Available: {vendor.fromCurrencyAvailable} {exchange.fromCurrency}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleCheckout}
            disabled={!exchangeOptions.every((ex) => ex.selectedVendorId)}
            className={`px-6 py-3 rounded-lg font-semibold text-white ${
              exchangeOptions.every((ex) => ex.selectedVendorId)
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
}
