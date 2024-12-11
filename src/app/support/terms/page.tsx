import React from 'react';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 py-32">
      <h1 className="text-3xl font-bold mb-4">Terms and Conditions</h1>

      <div className="max-w-3xl bg-white p-6 rounded-lg shadow-md">
        <p className="text-lg mb-4">
          Welcome to our Currency Exchange website. By accessing or using our services, you agree to comply
          with and be bound by the following terms and conditions.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">1. Use of Services</h2>
        <p className="text-lg mb-4">
          You must be at least 18 years old to use our services. You agree to use our services only for lawful
          purposes and in compliance with all applicable laws and regulations.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">2. Account Responsibility</h2>
        <p className="text-lg mb-4">
          You are responsible for maintaining the confidentiality of your account credentials and for all
          activities that occur under your account. Notify us immediately of any unauthorized use of your
          account.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">3. Currency Conversion</h2>
        <p className="text-lg mb-4">
          Conversion rates are provided by third-party services and are subject to change without notice.
          We make no guarantees regarding the accuracy of conversion rates.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">4. Fees</h2>
        <p className="text-lg mb-4">
          Certain transactions may incur fees. All applicable fees will be displayed before completing a
          transaction. By proceeding, you agree to pay any associated fees.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">5. Limitation of Liability</h2>
        <p className="text-lg mb-4">
          We are not liable for any direct, indirect, incidental, or consequential damages arising from the
          use of our services, including errors in currency conversion or service interruptions.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">6. Termination</h2>
        <p className="text-lg mb-4">
          We reserve the right to terminate or suspend your account or access to our services at our sole
          discretion, without notice, for conduct that we believe violates these terms or is harmful to
          others.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">7. Changes to Terms</h2>
        <p className="text-lg mb-4">
          We may update these terms from time to time. Any changes will be effective immediately upon
          posting. By continuing to use our services, you agree to the updated terms.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">8. Contact Us</h2>
        <p className="text-lg mb-4">
          If you have any questions or concerns about these terms, please contact us at
          support@caravanexchange.com.
        </p>

        <p className="text-lg mt-6">
          By using our services, you acknowledge that you have read, understood, and agree to these terms
          and conditions.
        </p>
      </div>
    </div>
  );
}
