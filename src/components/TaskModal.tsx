'use client';
import React, { useState, useEffect } from 'react';
import { TaskApiService } from '../services/api';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  initialData?: any;
  currentUserEmail?: string;
}

export default function TaskModal({ isOpen, onClose, onSubmit, initialData, currentUserEmail }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [emailQuery, setEmailQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Pre-fill form when editing
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setBody(initialData.body || '');
      setEmailQuery(initialData.email || currentUserEmail || '');
    } else {
      setTitle('');
      setBody('');
      setEmailQuery(currentUserEmail || '');
    }
    setSelectedFiles([]);
  }, [initialData, isOpen, currentUserEmail]);

  // Dynamic Email Auto-Suggest Query
  useEffect(() => {
    if (emailQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const results = await TaskApiService.searchUserEmails(emailQuery);
        setSuggestions(results);
      } catch (err) {
        console.error('Error fetching emails via API service:', err);
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [emailQuery]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    if (initialData?.id) formData.append('id', initialData.id);
    formData.append('title', title);
    formData.append('body', body);
    formData.append('email', emailQuery);

    selectedFiles.forEach((file) => {
      formData.append('attachments', file);
    });

    onSubmit(formData);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', width: '450px', maxWidth: '90%' }}>
        <h2>{initialData ? 'Edit Task' : 'Create New Task'}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div>
            <label>Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
          </div>

          <div>
            <label>Body / Details</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} style={{ width: '100%', padding: '8px' }} />
          </div>

          <div style={{ position: 'relative' }}>
            <label>Assignee Email</label>
            <input 
              type="text" 
              value={emailQuery} 
              onChange={(e) => setEmailQuery(e.target.value)} 
              placeholder="Search assignee email..." 
              aria-label="Search assignee email"
              style={{ width: '100%', padding: '8px' }} 
            />
            {suggestions.length > 0 && (
              <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #ccc', listStyle: 'none', margin: 0, padding: 0, maxHeight: '120px', overflowY: 'auto', zIndex: 10 }}>
                {suggestions.length === 0 ? (
                  <li style={{ padding: '8px', color: '#999' }}>No results</li>
                ) : (
                  suggestions.map((email) => (
                    <li 
                      key={email} 
                      onClick={() => { setEmailQuery(email); setSuggestions([]); }} 
                      style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                    >
                      {email}
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          <div>
            <label>Attach Files</label>
            <input type="file" multiple onChange={(e) => e.target.files && setSelectedFiles(Array.from(e.target.files))} />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px' }}>Cancel</button>
            <button type="submit" style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px' }}>
              {initialData ? 'Update Task' : 'Create Task'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}