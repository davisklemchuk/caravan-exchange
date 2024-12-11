'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CreateVendorForm from '../components/CreateVendorForm';

interface VendorRequest {
  _id: string;
  email: string;
  createdAt: string;
  status: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pendingVendors, setPendingVendors] = useState<VendorRequest[]>([]);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [showCreateVendor, setShowCreateVendor] = useState(false);
  const [grayPeriod, setGrayPeriod] = useState<number | null>(1);
  const [currentGrayPeriod, setCurrentGrayPeriod] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchPendingVendors = async () => {
      if (session?.user?.role === 'admin') {
        const response = await fetch('/api/admin/pending-vendors');
        const data = await response.json();
        setPendingVendors(data);
      }
    };

    fetchPendingVendors();
  }, [session]);

  // Fetch the current gray period from the server
  useEffect(() => {
    const fetchGrayPeriod = async () => {
      try {
        const response = await fetch('/api/admin/set-gray-period');
        if (response.ok) {
          const data = await response.json();
          setCurrentGrayPeriod(data.grayPeriod);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to fetch gray period');
        }
      } catch (error) {
        setError('Error fetching gray period');
      }
    };

    fetchGrayPeriod();
  }, []);

  // Handle the gray period update
  const handleGrayPeriodChange = async () => {
    if (grayPeriod === null) return;

    try {
      const response = await fetch('/api/admin/set-gray-period', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ grayPeriod }),
      });

      if (response.ok) {
        setSuccess('Gray period updated successfully');
        // Update gray period after successful change
        setCurrentGrayPeriod(grayPeriod);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update gray period');
      }
    } catch (error) {
      setError('Error updating gray period');
    }
  };

  const handleApprove = async (vendorId: string) => {
    try {
      const response = await fetch('/api/admin/approve-vendor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vendorId }),
      });

      if (response.ok) {
        setPendingVendors(pendingVendors.filter(vendor => vendor._id !== vendorId));
      }
    } catch (error) {
      console.error('Error approving vendor:', error);
    }
  };

  const handleReject = async (vendorId: string) => {
    if (!rejectionReason) return;

    try {
      const response = await fetch('/api/admin/reject-vendor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vendorId, rejectionReason }),
      });

      if (response.ok) {
        setPendingVendors(pendingVendors.filter(vendor => vendor._id !== vendorId));
        setRejectionReason('');
        setSelectedVendor(null);
      }
    } catch (error) {
      console.error('Error rejecting vendor:', error);
    }
  };

  if (status === 'loading') {
    return <div className="pt-32 text-center">Loading...</div>;
  }

  if (session?.user?.role !== 'admin') {
    return (
      <div className="pt-32 text-center text-red-600">
        Access denied. Admin privileges required.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* Gray Period */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Gray Period</h2>
          <div className="flex items-center space-x-20 mb-6">
            <div>
              <p className="text-md font-medium">Current: {currentGrayPeriod !== null ? currentGrayPeriod : 'Not Set'}</p>
            </div>
            <div className="flex items-center space-x-2">
              <label className="block text-sm font-medium">Set Gray Period (in hours)</label>
              <input
                type="number"
                value={grayPeriod !== null ? grayPeriod : ''}
                onChange={(e) => setGrayPeriod(Number(e.target.value))}
                className="border-2 outline-none border-gray-300 rounded p-2 w-32"
                min={0}
              />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <button
              onClick={handleGrayPeriodChange}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Update Gray Period
            </button>
            {success && <span className="text-green-500">{success}</span>}
            {error && <span className="text-red-500">{error}</span>}
          </div>
        </div>

        {/* Pending Vendors */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Pending Vendor Approvals</h2>

          {pendingVendors.length === 0 ? (
            <p className="text-gray-500">No pending vendor approvals</p>
          ) : (
            <ul className="space-y-4">
              {pendingVendors.map((vendor) => (
                <li key={vendor._id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{vendor.email}</p>
                      <p className="text-sm text-gray-500">
                        Requested: {new Date(vendor.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApprove(vendor._id)}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setSelectedVendor(vendor._id)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </div>
                  </div>

                  {selectedVendor === vendor._id && (
                    <div className="mt-4">
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Enter reason for rejection..."
                        className="w-full p-2 border rounded"
                        rows={3}
                      />
                      <div className="mt-2 flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedVendor(null);
                            setRejectionReason('');
                          }}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleReject(vendor._id)}
                          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                          disabled={!rejectionReason}
                        >
                          Confirm Rejection
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Vendor Management */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Vendor Management</h2>
            <button
              onClick={() => setShowCreateVendor(!showCreateVendor)}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              {showCreateVendor ? 'Cancel' : 'Create New Vendor'}
            </button>
          </div>

          {showCreateVendor && (
            <CreateVendorForm
              onSuccess={() => {
                setShowCreateVendor(false);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
