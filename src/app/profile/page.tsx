"use client";
import React, { useEffect, useState, useRef } from 'react';
import { TaskApiService } from '../../services/api';
import { supabase } from '../../lib/supabaseClient';

export default function ProfilePage() {
  const [email, setEmail] = useState<string>('');
  const [avatar, setAvatar] = useState<string>('');
  const [tasks, setTasks] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const timersRef = useRef<Record<string, number>>({});
  const [notificationsAllowed, setNotificationsAllowed] = useState<boolean>(false);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user?.email) {
        const storedAvatar = (() => {
          try { return localStorage.getItem('userAvatar') || ''; } catch { return ''; }
        })();
        setEmail(data.session.user.email);
        setAvatar(
          data.session.user.user_metadata?.avatar_url ||
          data.session.user.user_metadata?.picture ||
          data.session.user.user_metadata?.avatar ||
          storedAvatar ||
          ''
        );
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!email) return;
    const loadTasks = async () => {
      try {
        const t = await TaskApiService.getTasks(email);
        setTasks(t as any[]);
      } catch (e) {}
    };
    loadTasks();

    const loadReminders = async () => {
      try {
        const r = await TaskApiService.getReminders(email);
        setReminders(r || []);
      } catch (e) {}
    };
    loadReminders();
  }, [email]);

  useEffect(() => {
    // schedule reminders
    // clear existing timers
    Object.values(timersRef.current).forEach((id) => clearTimeout(id));
    timersRef.current = {};

    reminders.forEach((rem: any) => {
      const delay = rem.time - Date.now();
      if (delay > 0) {
        const id = window.setTimeout(() => {
          showNotification(`Reminder`, rem.message || `Task reminder for ${rem.taskId}`);
        }, delay);
        timersRef.current[rem.id] = id;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reminders]);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Notifications API not supported in this browser.');
      return;
    }
    const res = await Notification.requestPermission();
    setNotificationsAllowed(res === 'granted');
  };

  const showNotification = (title: string, body?: string) => {
    if (typeof window === 'undefined') return;
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, { body });
      } catch (e) {
        // fallback
        alert(`${title}\n${body}`);
      }
    } else {
      // fallback alert
      alert(`${title}\n${body}`);
    }
  };

  const setReminderFor = async (taskId: string, when: string) => {
    const ts = new Date(when).getTime();
    if (!ts || isNaN(ts)) return;
    try {
      const created = await TaskApiService.createReminder({ taskId, email, time: ts, message: `Reminder for ${taskId}` });
      setReminders((prev) => [...prev.filter((r) => r.id !== created.id), created]);
      showNotification('Reminder set', `Reminder for task ${taskId} scheduled`);
    } catch (e) {
      console.error(e);
      alert('Failed to create reminder');
    }
  };

  const displayName = email ? email.split('@')[0] : 'Guest';

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (!result) return;
      setAvatar(result);
      try {
        localStorage.setItem('userAvatar', result);
        await supabase.auth.updateUser({ data: { avatar_url: result } });
      } catch (e) {
        console.error('Failed to persist avatar:', e);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>My Profile</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <div style={{ position: 'relative', width: 64, height: 64 }}>
          {avatar ? (
            <img src={avatar} alt={displayName} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #dbeafe' }} />
          ) : (
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
              {displayName.slice(0, 2).toUpperCase() || 'U'}
            </div>
          )}
        </div>
        <div>
          <p style={{ color: '#475569', margin: 0 }}>Name: <strong>{displayName}</strong></p>
          <label style={{ display: 'inline-block', marginTop: 8, cursor: 'pointer', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff' }}>
            Upload avatar
            <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={requestNotificationPermission} style={{ padding: '6px 10px', borderRadius: 6 }}>
          {notificationsAllowed || (typeof Notification !== 'undefined' && Notification.permission === 'granted') ? 'Notifications Enabled' : 'Enable Notifications'}
        </button>
      </div>

      <section style={{ marginTop: 18 }}>
        <h3>Tasks At Hand</h3>
        {tasks.length === 0 && <div style={{ color: '#94a3b8' }}>No tasks assigned.</div>}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {tasks.map((t) => (
            <li key={t.id} style={{ padding: 12, border: '1px solid #e6e6e6', borderRadius: 8, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{t.title}</div>
                  <div style={{ color: '#64748b' }}>{t.body}</div>
                </div>
                <div style={{ minWidth: 220 }}>
                  <label style={{ display: 'block', fontSize: 12, color: '#64748b' }}>Set reminder</label>
                  <input type="datetime-local" onBlur={(e) => setReminderFor(t.id, e.currentTarget.value)} style={{ width: '100%', padding: '6px' }} />
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div style={{ marginTop: 16 }}>
          <h4>Your reminders</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {reminders.map((r: any) => (
              <li key={r.id} style={{ padding: 8, borderBottom: '1px solid #f1f1f1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{r.message}</div>
                    <div style={{ color: '#64748b', fontSize: 12 }}>{new Date(r.time).toLocaleString()}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
