// components/Navbar.js
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const Navbar = ({ user, signIn, signOut }) => {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">My Articles</div>
        <div className="space-x-4 hidden md:flex">
          <Link href="/" className="hover:text-yellow-300">Home</Link>
          <Link href="/add-article" className="hover:text-yellow-300">Add Article</Link>
          <Link href="/about-us" className="hover:text-yellow-300">About Us</Link>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-sm">{user.email}</span>
              <button
                onClick={signOut}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={signIn}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
