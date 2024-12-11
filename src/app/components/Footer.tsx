import React from 'react'
import Link from 'next/link'

const Footer = () => {
  return (
    <footer className="bg-white border-t-2 border-black py-4">
      <ul className="flex mx-auto space-x-8 justify-evenly py-2">
        <li>
          <Link href="/support/privacy/">
            <p className="text-black hover:text-gray-600">Privacy Policy</p>
          </Link>
        </li>
        <li>
          <Link href="/support/terms/">
            <p className="text-black hover:text-gray-600">Terms of Service</p>
          </Link>
        </li>
        <li>
          <Link href="https://www.linkedin.com/company/global-caravan-for-education-and-cultural-exchange/about/">
            <p className="text-black hover:text-gray-600">Follow Us on LinkedIn!</p>
          </Link>
        </li>
      </ul>
      <div className="text-center py-2">
        <p>© 2024 Caravan Exchange. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer