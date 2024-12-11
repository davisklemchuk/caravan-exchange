'use client';

import React, { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface TransactionFulfillmentModalProps {
  transaction: {
    _id: string;
    deliveryDate: string;
    deliveryMethod: string;
    amount: number;
    fromCurrency: string;
    toCurrency: string;
    convertedAmount: number;
  };
  onClose: () => void;
  onFulfill: (transactionId: string, signature: string) => Promise<void>;
}

export default function TransactionFulfillmentModal({
  transaction,
  onClose,
  onFulfill
}: TransactionFulfillmentModalProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const signatureRef = useRef<SignatureCanvas>(null);

  const handleFulfill = async () => {
    if (!signatureRef.current?.isEmpty() && isConfirmed) {
      const signatureData = signatureRef.current?.toDataURL();
      try {
        await onFulfill(transaction._id, signatureData);
        onClose();
      } catch (err) {
        setError('Failed to fulfill transaction. Please try again.');
      }
    } else {
      setError('Please provide signature and confirm the details.');
    }
  };

  const clearSignature = () => {
    signatureRef.current?.clear();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full m-4">
        <h2 className="text-2xl font-bold mb-6">Fulfill Transaction</h2>

        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Delivery Date</p>
              <p className="font-medium">{new Date(transaction.deliveryDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Delivery Method</p>
              <p className="font-medium">
                {transaction.deliveryMethod === 'bank' ? 'Bank Delivery' : 'In-Person'}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600">Exchange Amount</p>
            <p className="font-medium">
              {transaction.amount} {transaction.fromCurrency} →{' '}
              {transaction.convertedAmount} {transaction.toCurrency}
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">E-Signature</p>
            <div className="border rounded">
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  className: 'signature-canvas w-full h-40'
                }}
              />
            </div>
            <button
              onClick={clearSignature}
              className="text-sm text-gray-600 mt-2 hover:text-gray-800"
            >
              Clear Signature
            </button>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="confirm"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="confirm" className="text-sm text-gray-600">
              I confirm that I have verified all details and am ready to fulfill this transaction
            </label>
          </div>

          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleFulfill}
            disabled={!isConfirmed || signatureRef.current?.isEmpty()}
            className={`px-6 py-2 rounded-lg ${
              isConfirmed && !signatureRef.current?.isEmpty()
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Fulfill Transaction
          </button>
        </div>
      </div>
    </div>
  );
} 