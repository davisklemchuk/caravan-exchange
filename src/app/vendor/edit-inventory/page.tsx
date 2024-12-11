'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getAvailableCurrencies } from '@/utils/currencies';

interface InventoryItem {
  currency: string;
  amount: number;
  markup: number;
}

export default function EditInventoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchCurrencies = async () => {
      const currencies = await getAvailableCurrencies();
      setAvailableCurrencies(currencies);
      setInventory(currencies.map((currency: string) => ({
        currency,
        amount: 0,
        markup: 0
      })));
    };
  
    fetchCurrencies();
  }, []);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch('/api/vendor/profile');
        const data = await response.json();
        
        if (response.ok && data.inventory) {
          setInventory(data.inventory);
        }
      } catch (err) {
        setError('Failed to load inventory data');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchInventory();
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/vendor/update-inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inventory }),
      });

      if (!response.ok) {
        throw new Error('Failed to update inventory');
      }

      router.push('/vendor');
    } catch (err) {
      setError('Failed to update inventory. Please try again.');
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 px-4">
        <div className="max-w-4xl mx-auto mt-8">
          <div className="text-xl">Loading inventory...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 px-4">
      <div className="max-w-4xl mx-auto mt-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-light">Update Inventory</h1>
          <button
            onClick={() => router.push('/vendor')}
            className="text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            {inventory.map((item, index) => (
              <div key={item.currency} className="mb-6 last:mb-0">
                <h3 className="text-lg font-medium mb-4">{item.currency}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Amount
                    </label>
                    <input
                      type="text"
                      value={item.amount.toString()}
                      onChange={(e) => {
                        const newInventory = [...inventory];
                        const value = e.target.value.replace(/^0+/, '') || '0';
                        newInventory[index].amount = Number(value);
                        setInventory(newInventory);
                      }}
                      className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Markup (%)
                    </label>
                    <input
                      type="text"
                      value={(item.markup * 100).toString()}
                      onChange={(e) => {
                        const newInventory = [...inventory];
                        const value = e.target.value.replace(/^0+/, '') || '0';
                        newInventory[index].markup = Number(value) / 100;
                        setInventory(newInventory);
                      }}
                      className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      min="-50"
                      max="50"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className={`px-6 py-2 rounded-lg text-white ${isSaving ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
