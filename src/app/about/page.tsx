// app/about/page.tsx

export default function AboutPage() {
    return (
      <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6 pt-32">
        <div className="w-full max-w-3xl bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-center mb-4 text-indigo-700">
            About Caravan Exchange
          </h1>
          <p className="text-gray-700 text-lg mb-6">
            At Caravan Exchange, we’re creating a more accessible and secure financial system. Our platform makes currency exchange easy and transparent, empowering people around the world to navigate global markets confidently.
          </p>
  
          <h2 className="text-2xl font-semibold mb-3 text-indigo-600">Our Vision</h2>
          <p className="text-gray-700 mb-6">
            We aim to simplify cross-border exchanges, providing competitive rates and reliable infrastructure for individuals and businesses alike. Caravan Exchange envisions a world where people can manage their finances without borders or barriers.
          </p>
  
          <h2 className="text-2xl font-semibold mb-3 text-indigo-600">Our Services</h2>
          <p className="text-gray-700 mb-6">
            Caravan Exchange supports a broad array of exchange services, including real-time currency updates, secure transactions, and a user-friendly platform. Our compliance framework is robust, ensuring adherence to global standards and protecting your transactions.
          </p>
  
          <h2 className="text-2xl font-semibold mb-3 text-indigo-600">Commitment to Security</h2>
          <p className="text-gray-700 mb-6">
            We prioritize security, using advanced encryption and compliance technologies to protect your funds and data. Our team is dedicated to maintaining a safe, trustworthy platform for all your currency needs.
          </p>
  
          <h2 className="text-2xl font-semibold mb-3 text-indigo-600">Contact Us</h2>
          <p className="text-gray-700 mb-1"><strong>Email:</strong> support@caravanexchange.com</p>
          <p className="text-gray-700"><strong>Phone:</strong> +1 (555) 555-1456</p>
  
          <div className="mt-8 text-center">
            <p className="text-gray-500">
              © {new Date().getFullYear()} Caravan Exchange. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    );
  }
  