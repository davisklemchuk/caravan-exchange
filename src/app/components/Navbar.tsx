'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';

const Navbar = () => {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  return (
    <header className="w-full fixed top-0 left-0 z-50">
      <nav className="bg-white border-b-2 border-black w-full">
        <div className="flex justify-between items-center max-w-[1440px] mx-auto">
          <Link href="/" className="flex items-center">
            <Image 
              src="/camel-logo.svg" 
              alt="Exchange Logo" 
              width={80} 
              height={8} 
              className="object-contain" 
            />
          </Link>
          <ul className="flex space-x-8 pr-8">
            <li>
              <Link href="/about">
                <p className="text-black hover:text-gray-600">About</p>
              </Link>
            </li>
            {!session ? (
              <>
                <li>
                  <Link href="/login">
                    <p className="text-black hover:text-gray-600">Sign In</p>
                  </Link>
                </li>
                <li>
                  <Link href="/signup">
                    <p className="text-black hover:text-gray-600">Sign Up</p>
                  </Link>
                </li>
              </>
            ) : (
              <>
                {role === 'admin' ? (
                  <li>
                    <Link href="/admin">
                      <p className="text-black hover:text-gray-600">Admin</p>
                    </Link>
                  </li>
                ) : role === 'vendor' ? (
                  <li>
                    <Link href="/vendor">
                      <p className="text-black hover:text-gray-600">Vendor Dashboard</p>
                    </Link>
                  </li>
                ) : (
                  <>
                    <li>
                      <Link href="/exchange">
                        <p className="text-black hover:text-gray-600">Exchange</p>
                      </Link>
                    </li>
                    <li>
                      <Link href="/cart">
                        <p className="text-black hover:text-gray-600">Cart</p>
                      </Link>
                    </li>
                    <li>
                      <Link href="/dashboard">
                        <p className="text-black hover:text-gray-600">Account</p>
                      </Link>
                    </li>
                  </>
                )}
                <li>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-black hover:text-gray-600"
                  >
                    Sign Out
                  </button>
                </li>
              </>
            )}
          </ul>

        </div>
      </nav>
    </header>
  );
};

export default Navbar;