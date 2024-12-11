'use client';

import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ShoppingCartProvider } from "../../context/ShoppingCartContext";
import { AuthProvider } from '../components/AuthProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="relative">
        <AuthProvider>
          <ShoppingCartProvider>
            <Navbar />
            {children}
            <Footer />
          </ ShoppingCartProvider>
        </ AuthProvider>
      </body>
    </html>
  );
}