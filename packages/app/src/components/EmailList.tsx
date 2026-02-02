import { useEffect } from 'react';
import { Email } from '../types';
import { shortenAddress, formatTime } from '../utils/helpers';
import { useEmails } from '../hooks/useEmails';
import { EmailService } from '../services';

interface EmailListProps {
  userAddress: string;
  emailService: EmailService;
  onEmailClick: (email: Email) => void;
  newSentEmail?: Email | null;
  onOpenCompose?: () => void;
}

export function EmailList({
  userAddress,
  emailService,
  onEmailClick,
  newSentEmail,
  onOpenCompose,
}: EmailListProps) {
  const {
    emails,
    isLoading,
    isRefreshing,
    refresh,
    addEmail,
  } = useEmails({ userAddress, emailService });

  useEffect(() => {
    if (newSentEmail) {
      addEmail(newSentEmail);
    }
  }, [newSentEmail, addEmail]);

  return (
    <section className="flex-1 min-h-0 bg-dark-card rounded-2xl border border-white/10 shadow-xl overflow-hidden flex flex-col">
      <div className="px-6 py-4 border-b border-white/10 bg-white/2 flex justify-between items-center">
        <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <span className="w-1 h-5 bg-linear-to-b from-primary to-accent rounded-full" />
          Inbox ({emails.length})
        </h2>
        <div className="flex items-center gap-2">
          {onOpenCompose && (
            <button
              type="button"
              onClick={onOpenCompose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-primary transition-colors"
              title="New message"
              aria-label="New message"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
          <button
            onClick={refresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
            title="Refresh inbox"
          >
            <svg
              className={`w-4 h-4 text-slate-400 ${isRefreshing ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
        {isLoading ? (
          <LoadingState />
        ) : emails.length === 0 ? (
          <EmptyState />
        ) : (
          emails.map((email) => (
            <EmailItem
              key={email.id}
              email={email}
              onClick={() => onEmailClick(email)}
            />
          ))
        )}
      </div>
    </section>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 mb-6 relative">
        <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin" />
      </div>
      <h3 className="text-lg font-semibold text-slate-300 mb-2">Loading Messages</h3>
      <p className="text-sm text-slate-500">Fetching your emails from the blockchain...</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-4xl mb-6 border border-white/10">
        📬
      </div>
      <h3 className="text-lg font-semibold text-slate-300 mb-2">No messages yet</h3>
      <p className="text-sm text-slate-500">Send your first blockchain-powered email!</p>
      <p className="text-xs text-slate-600 mt-4">
        Connect a wallet and send your first message to any Ethereum address.
      </p>
    </div>
  );
}

interface EmailItemProps {
  email: Email;
  onClick: () => void;
}

function EmailItem({ email, onClick }: EmailItemProps) {
  return (
    <div
      onClick={onClick}
      className="px-6 py-4 border-b border-white/5 cursor-pointer transition-all duration-200 relative group hover:bg-dark-card-hover"
    >
      <div className="absolute left-0 top-0 bottom-0 w-0.5 transition-all duration-200 bg-transparent group-hover:bg-primary/50" />

      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          {email.direction === 'sent' ? (
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
          <span
            className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded ${email.direction === 'sent'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-primary/10 text-primary-light border border-primary/20'
              }`}
          >
            {email.direction}
          </span>
          <span className="text-sm font-semibold text-slate-200">
            {email.direction === 'sent' ? shortenAddress(email.to) : shortenAddress(email.from)}
          </span>
        </div>
        <span className="text-xs text-slate-500">{formatTime(email.timestamp)}</span>
      </div>

      {email.direction === 'sent' ? (
        <div className="text-sm text-slate-400 font-medium mb-1">Encrypted</div>
      ) : (
        <div className="text-xs text-slate-500 truncate">{email.subject}</div>
      )}
    </div>
  );
}
