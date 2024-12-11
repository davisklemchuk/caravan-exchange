'use client';

import { useState, useEffect } from 'react';
import { useShoppingCart } from '../../../context/ShoppingCartContext';
import { getAvailableCurrencies } from '@/utils/currencies';

export default function Home() {
  const [selectedFromCurrency, setSelectedFromCurrency] = useState('USD');
  const [selectedToCurrency, setSelectedToCurrency] = useState('EUR');
  const [enteredAmount, setEnteredAmount] = useState<string>('1');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState<string>('1');
  const [conversionRate, setConversionRate] = useState<number | null>(null);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>([]);

  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  const { addToCart } = useShoppingCart();

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const currencies = await getAvailableCurrencies();
        setAvailableCurrencies(currencies);
      } catch (err) {
        setError('Failed to load currencies');
      }
    };

    fetchCurrencies();
  }, []);

  const fetchConversionRate = async () => {
    try {
      setError(null);

      if (!enteredAmount || isNaN(Number(enteredAmount)) || Number(enteredAmount) <= 0) {
        throw new Error('Please enter a valid amount greater than 0');
      }

      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${selectedFromCurrency}/${selectedToCurrency}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch conversion rate');
      }

      const data = await response.json();

      if (data.result === 'success' && data.conversion_rate) {
        setConversionRate(data.conversion_rate);
        setFromCurrency(selectedFromCurrency);
        setToCurrency(selectedToCurrency);
        setAmount(enteredAmount);

        const calculatedAmount = Number(enteredAmount) * data.conversion_rate;
        setConvertedAmount(calculatedAmount);
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  const handleAddToCart = () => {
    if (conversionRate && convertedAmount !== null) {
      const cartItem = {
        id: crypto.randomUUID(), // Generate an ID for the cart item
        fromCurrency,
        toCurrency,
        amount: Number(amount),
        convertedAmount,
      };

      addToCart(cartItem);
      alert('Exchange added to the shopping cart!');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Currency Converter</h1>

      <div className="flex items-center space-x-4 mb-4">
        <div>
          <label className="block text-sm font-medium">From</label>
          <select
            className="border rounded p-2"
            value={selectedFromCurrency}
            onChange={(e) => setSelectedFromCurrency(e.target.value)}
          >
            {availableCurrencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">To</label>
          <select
            className="border rounded p-2"
            value={selectedToCurrency}
            onChange={(e) => setSelectedToCurrency(e.target.value)}
          >
            {availableCurrencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Amount</label>
        <input
          type="text"
          className="border rounded p-2 w-32"
          value={enteredAmount}
          onChange={(e) => setEnteredAmount(e.target.value)}
          placeholder="Enter amount"
        />
      </div>

      <button
        onClick={fetchConversionRate}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-2"
      >
        Convert
      </button>

      {conversionRate !== null && (
        <div className="mt-4 text-xl">
          <strong>Conversion Rate:</strong> 1 {fromCurrency} = {conversionRate.toFixed(4)} {toCurrency}
        </div>
      )}

      {convertedAmount !== null && (
        <div className="mt-4 text-xl">
          <strong>Converted Amount:</strong> {amount} {fromCurrency} = {convertedAmount.toFixed(4)} {toCurrency}
        </div>
      )}

      {convertedAmount !== null && (
        <button
          onClick={handleAddToCart}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-4"
        >
          Add to Cart
        </button>
      )}

      {error && <div className="mt-4 text-red-500">{error}</div>}
    </div>
  );
}
