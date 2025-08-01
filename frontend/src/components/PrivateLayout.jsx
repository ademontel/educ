import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import UserNavigation from './UserNavigation';

const PrivateLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Navbar />
      <UserNavigation />

      <main className="flex-1 flex items-center justify-center w-full">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default PrivateLayout;
