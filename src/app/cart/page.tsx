'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useShoppingCart } from '../../../context/ShoppingCartContext';

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useShoppingCart();
  const router = useRouter();

  return (
    <div className="py-64 flex flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-4xl px-4">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => router.push('/exchange')}
            className="text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            ← Back to Exchange
          </button>
          <h1 className="text-3xl font-bold">Your Shopping Cart</h1>
        </div>

        {cart.length === 0 ? (
          <div className="text-center">
            <p className="mb-4">Your cart is empty.</p>
            <button
              onClick={() => router.push('/exchange')}
              className="text-indigo-600 hover:text-indigo-800"
            >
              Return to Exchange
            </button>
          </div>
        ) : (
          <>
            <ul className="space-y-4 mb-4">
              {cart.map((item) => (
                <li key={item.id} className="flex justify-between items-center border-b py-2">
                  <div>
                    <p><strong>{item.amount} {item.fromCurrency}</strong> to <strong>{item.toCurrency}</strong></p>
                    <p>Converted Amount: <strong>{item.convertedAmount.toFixed(2)}</strong></p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex justify-end space-x-4">
              <button
                onClick={clearCart}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Clear Cart
              </button>

              <button
                onClick={() => router.push('/checkout')}
                className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
