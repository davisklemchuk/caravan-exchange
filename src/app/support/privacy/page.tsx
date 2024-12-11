import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 py-32">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>

      <div className="max-w-3xl bg-white p-6 rounded-lg shadow-md">
        <p className="text-lg mb-4">
          Welcome to our Currency Exchange website. We value your privacy and are committed to protecting
          the personal information you share with us.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">Information Collection</h2>
        <p className="text-lg mb-4">
          We collect personal information such as your name, email address, and any data you provide when
          signing up or interacting with the exchange features.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">How We Use Your Information</h2>
        <p className="text-lg mb-4">
          The information we collect is used to provide and improve our services, including processing currency
          exchange transactions, notifying you about updates, and personalizing your experience.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">Data Security</h2>
        <p className="text-lg mb-4">
          We implement security measures to protect your personal information. However, no method of transmission
          over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">Cookies</h2>
        <p className="text-lg mb-4">
          Our website may use cookies to enhance your browsing experience and analyze website traffic. You can
          disable cookies in your browser settings, but this may affect certain features of the website.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">Third-Party Services</h2>
        <p className="text-lg mb-4">
          We may share your information with trusted third-party services, such as payment processors, to
          facilitate transactions. These third parties are obligated to maintain the confidentiality of your
          information.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">Your Rights</h2>
        <p className="text-lg mb-4">
          You have the right to access, update, or delete your personal information. If you have any questions or
          concerns about how we handle your data, please contact us at support@caravanexchange.com.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">Changes to This Policy</h2>
        <p className="text-lg mb-4">
          We may update this privacy policy from time to time. Any changes will be posted on this page with an
          updated effective date.
        </p>

        <p className="text-lg mb-4">
          By using our services, you agree to the terms outlined in this privacy policy.
        </p>
      </div>
    </div>
  );
}