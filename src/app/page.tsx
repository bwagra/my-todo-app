'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import {ModuleRegistry, AllCommunityModule} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
ModuleRegistry.registerModules([AllCommunityModule]);

// Initialize Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function Home() {
  // Auth States
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(true);

  // App States
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('todo');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [assignedToEmail, setAssignedToEmail] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState('todo');
  const [editDueDate, setEditDueDate] = useState('');
  const [editDueTime, setEditDueTime] = useState('');
  const [editAssignedToEmail, setEditAssignedToEmail] = useState('');
  
  const gridRef = useRef<AgGridReact>(null);

  // 1. Check Auth Session on Mount
  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const activeUser = session?.user ?? null;
      setUser(activeUser);
      setAuthLoading(false);

      if (activeUser?.email) {
        fetchTasks(activeUser.id, activeUser.email);
      } else {
        setTasks([]);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen live for auth changes (sign in, sign out, email verification redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const activeUser = session?.user ?? null;
        setUser(activeUser);
        if (activeUser?.email) {
          fetchTasks(activeUser.id, activeUser.email);
        } else {
          setTasks([]); // Clear tasks on logout
        }
        setAuthLoading(false);
        setLoading(false);
      }
    );

    // Clean up subscription when component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  // 2. Fetch Tasks (where user is creator OR assignee)
  const fetchTasks = async (userId: string | undefined, userEmail: string) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .or(`created_by.eq.${userId ?? 'null'},assigned_to_email.eq.${userEmail}`)
      .order('created_at', { ascending: false });

    if (!error && data) setTasks(data);
  };

  // 3. Auth Actions
  const resetEditState = () => {
    setEditingTaskId(null);
    setEditTitle('');
    setEditType('todo');
    setEditDueDate('');
    setEditDueTime('');
    setEditAssignedToEmail('');
  };

  const handleSignUp = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Redirects user back to your app homepage after clicking the email link
      emailRedirectTo: `${window.location.origin}`,
    },
  });

  if (error) {
    alert(error.message);
  } else {
    alert('Check your email for the confirmation link!');
  }
};

  const handleSignIn = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // 4a. Add Task Action
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title || !dueDate || !dueTime || !assignedToEmail) return;

    const newTask = {
      title,
      type,
      due_date: dueDate,
      due_time: dueTime,
      assigned_to_email: assignedToEmail,
      created_by: user.id,
      completed: false,
    };

    const { error } = await supabase.from('tasks').insert([newTask]);

    if (error) {
      alert(error.message);
      return;
    }

    // Trigger Email Notification via API route
    fetch('/api/assign-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskTitle: title,
        assignedToEmail: assignedToEmail,
        assignerEmail: user.email,
        dueDate: dueDate,
      }),
    });

    setTitle('');
    fetchTasks(user?.id, user.email);
  };

  const handleStartEditTask = (task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title || '');
    setEditType(task.type || 'todo');
    setEditDueDate(task.due_date || '');
    setEditDueTime(task.due_time || '');
    setEditAssignedToEmail(task.assigned_to_email || '');
  };

  const handleDeleteTask = async (taskId) => {
    if (!user?.id) return;
    if (!window.confirm('Delete this task?')) return;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('created_by', user.id);

    if (error) {
      alert(error.message);
      return;
    }

    resetEditState();
    fetchTasks(user.id, user.email);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!editingTaskId || !user?.id) return;
    if (!editTitle || !editDueDate || !editDueTime || !editAssignedToEmail) return;

    const { error } = await supabase
      .from('tasks')
      .update({
        title: editTitle,
        type: editType,
        due_date: editDueDate,
        due_time: editDueTime,
        assigned_to_email: editAssignedToEmail,
      })
      .eq('id', editingTaskId)
      .eq('created_by', user.id);

    if (error) {
      alert(error.message);
      return;
    }

    resetEditState();
    fetchTasks(user.id, user.email);
  };

  // 4b. Toggle Task Completion Status in Database
  const handleToggleComplete = async (taskId, currentStatus) => {
    const { error } = await supabase
      .from('tasks')
      .update({ completed: currentStatus })
      .eq('id', taskId);

    if (error) {
      alert(`Failed to update status: ${error.message}`);
      fetchTasks(user?.id, user?.email ?? '');
      return;
    }

    // Optimistically update local state so the grid reflects change instantly
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: currentStatus } : task
      )
    );
  };

  // 5. AG Grid Column Definitions (WITH INTERACTIVE CHECKBOX RENDERER)
  const columnDefs = useMemo(
    () => [
      { field: 'title', headerName: 'Task Title', filter: true },
      { field: 'type', headerName: 'Type', filter: true, width: 120 },
      { field: 'due_date', headerName: 'Due Date', filter: 'agDateColumnFilter' },
      { field: 'due_time', headerName: 'Time', width: 120 },
      { field: 'assigned_to_email', headerName: 'Assigned To', filter: true },
      {
        headerName: 'Actions',
        width: 150,
        cellRenderer: (params) => {
          const task = params.data;
          const canManage = user?.id && task.created_by === user.id;

          if (!canManage) {
            return <span className="text-xs text-gray-400">View only</span>;
          }

          return (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleStartEditTask(task)}
                className="rounded bg-amber-500 px-2 py-1 text-xs font-semibold text-white hover:bg-amber-400"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDeleteTask(task.id)}
                className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          );
        },
      },
      {
        field: 'completed',
        headerName: 'Status',
        width: 160,
        cellRenderer: (params) => {
          const isChecked = params.value;

          const handleChange = async (e) => {
            const newStatus = e.target.checked;
            const taskId = params.data.id;
            await handleToggleComplete(taskId, newStatus);
          };

          return (
            <div className="flex items-center h-full gap-2">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span
                className={
                  isChecked
                    ? 'text-gray-400 line-through'
                    : 'text-gray-900 font-medium'
                }
              >
                {isChecked ? 'Completed' : 'Pending'}
              </span>
            </div>
          );
        },
      },
    ],
    [tasks, user]
  );

  const defaultColDef = useMemo(
    () => ({
      flex: 1,
      minWidth: 100,
      resizable: true,
      sortable: true,
    }),
    []
  );

  const formattedToday = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-600">
        Loading Dashboard...
      </div>
    );
  }

  // --- Auth View ---
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-md">
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            Task Management Portal
          </h2>
          <form className="mt-8 space-y-4">
            <input
              type="email"
              placeholder="Email address"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex gap-4 pt-2">
              <button
                onClick={handleSignIn}
                className="flex-1 rounded-md bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Sign In
              </button>
              <button
                onClick={handleSignUp}
                className="flex-1 rounded-md bg-gray-600 py-2 text-sm font-semibold text-white hover:bg-gray-50"
              >
                Sign Up
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- Main Dashboard View ---
  return (
    <div className="min-h-screen bg-gray-50 p-6 text-gray-900">
      <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            My Workspace
          </h1>
          <p className="text-sm text-gray-500">{formattedToday}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-600">
            Signed in as: <span className="underline">{user.email}</span>
          </span>
          <button
            onClick={handleSignOut}
            className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Creation Card */}
        <div className="rounded-xl bg-white p-6 shadow-sm h-fit">
          <h2 className="text-lg font-bold mb-4">Create Assignment</h2>
          <form onSubmit={handleAddTask} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Task Mode
              </label>
              <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-md">
                <button
                  type="button"
                  onClick={() => setType('todo')}
                  className={`py-1.5 text-xs font-medium rounded ${
                    type === 'todo'
                      ? 'bg-white shadow-sm text-indigo-600'
                      : 'text-gray-500'
                  }`}
                >
                  To-Do
                </button>
                <button
                  type="button"
                  onClick={() => setType('reminder')}
                  className={`py-1.5 text-xs font-medium rounded ${
                    type === 'reminder'
                      ? 'bg-white shadow-sm text-indigo-600'
                      : 'text-gray-500'
                  }`}
                >
                  Reminder
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Details
              </label>
              <input
                type="text"
                placeholder="What needs to be done?"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Assignee Email
              </label>
              <input
                type="email"
                placeholder="collaborator@example.com"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={assignedToEmail}
                onChange={(e) => setAssignedToEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Deploy Task & Notify
            </button>
          </form>

          {editingTaskId && (
            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h3 className="mb-3 text-sm font-semibold text-amber-800">Edit Assignment</h3>
              <form onSubmit={handleUpdateTask} className="space-y-3">
                <input
                  type="text"
                  placeholder="Updated task title"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Date</label>
                    <input
                      type="date"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Time</label>
                    <input
                      type="time"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={editDueTime}
                      onChange={(e) => setEditDueTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <input
                  type="email"
                  placeholder="Updated assignee email"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={editAssignedToEmail}
                  onChange={(e) => setEditAssignedToEmail(e.target.value)}
                  required
                />

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="submit"
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={resetEditState}
                    className="rounded-md bg-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* AG Grid Data Table */}
        <div className="lg:col-span-2 rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Task Management Grid</h2>
            <p className="text-xs text-gray-400">
              Click headers to sort / Hover for column filter controls
            </p>
          </div>

          <div className="ag-theme-alpine w-full h-[400px]">
            <AgGridReact
              ref={gridRef}
              rowData={tasks}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              animateRows={true}
              reactiveCustomComponents={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}