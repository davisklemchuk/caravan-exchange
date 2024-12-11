'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useShoppingCart } from '../../../context/ShoppingCartContext';

interface PaymentMethod {
  _id: string;
  type: 'credit_card' | 'bank_wire';
  cardNumber?: string;
  cardExpiry?: string;
  cardHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  isDefault: boolean;
}

interface Address {
  _id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface SelectedVendor {
  cartItemId: string;
  vendorId: string;
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  convertedAmount: number;
}

export default function PaymentPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { cart, clearCart } = useShoppingCart();
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>('');
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [deliveryMethod, setDeliveryMethod] = useState<'bank' | 'in_person'>('bank');
  const [selectedVendors, setSelectedVendors] = useState<SelectedVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getDeliveryDate = (method: 'bank' | 'in_person') => {
    const date = new Date();
    date.setDate(date.getDate() + (method === 'bank' ? 1 : 7));
    return date;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const paymentResponse = await fetch('/api/user/payment-methods');
        const paymentData = await paymentResponse.json();
        setPaymentMethods(paymentData);
        
        const defaultPayment = paymentData.find((p: PaymentMethod) => p.isDefault);
        if (defaultPayment) setSelectedPaymentId(defaultPayment._id);

        const addressResponse = await fetch('/api/user/addresses');
        const addressData = await addressResponse.json();
        setAddresses(addressData);
        
        const defaultAddress = addressData.find((a: Address) => a.isDefault);
        if (defaultAddress) setSelectedAddressId(defaultAddress._id);

        const storedVendors = localStorage.getItem('selectedVendors');
        if (storedVendors) {
          setSelectedVendors(JSON.parse(storedVendors));
        }

        setLoading(false);
      } catch (err) {
        setError('Failed to load user data');
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchUserData();
    }
  }, [session]);

  const handleSubmit = async () => {
    try {
      if (selectedVendors.length === 0) {
        setError('No vendors selected');
        return;
      }

      const transactions = selectedVendors.map(vendor => ({
        vendorId: vendor.vendorId,
        fromCurrency: vendor.fromCurrency,
        toCurrency: vendor.toCurrency,
        amount: vendor.amount,
        convertedAmount: vendor.convertedAmount,
        paymentMethod: selectedPaymentId,
        deliveryAddress: selectedAddressId,
        deliveryMethod: deliveryMethod,
        deliveryDate: getDeliveryDate(deliveryMethod).toISOString(),
      }));

      const response = await fetch('/api/transactions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions, action: 'create' })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || 'Failed to process payment');
      }

      clearCart();
      localStorage.removeItem('selectedVendors');
      
      router.push('/payment/success');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process payment. Please try again.';
      setError(errorMessage);
    }
    
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="text-xl">Loading payment options...</div>
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
            onClick={() => router.push('/checkout')}
            className="text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            ← Back to Vendor Selection
          </button>
          <h1 className="text-3xl font-bold">Payment Details</h1>
          <div className="w-24"></div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div
                  key={method._id}
                  className={`p-4 border rounded-lg cursor-pointer ${
                    selectedPaymentId === method._id ? 'border-indigo-500 bg-indigo-50' : 'hover:border-gray-400'
                  }`}
                  onClick={() => setSelectedPaymentId(method._id)}
                >
                  <div className="flex justify-between">
                    <div>
                      {method.type === 'credit_card' ? (
                        <p>Credit Card ending in {method.cardNumber}</p>
                      ) : (
                        <p>Bank Wire - {method.bankName}</p>
                      )}
                    </div>
                    {method.isDefault && (
                      <span className="text-sm text-gray-500">Default</span>
                    )}
                  </div>
                </div>
              ))}
              <button
                onClick={() => router.push('/payment/add-method')}
                className="text-indigo-600 hover:text-indigo-800"
              >
                + Add New Payment Method
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
            <div className="space-y-4">
              {addresses.map((address) => (
                <div
                  key={address._id}
                  className={`p-4 border rounded-lg cursor-pointer ${
                    selectedAddressId === address._id ? 'border-indigo-500 bg-indigo-50' : 'hover:border-gray-400'
                  }`}
                  onClick={() => setSelectedAddressId(address._id)}
                >
                  <div className="flex justify-between">
                    <div>
                      <p>{address.street}</p>
                      <p className="text-sm text-gray-600">
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                      <p className="text-sm text-gray-600">{address.country}</p>
                    </div>
                    {address.isDefault && (
                      <span className="text-sm text-gray-500">Default</span>
                    )}
                  </div>
                </div>
              ))}
              <button
                onClick={() => router.push('/payment/add-address')}
                className="text-indigo-600 hover:text-indigo-800"
              >
                + Add New Address
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Delivery Method</h2>
            <div className="space-y-4">
              <div
                className={`p-4 border rounded-lg cursor-pointer ${
                  deliveryMethod === 'bank' ? 'border-indigo-500 bg-indigo-50' : 'hover:border-gray-400'
                }`}
                onClick={() => setDeliveryMethod('bank')}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Bank Delivery</p>
                    <p className="text-sm text-gray-600">Delivery in 1 business day</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    Estimated: {getDeliveryDate('bank').toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div
                className={`p-4 border rounded-lg cursor-pointer ${
                  deliveryMethod === 'in_person' ? 'border-indigo-500 bg-indigo-50' : 'hover:border-gray-400'
                }`}
                onClick={() => setDeliveryMethod('in_person')}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">In-Person Delivery</p>
                    <p className="text-sm text-gray-600">Delivery within 1 week</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    Estimated: {getDeliveryDate('in_person').toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-4">
              {selectedVendors.map((vendor) => (
                <div key={vendor.cartItemId} className="flex justify-between py-2 border-b">
                  <div>
                    <p>
                      {vendor.amount} {vendor.fromCurrency} to {vendor.toCurrency}
                    </p>
                    <p className="text-sm text-gray-600">
                      Converted Amount: {vendor.convertedAmount.toFixed(2)} {vendor.toCurrency}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!selectedPaymentId || !selectedAddressId}
              className={`px-6 py-3 rounded-lg font-semibold text-white ${
                selectedPaymentId && selectedAddressId
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Complete Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
