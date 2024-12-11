'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Transaction {
  _id: string;
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  convertedAmount: number;
  status: string;
  deliveryMethod: string;
  deliveryDate: string;
  createdAt: string;
}

interface PaymentMethod {
  _id: string;
  type: 'credit_card' | 'bank_wire';
  cardNumber?: string;
  cardExpiry?: string;
  bankName?: string;
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

interface ConversionForm {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'transactions' | 'payment' | 'addresses'>('transactions');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [grayPeriod, setGrayPeriod] = useState<number | null>(null);
  const [convertingTransaction, setConvertingTransaction] = useState<string | null>(null);
  const [conversionForm, setConversionForm] = useState<ConversionForm>({
    fromCurrency: '',
    toCurrency: '',
    amount: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch transactions
        const transactionsResponse = await fetch('/api/transactions');
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData);

        // Fetch payment methods
        const paymentResponse = await fetch('/api/user/payment-methods');
        const paymentData = await paymentResponse.json();
        setPaymentMethods(paymentData);

        // Fetch addresses
        const addressResponse = await fetch('/api/user/addresses');
        const addressData = await addressResponse.json();
        setAddresses(addressData);

        // Fetch gray period
        const grayPeriodResponse = await fetch('/api/admin/set-gray-period');
        const grayPeriodData = await grayPeriodResponse.json();
        setGrayPeriod(grayPeriodData.grayPeriod);

        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchDashboardData();
    }
  }, [session]);

  const handleCancelTransaction = async (transactionId: string) => {
    try {
      const response = await fetch(`/api/transactions/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'cancel',
          transactions: [{ transactionId }],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel transaction');
      }

      // Update the local state to remove the canceled transaction
      setTransactions(prev =>
        prev.filter(transaction => transaction._id !== transactionId)
      );
    } catch (err) {
      setError('Failed to cancel transaction');
    }
  };

  const isCancelable = (createdAt: string): boolean => {
    if (grayPeriod === null) return false;

    const transactionTime = new Date(createdAt);
    const currentTime = new Date();
    const diffInHours = (currentTime.getTime() - transactionTime.getTime()) / (1000 * 60 * 60);

    return diffInHours <= grayPeriod;
  };

  const handleDeletePaymentMethod = async (id: string) => {
    try {
      const response = await fetch(`/api/user/payment-methods?id=${id}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) throw new Error('Failed to delete payment method');
  
      setPaymentMethods((prev) => prev.filter((method) => method._id !== id));
    } catch (err) {
      setError('Failed to delete payment method');
    }
  };
  
  const handleDeleteAddress = async (id: string) => {
    try {
      const response = await fetch(`/api/user/addresses?id=${id}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) throw new Error('Failed to delete address');
  
      setAddresses((prev) => prev.filter((address) => address._id !== id));
    } catch (err) {
      setError('Failed to delete address');
    }
  };
  
  const handleConvertTransaction = async (transactionId: string) => {
    try {
      const response = await fetch('/api/transactions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'convert',
          transactions: [{
            transactionId,
            ...conversionForm
          }]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to convert transaction');
      }

      const { transaction } = await response.json();
      setTransactions(prev =>
        prev.map(t => t._id === transactionId ? transaction : t)
      );
      setConvertingTransaction(null);
    } catch (err) {
      setError('Failed to convert transaction');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 px-4">
        <div className="max-w-6xl mx-auto mt-8">
          <div className="text-xl">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 px-4">
      <div className="max-w-6xl mx-auto mt-8">
        <h1 className="text-4xl font-light text-gray-900 mb-8">Account</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-600">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 px-1 border-b-2 font-medium ${
                activeTab === 'transactions'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Transactions
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className={`py-4 px-1 border-b-2 font-medium ${
                activeTab === 'payment'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Payment Methods
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`py-4 px-1 border-b-2 font-medium ${
                activeTab === 'addresses'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Addresses
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-light text-gray-900">Transaction History</h2>
              <button
                onClick={() => router.push('/exchange')}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                New Exchange
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Exchange
                    </th>
                    <th className="py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Delivery
                    </th>
                    <th className="py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction._id}>
                      <td className="py-4 text-sm text-gray-900">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 text-sm text-gray-900">
                        {transaction.fromCurrency} → {transaction.toCurrency}
                      </td>
                      <td className="py-4 text-sm">
                        <div className="text-gray-900">
                          {transaction.amount} {transaction.fromCurrency}
                        </div>
                        <div className="text-gray-500">
                          = {transaction.convertedAmount} {transaction.toCurrency}
                        </div>
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-3 py-1 text-sm rounded-full ${
                            transaction.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : transaction.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : transaction.status === 'cancelled'
                              ? 'bg-red-100 text-red-800 border-2 border-red-600'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-gray-500">
                        <div>{transaction.deliveryMethod === 'bank' ? 'Bank Delivery' : 'In-Person'}</div>
                        <div>Due: {new Date(transaction.deliveryDate).toLocaleDateString()}</div>
                      </td>
                      <td className="py-4">
                        {transaction.status === 'pending' && isCancelable(transaction.createdAt) && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleCancelTransaction(transaction._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => setConvertingTransaction(transaction._id)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Convert
                            </button>
                          </div>
                        )}
                        {convertingTransaction === transaction._id && (
                          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <div className="bg-white p-6 rounded-lg max-w-md w-full">
                              <h3 className="text-lg font-medium mb-4">Convert Transaction</h3>
                              <p className="text-sm text-gray-500 mb-4">
                                A conversion fee of $25 will be added to your total.
                              </p>
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">
                                    New Amount
                                  </label>
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    pattern="[0-9]*\.?[0-9]*"
                                    value={conversionForm.amount === 0 ? '' : conversionForm.amount}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                        setConversionForm({
                                          ...conversionForm,
                                          amount: value === '' ? 0 : parseFloat(value)
                                        });
                                      }
                                    }}
                                    className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="Enter amount"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">
                                    New Currency
                                  </label>
                                  <select
                                    value={conversionForm.toCurrency}
                                    onChange={(e) => setConversionForm({
                                      ...conversionForm,
                                      toCurrency: e.target.value
                                    })}
                                    className="mt-1 block w-full rounded border-gray-300"
                                  >
                                    <option value="">Select Currency</option>
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="GBP">GBP</option>
                                    <option value="JPY">JPY</option>
                                  </select>
                                </div>
                              </div>
                              <div className="mt-6 flex justify-end space-x-3">
                                <button
                                  onClick={() => setConvertingTransaction(null)}
                                  className="text-gray-600 hover:text-gray-800"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleConvertTransaction(transaction._id)}
                                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                  Convert
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'payment' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-light text-gray-900">Payment Methods</h2>
                      <button
                        onClick={() => router.push('/payment/add-method')}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        Add Payment Method
                      </button>
                    </div>

                    <div className="grid gap-4">
                      {paymentMethods.map((method) => (
                        <div
                          key={method._id}
                          className="p-6 bg-white rounded-lg shadow-sm border border-gray-200"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              {method.type === 'credit_card' ? (
                                <div>
                                  <p className="text-gray-900">Credit Card ending in {method.cardNumber}</p>
                                  <p className="text-sm text-gray-500">Expires: {method.cardExpiry}</p>
                                </div>
                              ) : (
                                <div>
                                  <p className="text-gray-900">Bank Wire - {method.bankName}</p>
                                </div>
                              )}
                              {method.isDefault && (
                                <span className="text-sm text-gray-500">Default</span>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeletePaymentMethod(method._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'addresses' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-light text-gray-900">Delivery Addresses</h2>
                      <button
                        onClick={() => router.push('/payment/add-address')}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        Add Address
                      </button>
                    </div>

                    <div className="grid gap-4">
                      {addresses.map((address) => (
                        <div
                          key={address._id}
                          className="p-6 bg-white rounded-lg shadow-sm border border-gray-200"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-gray-900">{address.street}</p>
                              <p className="text-sm text-gray-500">
                                {address.city}, {address.state} {address.postalCode}
                              </p>
                              <p className="text-sm text-gray-500">{address.country}</p>
                              {address.isDefault && (
                                <span className="text-sm text-gray-500">Default</span>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteAddress(address._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        } 