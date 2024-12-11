'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import CurrencyRates from './components/CurrencyRates';

export default function Home() {
  const { data: session, status } = useSession();

  const isLoading = status === 'loading';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="flex flex-col items-center justify-center bg-black w-full py-32">
        <h1 className="text-5xl text-white font-bold mb-4 pt-32">The revival of foreign currency exchange</h1>
      </div>
      <div className="flex flex-col items-center justify-center space-y-4">
        {isLoading ? (
          <div className="p-4 test-center">Loading...</div>
        ) : !session ? (
          <>
            <p className="text-center text-2xl mb-4 py-16">Please sign up or log in to use the currency exchange feature.</p>
            <div className="flex space-x-4">
              <Link href="/login">
                <button className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
                  Log In
                </button>
              </Link>
              <Link href="/signup">
                <button className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600">
                  Sign Up
                </button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="text-center text-2xl mb-4 py-16">Welcome back, {session?.user?.firstName}!</p>
            <Link href="/exchange">
              <button className="bg-blue-500 text-white text-xl px-20 py-5 rounded hover:bg-blue-600">
                Go to Exchange Page
              </button>
            </Link>
          </>
        )}
      </div>

      <CurrencyRates />
      <div className="w-full flex flex-col items-center justify-center bg-black text-white px-4 py-32">
        <h1 className="text-4xl font-bold mb-6 text-center">The Caravan Exchange Guarantee</h1>
      
        <Link href="/support/terms/">
          <button className="px-6 py-3 border border-white rounded-full hover:bg-gray-800 mb-12">
            See our terms and conditions
          </button>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 mb-4">
              {/* Need to find image */}
              <div className="bg-gray-800 rounded-lg w-full h-full"></div>
            </div>
            <p>We ensure your data is kept safe and secure.</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 mb-4">
              {/* Need to find image */}
              <div className="bg-gray-800 rounded-lg w-full h-full"></div>
            </div>
            <p>We protect your credentials from being taken.</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 mb-4">
              {/* Need to find image */}
              <div className="bg-gray-800 rounded-lg w-full h-full"></div>
            </div>
            <p>We provide account updates on all transactions.</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 mb-4">
              {/* Need to find image */}
              <div className="bg-gray-800 rounded-lg w-full h-full"></div>
            </div>
            <p>We have a service team working around the clock.</p>
          </div>
        </div>
      </div>
    </div>
  );
}