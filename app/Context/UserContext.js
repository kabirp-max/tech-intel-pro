'use client'

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: user, error } = await supabase.auth.getUser();

      if (user?.user) {
        const emailName = user.user.email.split('@')[0];
        setUser({ ...user.user, name: emailName });
      } else if (error) {
        console.error('Error fetching user:', error);
      }

      setLoading(false);
    };

    fetchUser();

    // Set up listener to handle authentication state changes
    const unsubscribe = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const emailName = session.user.email.split('@')[0];
        setUser({ ...session.user, name: emailName });
      } else {
        setUser(null);
      }
    });

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
