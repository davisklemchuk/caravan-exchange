'use client';

import { useState, useEffect } from 'react';

type CurrencyRate = {
  currency: string;
  rate: number;
  change: string;
  trend: 'up' | 'down';
};

export default function CurrencyRates() {
  const [currencyRates, setCurrencyRates] = useState<CurrencyRate[]>([]);

  useEffect(() => {
    async function fetchCurrencyRates() {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();

        // Need to add non-hard coded trend and change
        const rates = [
          { currency: '1 EUR', rate: (1 / data.rates.EUR), change: '+0.05%', trend: 'up' },
          { currency: '1 GBP', rate: (1 / data.rates.GBP), change: '+0.01%', trend: 'up' },
          { currency: '1 JPY', rate: (1 / data.rates.JPY), change: '+0.30%', trend: 'up' },
          { currency: '1 AUD', rate: (1 / data.rates.AUD), change: '+0.61%', trend: 'up' },
          { currency: '1 CAD', rate: (1 / data.rates.CAD), change: '-0.02%', trend: 'up' },
          { currency: '1 CNY', rate: (1 / data.rates.CNY), change: '-0.09%', trend: 'down' },
        ];

        const updatedRates: CurrencyRate[] = rates.map((rate) => ({
          ...rate,
          trend: rate.change.includes('+') ? 'up' : 'down',
        }));

        setCurrencyRates(updatedRates);
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
      }
    }

    fetchCurrencyRates();
  }, []);
  return (
    <div className="p-24 bg-white rounded-lg shadow-lg max-w-5xl mx-auto">
      <h2 className="text-center text-3xl font-bold mb-8 text-gray-800">
        Explore Currency Rates
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {currencyRates.map((rate) => (
          <div
            key={rate.currency}
            className="flex items-center p-6 border rounded-lg shadow-lg bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 transition-transform transform hover:scale-105"
          >
            <div className="flex flex-col items-center justify-center w-full text-center">
              <span className="text-2xl font-bold text-gray-800">{rate.currency}</span>
              <span className="text-xl text-gray-700">{`$${rate.rate.toFixed(2)}`}</span>
              <span
                className={`mt-2 text-lg font-semibold ${
                  rate.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {rate.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
