'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Transaction {
  _id: string;
  userId: {
    email: string;
    firstName: string;
    lastName: string;
  };
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  convertedAmount: number;
  status: string;
  deliveryMethod: string;
  deliveryDate: string;
  createdAt: string;
  paymentMethod: {
    type: string;
    cardNumber?: string;
    bankName?: string;
  };
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export default function VendorTransactionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/vendor/transactions');
        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }
        const data = await response.json();
        setTransactions(data);
      } catch (err) {
        setError('Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchTransactions();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="min-h-screen pt-16 px-4">
        <div className="max-w-6xl mx-auto mt-8">
          <div className="text-xl">Loading transactions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 px-4">
      <div className="max-w-6xl mx-auto mt-8">
        <h1 className="text-4xl font-light text-gray-900 mb-8">Customer Transactions</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-600">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
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
              {transactions.map((transaction) => (
                <tr key={transaction._id}>
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
                    <span className={`px-3 py-1 text-sm rounded-full ${
                      transaction.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : transaction.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {transaction.status}
                    </span>
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
    </div>
  );
} 