'use client';
import React from 'react';

interface SidebarProps {
  onSelect?: (filter: 'all' | 'my' | 'completed') => void;
}

export default function Sidebar({ onSelect }: SidebarProps) {
  return (
    <aside style={{ width: '220px', background: '#0f172a', color: '#94a3b8', height: 'calc(100vh - 60px)', padding: '1rem' }}>
      <nav>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ padding: '10px 0', color: '#fff', fontWeight: 'bold' }}>Dashboard</li>
          <li style={{ padding: '10px 0', cursor: 'pointer' }} onClick={() => onSelect?.('all')}>All Tasks</li>
          <li style={{ padding: '10px 0', cursor: 'pointer' }} onClick={() => onSelect?.('my')}>My Tasks</li>
          <li style={{ padding: '10px 0', cursor: 'pointer' }} onClick={() => onSelect?.('completed')}>Completed</li>
        </ul>
      </nav>
    </aside>
  );
}