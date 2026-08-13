"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from '../../lib/supabaseClient';

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
      return;
    }
    if (data?.session) {
      const avatar =
        data.session.user.user_metadata?.avatar_url ||
        data.session.user.user_metadata?.picture ||
        data.session.user.user_metadata?.avatar ||
        '';
      try {
        localStorage.setItem('userEmail', data.session.user.email || '');
        if (avatar) localStorage.setItem('userAvatar', avatar);
      } catch (e) {}
      router.push('/');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleSignIn} style={{ width: 360, padding: 24, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', background: '#fff' }}>
        <h2 style={{ margin: 0, marginBottom: 12 }}>Sign In</h2>
        <p style={{ marginTop: 0, marginBottom: 12, color: '#475569' }}>Enter your email and password to sign in.</p>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@workspace.com" style={{ width: '100%', padding: '10px', marginBottom: 12 }} />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" style={{ width: '100%', padding: '10px', marginBottom: 12 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" style={{ padding: '8px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6 }}>Sign in</button>
          <button type="button" onClick={() => router.push('/signup')} style={{ padding: '8px 12px', borderRadius: 6 }}>Create account</button>
        </div>
      </form>
    </div>
  );
}
