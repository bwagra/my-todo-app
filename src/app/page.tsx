'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import { ModuleRegistry, AllCommunityModule, ClientSideRowModelModule, ValidationModule } from 'ag-grid-community';

// Register required AG Grid modules so the grid features (sorting, filtering, validation, etc.)
// are available during runtime.
ModuleRegistry.registerModules([AllCommunityModule, ClientSideRowModelModule, ValidationModule]);

// AG Grid styles are loaded globally from the root layout to avoid
// postcss / Turbopack worker evaluation issues during dev on Windows.

import TaskModal from '../components/TaskModal';
import Sidebar from '../components/Sidebar';
import { TaskApiService } from '../services/api';
import { supabase } from '../lib/supabaseClient';

interface Attachment {
  filename: string;
  originalName?: string;
}

interface Task {
  id: string;
  title: string;
  body: string;
  email: string;
  attachments?: Attachment[];
  status?: 'Pending' | 'Completed' | string;
  githubIssueUrl?: string;
}

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [rowData, setRowData] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'my' | 'completed'>('all');
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string>('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [emailFilterQuery, setEmailFilterQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState<boolean>(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('showSidebar') : null;
      return raw === null ? true : raw === 'true';
    } catch (e) {
      return true;
    }
  });

  const toggleSidebar = () => {
    setShowSidebar((s) => {
      const next = !s;
      try { localStorage.setItem('showSidebar', String(next)); } catch (e) {}
      return next;
    });
  };

  const currentUserInitials = useMemo(() => {
    if (!currentUserEmail) return 'U';
    const parts = currentUserEmail.split('@')[0].split(/[^a-zA-Z0-9]+/).filter(Boolean);
    if (parts.length === 0) return 'U';
    return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('') || 'U';
  }, [currentUserEmail]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    try {
      localStorage.removeItem('userEmail');
    } catch (e) {
      // ignore
    }
    window.location.href = '/signin';
  };

  // Debounce the email filter so UI updates are less noisy
  const [debouncedEmailQuery, setDebouncedEmailQuery] = useState<string>('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedEmailQuery(emailFilterQuery), 300);
    return () => clearTimeout(timer);
  }, [emailFilterQuery]);

  // Fetch initial tasks from Angular backend
  const fetchTasks = async (email?: string) => {
    setIsLoading(true);
    try {
      const userEmail = email || currentUserEmail;
      const data = await TaskApiService.getTasks(userEmail || '');
      setRowData(data as any[]);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data?.session?.user;
      const email = sessionUser?.email;
      const avatarFromStorage = (() => {
        try {
          return localStorage.getItem('userAvatar') || '';
        } catch {
          return '';
        }
      })();
      const avatar =
        sessionUser?.user_metadata?.avatar_url ||
        sessionUser?.user_metadata?.picture ||
        sessionUser?.user_metadata?.avatar ||
        avatarFromStorage ||
        '';

      if (email) {
        setCurrentUserEmail(email);
        setCurrentUserAvatar(avatar);
        await fetchTasks(email);
      } else {
        setCurrentUserEmail('');
        setCurrentUserAvatar('');
        setIsLoading(false);
      }
    };

    loadSession();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user;
      const email = sessionUser?.email;
      const avatarFromStorage = (() => {
        try {
          return localStorage.getItem('userAvatar') || '';
        } catch {
          return '';
        }
      })();
      const avatar =
        sessionUser?.user_metadata?.avatar_url ||
        sessionUser?.user_metadata?.picture ||
        sessionUser?.user_metadata?.avatar ||
        avatarFromStorage ||
        '';

      if (email) {
        setCurrentUserEmail(email);
        setCurrentUserAvatar(avatar);
        fetchTasks(email);
      } else {
        setCurrentUserEmail('');
        setCurrentUserAvatar('');
        setIsLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // AG Grid Column Definitions (memoized so highlight depends on debounced query)
  const columnDefs = useMemo(() => [
    {
      headerName: '',
      field: 'status',
      width: 80,
      cellRenderer: (params: any) => {
        const checked = params.data?.status === 'Completed';
        return (
          <input
            type="checkbox"
            checked={checked}
            onChange={async (e) => {
              const next = e.target.checked ? 'Completed' : 'Pending';
              try {
                await TaskApiService.updateTask(params.data.id, { status: next, requesterEmail: currentUserEmail });
                await fetchTasks();
              } catch (err) {
                console.error('Failed to update status:', err);
                const msg = err instanceof Error ? err.message : 'Failed to update task status';
                alert(msg);
              }
            }}
          />
        );
      }
    },
    { field: 'title', headerName: 'Title', flex: 1, filter: true },
    { field: 'body', headerName: 'Description', flex: 2 },
    {
      field: 'email',
      headerName: 'Assignee Email',
      flex: 1.5,
      filter: true,
      cellRenderer: (params: any) => {
        const email: string = params.value || '';
        const q = debouncedEmailQuery?.trim() || '';
        if (!q) return <span>{email}</span>;
        const lower = email.toLowerCase();
        const match = q.toLowerCase();
        const idx = lower.indexOf(match);
        if (idx === -1) return <span>{email}</span>;
        const before = email.slice(0, idx);
        const matched = email.slice(idx, idx + match.length);
        const after = email.slice(idx + match.length);
        return (
          <span>
            {before}
            <span style={{ backgroundColor: '#fde68a' }}>{matched}</span>
            {after}
          </span>
        );
      }
    },
    {
      field: 'githubIssueUrl',
      headerName: 'GitHub Issue',
      flex: 1.2,
      cellRenderer: (params: any) => {
        const url = params.value;
        if (!url) {
          return <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>—</span>;
        }
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}
          >
            Open issue
          </a>
        );
      },
    },
    {
      field: 'attachments',
      headerName: 'Attachments',
      flex: 2,
      valueFormatter: (params: any) => {
        const files: Attachment[] = params.value;
        if (!files || files.length === 0) return '';
        return files.map((f) => f.originalName || f.filename).join(', ');
      },
      cellRenderer: (params: any) => {
        const files: Attachment[] = params.value;

        if (!files || files.length === 0) {
          return <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No attachments</span>;
        }

        return (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', height: '100%' }}>
            {files.map((file, index) => {
              const displayName = file.originalName || file.filename;
                      const downloadUrl = TaskApiService.getDownloadUrl(file.filename);

              return (
                <a
                  key={index}
                  href={downloadUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: '#2563eb',
                    backgroundColor: '#eff6ff',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    border: '1px solid #bfdbfe',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    lineHeight: '1.2'
                  }}
                  title={`Click to download ${displayName}`}
                >
                  📎 {displayName}
                </a>
              );
            })}
          </div>
        );
      },
    },
    {
      headerName: 'Actions',
      field: 'id',
      flex: 1,
      cellRenderer: (params: any) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => {
              setEditingTask(params.data);
              setIsModalOpen(true);
            }}
            style={{
              padding: '4px 12px',
              backgroundColor: '#eab308',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.85rem'
            }}
          >
            Edit
          </button>
          <button
            onClick={async () => {
              const ok = confirm('Delete this task? This cannot be undone.');
              if (!ok) return;
              try {
                await TaskApiService.deleteTask(params.data.id, currentUserEmail);
                await fetchTasks();
              } catch (err) {
                console.error('Delete failed:', err);
                const msg = err instanceof Error ? err.message : 'Failed to delete task';
                alert(msg);
              }
            }}
            style={{
              padding: '4px 12px',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.85rem'
            }}
          >
            Delete
          </button>
        </div>
      )
    },
  ] as ColDef<Task, any>[], [debouncedEmailQuery]);

  // Submit handler for both Create and Edit
  const handleFormSubmit = async (formData: FormData) => {
    try {
      await TaskApiService.saveTask(formData);

      // Refresh task list after saving
      await fetchTasks();

      // Reset state and close modal
      setIsModalOpen(false);
      setEditingTask(null);
    } catch (err) {
      console.error('Error saving task:', err);
    }
  };

  // Filtered row data according to sidebar selection
  const filteredRowData = rowData.filter((t) => {
    if (filter === 'all') return true;
    if (filter === 'my') return t.email === currentUserEmail;
    if (filter === 'completed') return (t as any).status === 'Completed' || (t as any).status === 'completed';
    return true;
  });

  // Apply assignee search filter (debounced) if present
  const visibleRowData = debouncedEmailQuery.trim()
    ? filteredRowData.filter((t) => t.email.toLowerCase().includes(debouncedEmailQuery.toLowerCase()))
    : filteredRowData;

  const matchesCount = visibleRowData.length;

  // If no user is signed in, show a simple gate to signin/signup
  if (!currentUserEmail) {
    return (
      <div style={{ width: '100%' }}>
        <div style={{ display: 'flex', minHeight: '70vh', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ padding: 24, borderRadius: 8, background: '#fff', boxShadow: '0 6px 18px rgba(0,0,0,0.06)', textAlign: 'center' }}>
            <h2 style={{ margin: 0 }}>Please sign in</h2>
            <p style={{ color: '#475569' }}>You must sign in to view or create tasks.</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <a href="/signin"><button style={{ padding: '8px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6 }}>Sign in</button></a>
              <a href="/signup"><button style={{ padding: '8px 12px', borderRadius: 6 }}>Create account</button></a>
            </div>
          </div>
        </div>

        {/* Task Modal (Create & Edit) */}
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTask(null);
          }}
          onSubmit={handleFormSubmit}
          initialData={editingTask}
          currentUserEmail={currentUserEmail}
        />
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', gap: '1rem' }}>
        {showSidebar && <Sidebar onSelect={(f) => setFilter(f)} />}

        <div style={{ flex: 1 }}>

          {/* Inline controls: Search and Create */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                aria-label="Currently signed in user"
                title={currentUserEmail || 'Not signed in'}
                onClick={() => setShowProfileMenu((prev) => !prev)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '6px 12px 6px 8px',
                  background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
                  border: '1px solid #cbd5e1',
                  borderRadius: '999px',
                  color: '#0f172a',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  maxWidth: '240px',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
                  cursor: 'pointer',
                }}
              >
                <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  {currentUserAvatar ? (
                    <img
                      src={currentUserAvatar}
                      alt={currentUserEmail || 'User profile'}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        boxShadow: '0 0 0 2px rgba(255,255,255,0.8)',
                        display: 'block',
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        color: '#fff',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        boxShadow: '0 0 0 2px rgba(255,255,255,0.8)',
                      }}
                    >
                      {currentUserInitials}
                    </span>
                  )}
                  <span
                    style={{
                      position: 'absolute',
                      right: 0,
                      bottom: 0,
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: '#22c55e',
                      border: '2px solid #ffffff',
                      boxShadow: '0 0 0 1px rgba(34, 197, 94, 0.15)',
                    }}
                  />
                </span>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentUserEmail || 'Guest'}
                </span>
              </button>

              {showProfileMenu && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 8px 20px rgba(15,23,42,0.12)', minWidth: '170px', zIndex: 20 }}>
                  <button type="button" onClick={() => { setShowProfileMenu(false); window.location.href = '/profile'; }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', border: 'none', background: 'transparent', cursor: 'pointer' }}>My Profile</button>
                  <div style={{ height: 1, background: '#e2e8f0' }} />
                  <button type="button" onClick={async () => { setShowProfileMenu(false); await handleSignOut(); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer', fontWeight: 600 }}>Sign out</button>
                </div>
              )}
            </div>
            <input
              aria-label="Search assignee"
              placeholder="Search assignee email..."
              value={emailFilterQuery}
              onChange={(e) => setEmailFilterQuery(e.target.value)}
              style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
            <span style={{ color: '#0f172a', background: '#e2e8f0', padding: '4px 8px', borderRadius: '6px', fontSize: '0.9rem' }}>Matches: {matchesCount}</span>
            <button
              onClick={() => {
                setEditingTask(null);
                setIsModalOpen(true);
              }}
              style={{
                padding: '10px 18px',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              +
            </button>
            <button
              onClick={handleSignOut}
              style={{
                padding: '10px 14px',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              Sign out
            </button>
          </div>

          {/* AG Grid Table Container */}
          <div
            className="ag-theme-alpine"
            style={{
              height: 'calc(100vh - 140px)',
              width: '100%',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <AgGridReact
              rowData={visibleRowData}
              columnDefs={columnDefs}
              modules={[AllCommunityModule, ClientSideRowModelModule, ValidationModule]}
              theme="legacy"
              defaultColDef={{
                sortable: true,
                resizable: true,
              }}
              rowHeight={48}
              overlayLoadingTemplate={'<span>Loading tasks...</span>'}
              overlayNoRowsTemplate={'<span>No tasks found.</span>'}
            />
          </div>
        </div>
      </div>

      {/* Task Modal (Create & Edit) */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingTask}
        currentUserEmail={currentUserEmail}
      />
    </div>
  );
}
