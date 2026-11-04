import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Mail, 
  ShieldCheck, 
  Lock, 
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { ViewScreen } from '../types';

interface HelpSupportPageProps {
  onNavigate: (screen: ViewScreen) => void;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'General' | 'Vault & Security' | 'Status & Reminders';
}

export const HelpSupportPage: React.FC<HelpSupportPageProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('faq-1');

  const faqs: FAQItem[] = [
    {
      id: 'faq-1',
      question: 'How do I add a new document deadline?',
      answer: 'Click "Add Deadline" in the sidebar or top bar. Select a category, enter the document title, specify the exact expiry date, optionally provide a policy reference number, and upload an encrypted attachment (PDF, PNG, JPG).',
      category: 'General',
    },
    {
      id: 'faq-2',
      question: 'How are deadline statuses calculated?',
      answer: 'Statuses are dynamically computed using your local calendar date: Overdue (past deadline), Due Today (expires today at 23:59), Approaching (expires within 1 to 30 days), and Upcoming (more than 30 days remaining).',
      category: 'Status & Reminders',
    },
    {
      id: 'faq-3',
      question: 'What file types and size limits are supported for vault uploads?',
      answer: 'LifeFolder accepts PDF documents, JPG images, and PNG scans up to 25MB per file. Each file is encrypted and placed in your private owner-restricted storage bucket.',
      category: 'Vault & Security',
    },
    {
      id: 'faq-4',
      question: 'How do reminders work and how are they delivered?',
      answer: 'You can choose to be reminded 60, 30, 15, 7, or 1 day before expiration. The reminder preference is saved per document in your vault. When integrated with Supabase Edge Functions / Resend or SendGrid, automated email alerts are triggered.',
      category: 'Status & Reminders',
    },
    {
      id: 'faq-5',
      question: 'Can I export all my document records?',
      answer: 'Yes! Navigate to the "All Deadlines" or "Overview" page and click the "Export" or "Export CSV" button. It instantly generates a clean spreadsheet containing only your signed-in account\'s records.',
      category: 'General',
    },
    {
      id: 'faq-6',
      question: 'Is my document information protected against other users?',
      answer: 'Yes. LifeFolder enforces PostgreSQL Row Level Security (RLS) on both the database records and the Supabase Storage attachment bucket. Only your authenticated user UID can read, modify, or delete your files.',
      category: 'Vault & Security',
    },
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleAccordion = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-150">
      {/* Header Row */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs mb-1">
          <span 
            onClick={() => onNavigate('overview')}
            className="font-medium text-[#94a3b8] hover:text-[#2563eb] cursor-pointer"
          >
            LifeFolder
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[#cbd5e1]" />
          <span className="font-semibold text-[#2563eb]">Help & Support</span>
        </div>
        <h2 className="text-2xl font-bold text-[#0f172a] tracking-tight">
          Help & Support Center
        </h2>
        <p className="text-[13.5px] text-[#64748b]">
          Frequently asked questions, vault documentation, and direct support assistance.
        </p>
      </div>

      {/* Hero Search Box */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
        <h3 className="text-lg font-bold text-[#0f172a] mb-2">
          How can we help with your document vault today?
        </h3>
        <p className="text-xs text-slate-500 max-w-md mb-5">
          Search questions regarding deadline calculation, private attachments, or account security.
        </p>
        <div className="relative w-full max-w-lg">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords (e.g., status, upload, reminder, export)..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
          />
        </div>
      </div>

      {/* Accordion FAQ List */}
      <div className="flex flex-col gap-3">
        {filteredFaqs.map((faq) => {
          const isExpanded = expandedId === faq.id;
          return (
            <div
              key={faq.id}
              className="bg-white border border-[rgba(226,232,240,0.8)] rounded-xl shadow-2xs overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => toggleAccordion(faq.id)}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
                aria-expanded={isExpanded}
              >
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700">
                    {faq.category}
                  </span>
                  <span className="text-sm font-semibold text-[#0f172a]">
                    {faq.question}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                  isExpanded ? 'rotate-180 text-blue-600' : ''
                }`} />
              </button>

              {isExpanded && (
                <div className="px-5 pb-4 pt-1 text-xs text-[#475569] leading-relaxed border-t border-slate-100 bg-slate-50/30">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Support Contact Card (Exact Prompt Specification) */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-300 shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-base text-white mb-1">
              Need personalized assistance?
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed max-w-md">
              Configure your dedicated support email in <code className="bg-white/15 px-1.5 py-0.5 rounded font-mono text-[11px]">.env.local</code> (e.g. <code className="text-blue-200">support@lifefolder.vault</code>).
            </p>
          </div>
        </div>

        <a
          href="mailto:support@lifefolder.vault"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-slate-900 hover:bg-blue-50 text-xs font-semibold rounded-xl shadow-sm transition-all shrink-0 self-start sm:self-auto"
        >
          <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
          <span>Contact Support Desk</span>
        </a>
      </div>
    </div>
  );
};
