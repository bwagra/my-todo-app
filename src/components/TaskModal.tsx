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
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

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
    if (!isFocused && !showSuggestions) {
      setSuggestions([]);
      setHighlightedIndex(-1);
      return;
    }

    const loadSuggestions = async () => {
      try {
        const results = await TaskApiService.searchUserEmails(emailQuery);
        const filtered = results.filter((email) => !emailQuery || email.toLowerCase().includes(emailQuery.toLowerCase()));
        setSuggestions(filtered);
        setHighlightedIndex(filtered.length ? 0 : -1);
      } catch (err) {
        console.error('Error fetching emails via API service:', err);
        setSuggestions([]);
        setHighlightedIndex(-1);
      }
    };

    const timer = setTimeout(loadSuggestions, 150);
    return () => clearTimeout(timer);
  }, [emailQuery, isFocused, showSuggestions]);

  const selectSuggestion = (email: string) => {
    setEmailQuery(email);
    setSuggestions([]);
    setHighlightedIndex(-1);
    setShowSuggestions(false);
    setIsFocused(false);
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setSuggestions([]);
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };

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
            <div
              style={{
                position: 'relative',
                width: '100%',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                background: '#fff',
                minHeight: 42,
                boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              <input 
                type="text" 
                value={emailQuery} 
                onChange={(e) => {
                  setEmailQuery(e.target.value);
                  setShowSuggestions(true);
                }} 
                onFocus={() => {
                  setIsFocused(true);
                  setShowSuggestions(true);
                }}
                onBlur={() => setTimeout(() => {
                  setIsFocused(false);
                  setShowSuggestions(false);
                }, 150)}
                onKeyDown={handleEmailKeyDown}
                placeholder="Search assignee email..." 
                aria-label="Search assignee email"
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  padding: '10px 42px 10px 12px',
                  fontSize: '0.95rem',
                  borderRadius: 8,
                }} 
              />
              {emailQuery ? (
                <button
                  type="button"
                  aria-label="Clear assignee"
                  onClick={() => setEmailQuery('')}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: '#e2e8f0',
                    color: '#334155',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    borderRadius: '50%',
                    width: 20,
                    height: 20,
                    lineHeight: 1,
                    padding: 0,
                    transition: 'background 0.2s ease',
                  }}
                >
                  ×
                </button>
              ) : null}
            </div>
            {suggestions.length > 0 && (
              <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.08)', borderRadius: 8, listStyle: 'none', margin: '6px 0 0', padding: 0, maxHeight: '140px', overflowY: 'auto', zIndex: 10 }}>
                {suggestions.map((email, index) => (
                  <li 
                    key={email} 
                    onClick={() => selectSuggestion(email)} 
                    style={{
                      padding: '10px 12px',
                      cursor: 'pointer',
                      borderBottom: index === suggestions.length - 1 ? 'none' : '1px solid #f1f5f9',
                      background: index === highlightedIndex ? '#eff6ff' : '#fff',
                      color: '#0f172a',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    {email}
                  </li>
                ))}
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