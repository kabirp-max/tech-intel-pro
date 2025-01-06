'use client';

import { supabase } from '../supabase';

export default function LoginModal({ onClose }) {
  const handleSignInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const handleSignUpWithEmail = async (email, password) => {
    await supabase.auth.signUp({ email, password });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Login or Register</h2>
        <button onClick={handleSignInWithGoogle}>Sign in with Google</button>
        {/* Optionally, add an email/password form */}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
