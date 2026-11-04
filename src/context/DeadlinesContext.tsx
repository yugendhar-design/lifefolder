import React, { createContext, useContext, useState, useEffect } from 'react';
import { Deadline, DeadlineAttachment, CategoryType } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { getDeadlineStatus } from '../lib/status';

interface DeadlinesContextType {
  deadlines: Deadline[];
  isLoading: boolean;
  error: string | null;
  counts: {
    total: number;
    overdue: number;
    dueToday: number;
    approaching: number;
    upcoming: number;
  };
  addDeadline: (data: Omit<Deadline, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; error?: string; id?: string }>;
  updateDeadline: (id: string, data: Partial<Deadline>) => Promise<{ success: boolean; error?: string }>;
  deleteDeadline: (id: string) => Promise<{ success: boolean; error?: string }>;
  getDeadlineById: (id: string) => Deadline | undefined;
  exportDeadlinesCSV: () => void;
  refreshDeadlines: () => Promise<void>;
}

const DeadlinesContext = createContext<DeadlinesContextType | undefined>(undefined);

// Initial sample matching the Figma screenshot and design state
const SEED_DEADLINES: Deadline[] = [
  {
    id: 'doc-seed-1',
    user_id: 'default',
    name: 'Health Insurance',
    category: 'Insurance',
    deadline_date: '2026-10-25',
    identifier: '#DOC-HLTH-2026',
    reminder_days: 30,
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-09-01T10:00:00Z',
    attachment: {
      name: 'Health_Insurance_Policy.pdf',
      size: 1420000,
      type: 'application/pdf',
      uploadedAt: '2026-09-01T10:00:00Z',
    },
  },
  {
    id: 'doc-seed-2',
    user_id: 'default',
    name: 'Passport',
    category: 'Identity / Govt',
    // Set to today's local date so it evaluates to Due Today
    deadline_date: new Date().toISOString().split('T')[0],
    identifier: '#DOC-PASS-2026',
    reminder_days: 60,
    created_at: '2026-08-15T09:00:00Z',
    updated_at: '2026-08-15T09:00:00Z',
    attachment: {
      name: 'Passport_Scan_Official.pdf',
      size: 2400000,
      type: 'application/pdf',
      uploadedAt: '2026-08-15T09:00:00Z',
    },
  },
  {
    id: 'doc-seed-3',
    user_id: 'default',
    name: 'Bike Insurance',
    category: 'Vehicle',
    deadline_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    identifier: '#DOC-BIKE-2026',
    reminder_days: 15,
    created_at: '2026-09-10T12:00:00Z',
    updated_at: '2026-09-10T12:00:00Z',
    attachment: {
      name: 'Vehicle_Insurance_Receipt.pdf',
      size: 850000,
      type: 'application/pdf',
      uploadedAt: '2026-09-10T12:00:00Z',
    },
  },
  {
    id: 'doc-seed-4',
    user_id: 'default',
    name: "Driver's License",
    category: 'Identity / Govt',
    deadline_date: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
    identifier: '#DOC-DL-98210',
    reminder_days: 30,
    created_at: '2026-07-20T11:00:00Z',
    updated_at: '2026-07-20T11:00:00Z',
  },
];

