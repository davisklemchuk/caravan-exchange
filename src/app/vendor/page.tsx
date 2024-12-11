'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import TransactionFulfillmentModal from '../components/TransactionFulfillmentModal';

interface Transaction {
  _id: string;
  userId: {
    email?: string;
    firstName?: string;
    lastName?: string;
  };
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  convertedAmount: number;
  status: string;
  deliveryMethod: string;
  deliveryDate: string;
  createdAt: string;
  paymentMethod?: {
    type: string;
    cardNumber?: string;
    bankName?: string;
  };
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

interface VendorProfile {
  businessName: string;
  description: string;
  inventory: Array<{
    currency: string;
    amount: number;
    markup: number;
  }>;
}

export default function VendorDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'transactions' | 'profile' | 'inventory'>('transactions');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const transactionsResponse = await fetch('/api/vendor/transactions');
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData);

        const profileResponse = await fetch('/api/vendor/profile');
        const profileData = await profileResponse.json();
        setProfile(profileData);

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

  const handleFulfillTransaction = async (transactionId: string, signature: string) => {
    try {
      const response = await fetch('/api/vendor/fulfill-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactionId, signature }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fulfill transaction');
      }

      setTransactions(prevTransactions =>
        prevTransactions.map(t =>
          t._id === transactionId
            ? { ...t, status: 'completed' }
            : t
        )
      );

      const profileResponse = await fetch('/api/vendor/profile');
      const profileData = await profileResponse.json();
      setProfile(profileData);

      setSelectedTransaction(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fulfill transaction');
    }
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-4xl font-light text-gray-900 mb-8">Vendor Dashboard</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-600">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 px-1 border-b-2 font-medium ${activeTab === 'transactions' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Transactions
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium ${activeTab === 'profile' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Business Profile
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`py-4 px-1 border-b-2 font-medium ${activeTab === 'inventory' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Inventory
            </button>
          </nav>
        </div>

        {/* Search Input */}
        {activeTab === 'transactions' && (
          <div className="mb-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Transaction ID"
              className="px-4 py-2 w-full border border-gray-300 rounded-md"
            />
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-light text-gray-900">Customer Transactions</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Customer
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction._id}>
                      <td className="py-4 text-sm text-gray-900">{transaction._id}</td>
                      <td className="py-4 text-sm text-gray-900">
                        <div>
                          {transaction.userId?.firstName || 'N/A'} {transaction.userId?.lastName || ''}
                        </div>
                        <div className="text-gray-500">{transaction.userId?.email || 'No email'}</div>
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
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 text-sm rounded-full ${transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {transaction.status}
                          </span>
                          {transaction.status === 'pending' && (
                            <button
                              onClick={() => setSelectedTransaction(transaction)}
                              className="text-indigo-600 hover:text-indigo-800 text-sm"
                            >
                              Fulfill
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-4 text-sm">
                        <div>{transaction.deliveryMethod === 'bank' ? 'Bank Delivery' : 'In-Person'}</div>
                        <div>Due: {new Date(transaction.deliveryDate).toLocaleDateString()}</div>
                        {transaction.deliveryAddress ? (
                          <div className="text-gray-500">
                            {transaction.deliveryAddress.street}, {transaction.deliveryAddress.city}
                          </div>
                        ) : (
                          <div className="text-gray-500">No delivery address provided</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-light text-gray-900">Business Profile</h2>
              <button
                onClick={() => router.push('/vendor/edit-profile')}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Edit Profile
              </button>
            </div>

            {profile && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-medium mb-4">{profile.businessName}</h3>
                <p className="text-gray-600 mb-4">{profile.description}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-light text-gray-900">Currency Inventory</h2>
              <button
                onClick={() => router.push('/vendor/edit-inventory')}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Update Inventory
              </button>
            </div>

            {profile?.inventory && (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {profile.inventory.map((item, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium mb-2">{item.currency}</h3>
                    <p className="text-gray-600">Amount: {item.amount}</p>
                    <p className="text-gray-600">Markup: {(item.markup * 100).toFixed(2)}%</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedTransaction && (
          <TransactionFulfillmentModal
            transaction={selectedTransaction}
            onClose={() => setSelectedTransaction(null)}
            onFulfill={handleFulfillTransaction}
          />
        )}
      </div>
    </div>
  );
}
