"use client";
import React, { useState, useEffect } from 'react';
import { TaskApiService } from '../services/api';

interface HoverDashboardProps {
  currentUserEmail?: string;
}

export default function HoverDashboard({ currentUserEmail }: HoverDashboardProps) {
  const [expanded, setExpanded] = useState(false);
  const [counts, setCounts] = useState({ total: 0, mine: 0, completed: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        if (!currentUserEmail) return;
        const tasks = await TaskApiService.getTasks(currentUserEmail);
        const total = tasks.length;
        const mine = tasks.filter((t: any) => t.email === currentUserEmail).length;
        const completed = tasks.filter((t: any) => (t.status || '').toLowerCase() === 'completed').length;
        setCounts({ total, mine, completed });
      } catch (e) {
        // ignore
      }
    };
    load();
  }, [currentUserEmail]);

  return (
    <div
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      style={{
        position: 'fixed',
        left: 12,
        top: 120,
        zIndex: 60,
        width: expanded ? 260 : 40,
        height: expanded ? 200 : 40,
        background: '#0b1220',
        color: '#fff',
        borderRadius: 10,
        transition: 'width 160ms ease, height 160ms ease',
        overflow: 'hidden',
        boxShadow: '0 6px 20px rgba(2,6,23,0.4)'
      }}
    >
      <div style={{ padding: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>☰</div>
        {expanded && <strong>Quick Dashboard</strong>}
      </div>

      {expanded && (
        <div style={{ padding: 10, fontSize: '0.9rem' }}>
          <div>All tasks: <strong>{counts.total}</strong></div>
          <div>My tasks: <strong>{counts.mine}</strong></div>
          <div>Completed: <strong>{counts.completed}</strong></div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <a href="/profile"><button style={{ padding: '6px 8px', borderRadius: 6, background: '#2563eb', color: '#fff' }}>My Profile</button></a>
          </div>
        </div>
      )}
    </div>
  );
}
