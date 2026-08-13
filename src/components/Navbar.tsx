'use client';
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const openProfile = () => {
    // Navigate to profile page (if present) or show simple UI
    try {
      window.location.href = '/profile';
    } catch (e) {
      alert('Profile page not available');
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    try {
      localStorage.removeItem('userEmail');
    } catch (e) {
      // ignore
    }
    window.location.href = '/signin';
  };

  const switchUser = async () => {
    await supabase.auth.signOut();
    try { localStorage.removeItem('userEmail'); } catch (e) {}
    window.location.href = '/signin';
  };

  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#1e293b', color: '#fff' }}>
      <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Task Workspace</div>

      {/* Top Right User Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button aria-label="Toggle dashboard" title="Toggle dashboard" onClick={() => onToggleSidebar?.()} style={{ padding: '6px 10px', borderRadius: '6px', background: '#0b1220', color: '#fff', border: '1px solid #334155', cursor: 'pointer' }}>☰</button>

        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{ padding: '8px 12px', borderRadius: '50%', background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            TB
          </button>

          {showProfileMenu && (
            <div style={{ position: 'absolute', right: 0, marginTop: '8px', background: '#fff', color: '#000', borderRadius: '6px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', minWidth: '150px' }}>
              <ul style={{ listStyle: 'none', margin: 0, padding: '8px 0' }}>
                  <li style={{ padding: '8px 16px', cursor: 'pointer' }} onClick={openProfile}>My Profile</li>
                  <li style={{ padding: '8px 16px', cursor: 'pointer' }} onClick={switchUser}>Switch User</li>
                  <li style={{ padding: '8px 16px', cursor: 'pointer', borderTop: '1px solid #ccc' }} onClick={signOut}>Logout</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}