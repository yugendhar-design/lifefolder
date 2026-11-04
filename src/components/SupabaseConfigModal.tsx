import React, { useState } from 'react';
import { Database, Check, ExternalLink, Copy, Key, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { Modal } from './Modal';
import { 
  SUPABASE_URL, 
  SUPABASE_ANON_KEY, 
  isSupabaseConfigured, 
  saveSupabaseConfig, 
  clearSupabaseConfig 
} from '../lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const [url, setUrl] = useState(SUPABASE_URL || '');
  const [key, setKey] = useState(SUPABASE_ANON_KEY || '');
  const [copied, setCopied] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !key.trim()) return;
    saveSupabaseConfig(url, key);
  };

  const handleDisconnect = () => {
    clearSupabaseConfig();
  };

  const sqlSchema = `-- LifeFolder Complete Supabase Setup
-- Run this in Supabase Dashboard -> SQL Editor -> New Query

create table if not exists public.deadlines (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text,
  deadline_date date not null,
  identifier text,
  reminder integer default 0,
  file_path text,
  file_name text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Row Level Security (RLS)
alter table public.deadlines enable row level security;

create policy "Users can view own deadlines" 
  on public.deadlines for select using (auth.uid() = user_id);

create policy "Users can insert own deadlines" 
  on public.deadlines for insert with check (auth.uid() = user_id);

create policy "Users can update own deadlines" 
  on public.deadlines for update using (auth.uid() = user_id);

create policy "Users can delete own deadlines" 
  on public.deadlines for delete using (auth.uid() = user_id);

-- Storage bucket for attachments
insert into storage.buckets (id, name, public) 
values ('deadline-attachments', 'deadline-attachments', false)
on conflict (id) do nothing;

create policy "Users can upload own attachments" 
  on storage.objects for insert with check (
    bucket_id = 'deadline-attachments' and 
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can read own attachments" 
  on storage.objects for select using (
    bucket_id = 'deadline-attachments' and 
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own attachments" 
  on storage.objects for delete using (
    bucket_id = 'deadline-attachments' and 
    auth.uid()::text = (storage.foldername(name))[1]
  );
`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Supabase Backend Configuration"
    >
      <div className="flex flex-col gap-4 text-xs">
        <div className={`p-3 rounded-xl border ${
          isSupabaseConfigured 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-blue-50 border-blue-200 text-blue-900'
        }`}>
          <div className="flex items-center gap-2 font-semibold text-sm mb-1">
            <Database className="w-4 h-4" />
            <span>
              {isSupabaseConfigured ? 'Connected to Live Supabase' : 'Running in Local Vault Mode'}
            </span>
          </div>
          <p className="text-[11.5px] leading-relaxed">
            {isSupabaseConfigured
              ? 'Your application is securely connected to Supabase Auth, PostgreSQL database, and private file storage with Row-Level Security.'
              : 'The app is fully functional right now using client-side encrypted vault storage. To link your real Supabase cloud project, simply paste your project credentials below.'}
          </p>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-3">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Supabase Project URL
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-xs text-slate-800"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Supabase Anon / Public Key
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-xs text-slate-800 font-mono"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            {isSupabaseConfigured && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="text-rose-600 hover:text-rose-700 font-medium"
              >
                Disconnect & Use Local
              </button>
            )}
            <button
              type="submit"
              className="ml-auto px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-all text-xs"
            >
              Save & Connect
            </button>
          </div>
        </form>

        {/* 1-Click SQL Setup Script */}
        <div className="mt-2 pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-slate-800">
              1-Click Supabase SQL Setup (Table & RLS)
            </span>
            <button
              type="button"
              onClick={copySql}
              className="flex items-center gap-1 text-[11px] font-semibold text-[#2563eb] hover:underline"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied SQL!' : 'Copy SQL Script'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mb-2">
            Paste this once in your Supabase Dashboard SQL Editor to create the tables, RLS policies, and private bucket.
          </p>
          <pre className="p-2.5 bg-slate-900 text-slate-200 rounded-lg text-[10px] font-mono overflow-x-auto max-h-28 border border-slate-800">
            {sqlSchema}
          </pre>
        </div>
      </div>
    </Modal>
  );
};