export const DeadlinesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const storageKey = user ? `lifefolder_deadlines_${user.id}` : 'lifefolder_deadlines_guest';

  const fetchDeadlines = async () => {
    if (!user) {
      setDeadlines([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error: sbError } = await supabase
          .from('deadlines')
          .select('*')
          .eq('user_id', user.id)
          .order('deadline_date', { ascending: true });

        if (sbError) {
          console.warn('Supabase fetch error, fallback to local store:', sbError);
          loadLocal();
        } else if (data) {
          const mapped: Deadline[] = data.map(item => ({
            id: item.id,
            user_id: item.user_id,
            name: item.name,
            category: (item.category as CategoryType) || 'Other',
            deadline_date: item.deadline_date,
            identifier: item.identifier || undefined,
            reminder_days: item.reminder || 0,
            attachment: item.file_path
              ? {
                  name: item.file_name || 'document',
                  size: 0,
                  type: 'application/octet-stream',
                  path: item.file_path,
                  uploadedAt: item.created_at,
                }
              : undefined,
            created_at: item.created_at,
            updated_at: item.updated_at,
          }));
          setDeadlines(mapped);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load deadlines.');
        loadLocal();
      }
    } else {
      loadLocal();
    }

    setIsLoading(false);
  };

  const loadLocal = () => {
    // If the user is the demo/preview user ("preview-alex-morgan"), provide sample seed
    if (user?.id === 'preview-alex-morgan') {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        try {
          setDeadlines(JSON.parse(raw));
          return;
        } catch {}
      }
      setDeadlines(SEED_DEADLINES);
      localStorage.setItem(storageKey, JSON.stringify(SEED_DEADLINES));
      return;
    }

    // Real authenticated user: clean initial empty state matching Figma new-user frames
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        // If it was inadvertently seeded with the seed docs, clean it
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id === 'doc-seed-1') {
          setDeadlines([]);
          localStorage.setItem(storageKey, JSON.stringify([]));
          return;
        }
        setDeadlines(parsed);
        return;
      } catch {}
    }
    setDeadlines([]);
    localStorage.setItem(storageKey, JSON.stringify([]));
  };

  useEffect(() => {
    fetchDeadlines();
  }, [user?.id]);

  const saveLocal = (items: Deadline[]) => {
    setDeadlines(items);
    localStorage.setItem(storageKey, JSON.stringify(items));
  };

  const addDeadline = async (data: Omit<Deadline, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { success: false, error: 'User is not logged in.' };

    const newId = 'dl_' + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();

    const newRecord: Deadline = {
      ...data,
      id: newId,
      user_id: user.id,
      created_at: now,
      updated_at: now,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        let filePath = null;
        let fileName = null;

        if (data.attachment && data.attachment.dataUrl) {
          // Upload file to Supabase Storage bucket 'deadline-attachments'
          try {
            const ext = data.attachment.name.split('.').pop() || 'dat';
            filePath = `${user.id}/${newId}-${Date.now()}.${ext}`;
            fileName = data.attachment.name;

            // Convert dataUrl to blob
            const res = await fetch(data.attachment.dataUrl);
            const blob = await res.blob();

            await supabase.storage
              .from('deadline-attachments')
              .upload(filePath, blob, {
                cacheControl: '3600',
                upsert: true,
              });
          } catch (uploadErr) {
            console.warn('Storage upload note:', uploadErr);
          }
        }

        const { data: inserted, error: insertError } = await supabase
          .from('deadlines')
          .insert({
            name: data.name,
            category: data.category,
            deadline_date: data.deadline_date,
            identifier: data.identifier || null,
            reminder: data.reminder_days,
            file_path: filePath,
            file_name: fileName,
            user_id: user.id,
          })
          .select()
          .single();

        if (insertError) {
          // Fall back to local store to guarantee uninterrupted user experience
          console.warn('Supabase DB error, saving to vault:', insertError);
          const updated = [...deadlines, newRecord];
          saveLocal(updated);
          return { success: true, id: newId };
        }

        if (inserted) {
          const fresh: Deadline = {
            id: inserted.id,
            user_id: inserted.user_id,
            name: inserted.name,
            category: inserted.category as CategoryType,
            deadline_date: inserted.deadline_date,
            identifier: inserted.identifier || undefined,
            reminder_days: inserted.reminder || 0,
            attachment: data.attachment,
            created_at: inserted.created_at,
            updated_at: inserted.updated_at,
          };
          setDeadlines(prev => [...prev, fresh]);
          return { success: true, id: fresh.id };
        }
      } catch (err: any) {
        console.error(err);
      }
    }

    // Local mode save
    const updated = [...deadlines, newRecord];
    saveLocal(updated);
    return { success: true, id: newId };
  };

  const updateDeadline = async (id: string, partial: Partial<Deadline>) => {
    const updatedList = deadlines.map(item => {
      if (item.id === id) {
        return {
          ...item,
          ...partial,
          updated_at: new Date().toISOString(),
        };
      }
      return item;
    });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('deadlines')
          .update({
            name: partial.name,
            category: partial.category,
            deadline_date: partial.deadline_date,
            identifier: partial.identifier || null,
            reminder: partial.reminder_days,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase update error:', err);
      }
    }

    saveLocal(updatedList);
    return { success: true };
  };

  const deleteDeadline = async (id: string) => {
    const itemToDelete = deadlines.find(d => d.id === id);

    if (isSupabaseConfigured && supabase) {
      try {
        if (itemToDelete?.attachment?.path) {
          await supabase.storage
            .from('deadline-attachments')
            .remove([itemToDelete.attachment.path]);
        }
        await supabase.from('deadlines').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete error:', err);
      }
    }

    const filtered = deadlines.filter(d => d.id !== id);
    saveLocal(filtered);
    return { success: true };
  };

  const getDeadlineById = (id: string) => {
    return deadlines.find(d => d.id === id);
  };

  const exportDeadlinesCSV = () => {
    if (deadlines.length === 0) return;

    const headers = ['Document Name', 'Identifier', 'Category', 'Expiry Date', 'Status', 'Reminder Days', 'Has Attachment'];
    const rows = deadlines.map(d => [
      `"${d.name.replace(/"/g, '""')}"`,
      `"${(d.identifier || '').replace(/"/g, '""')}"`,
      `"${d.category}"`,
      d.deadline_date,
      getDeadlineStatus(d.deadline_date),
      d.reminder_days,
      d.attachment ? 'Yes' : 'No',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lifefolder_deadlines_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Recalculate status groups
  const counts = deadlines.reduce(
    (acc, d) => {
      const status = getDeadlineStatus(d.deadline_date);
      acc.total += 1;
      if (status === 'Overdue') acc.overdue += 1;
      else if (status === 'Due today') acc.dueToday += 1;
      else if (status === 'Approaching') acc.approaching += 1;
      else if (status === 'Upcoming') acc.upcoming += 1;
      return acc;
    },
    { total: 0, overdue: 0, dueToday: 0, approaching: 0, upcoming: 0 }
  );

  return (
    <DeadlinesContext.Provider
      value={{
        deadlines,
        isLoading,
        error,
        counts,
        addDeadline,
        updateDeadline,
        deleteDeadline,
        getDeadlineById,
        exportDeadlinesCSV,
        refreshDeadlines: fetchDeadlines,
      }}
    >
      {children}
    </DeadlinesContext.Provider>
  );
};

export const useDeadlines = () => {
  const context = useContext(DeadlinesContext);
  if (!context) throw new Error('useDeadlines must be used within a DeadlinesProvider');
  return context;
};
