'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isDev = process.env.NODE_ENV === 'development';

  const showUserLinks = session?.user && (session.user.role === 'user' || !session.user.role);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <>
      {isDev && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-100 p-2 text-xs">
          <pre>
            Session status: {status}<br />
            User role: {session?.user?.role || 'none'}<br />
            Show user links: {String(showUserLinks)}
          </pre>
        </div>
      )}
      <nav className={`fixed top-0 left-0 right-0 bg-white shadow-sm z-50 ${isDev ? 'mt-16' : ''}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <div className="w-8 h-8 relative">
                  <Image
                    src="/camel-logo.png"
                    alt="Caravan Exchange"
                    width={32}
                    height={32}
                  />
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-8">
              {session?.user ? (
                <>
                  <Link href="/exchange" className="text-gray-900 hover:text-gray-600">
                    Exchange
                  </Link>
                  <Link href="/about" className="text-gray-900 hover:text-gray-600">
                    About
                  </Link>
                  {showUserLinks && (
                    <>
                      <Link href="/cart" className="text-gray-900 hover:text-gray-600">
                        Cart
                      </Link>
                      <Link href="/dashboard" className="text-gray-900 hover:text-gray-600">
                        Dashboard
                      </Link>
                    </>
                  )}
                  {session.user.role === 'vendor' && (
                    <Link href="/vendor" className="text-gray-900 hover:text-gray-600">
                      Vendor Dashboard
                    </Link>
                  )}
                  {session.user.role === 'admin' && (
                    <Link href="/admin" className="text-gray-900 hover:text-gray-600">
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="text-gray-900 hover:text-gray-600"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link href="/login" className="text-gray-900 hover:text-gray-600">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
} 