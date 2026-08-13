"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from '../../lib/supabaseClient';

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert(error.message);
      return;
    }
    if (data?.user) {
      try {
        const normalizedEmail = email.trim().toLowerCase();
        localStorage.setItem('userEmail', normalizedEmail);
        const existing = JSON.parse(localStorage.getItem('knownUserEmails') || '[]');
        const merged = Array.from(new Set([...(Array.isArray(existing) ? existing : []), normalizedEmail].filter(Boolean)));
        localStorage.setItem('knownUserEmails', JSON.stringify(merged));
      } catch (e) {}
      router.push('/');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleSignUp} style={{ width: 360, padding: 24, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', background: '#fff' }}>
        <h2 style={{ margin: 0, marginBottom: 12 }}>Create Account</h2>
        <p style={{ marginTop: 0, marginBottom: 12, color: '#475569' }}>Enter email and password to sign up.</p>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@workspace.com" style={{ width: '100%', padding: '10px', marginBottom: 12 }} />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" style={{ width: '100%', padding: '10px', marginBottom: 12 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" style={{ padding: '8px 12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6 }}>Create</button>
          <button type="button" onClick={() => router.push('/signin')} style={{ padding: '8px 12px', borderRadius: 6 }}>Already have account</button>
        </div>
      </form>
    </div>
  );
}
