import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Email } from '../types';
import { EmailService } from '../services';

interface ComposeFormProps {
  isConnected: boolean;
  userAddress: string;
  emailService: EmailService;
  onMessageSent: (email: Email) => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  initialRecipient?: string;
}

export function ComposeForm({
  isConnected,
  userAddress,
  emailService,
  onMessageSent,
  onError,
  onSuccess,
  initialRecipient = '',
}: ComposeFormProps) {
  const [recipient, setRecipient] = useState(initialRecipient);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ethers.isAddress(recipient)) {
      onError('Invalid recipient address');
      return;
    }
    if (!subject.trim() || !body.trim()) {
      onError('Please fill in all fields');
      return;
    }

    setIsSending(true);
    try {
      const sentEmail = await emailService.send(userAddress, {
        destination: recipient,
        subject: subject.trim(),
        body: body.trim(),
      });

      onSuccess('Message sent successfully!');
      onMessageSent(sentEmail);
      setRecipient('');
      setSubject('');
      setBody('');
    } catch (err) {
      console.error('Failed to send:', err);
      onError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (initialRecipient && recipient !== initialRecipient && !recipient) {
      setRecipient(initialRecipient);
    }
  }, [initialRecipient, recipient]);

  return (
    <section className="w-[420px] shrink-0 bg-dark-card rounded-2xl border border-white/10 shadow-xl flex flex-col">
      <div className="px-6 py-4 border-b border-white/10 bg-white/2">
        <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <span className="w-1 h-5 bg-linear-to-b from-primary to-accent rounded-full" />
          Compose
        </h2>
      </div>

      <form className="p-6 flex flex-col gap-5 flex-1" onSubmit={handleSend}>
        <div className="flex flex-col gap-2">
          <label htmlFor="recipient" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Recipient
          </label>
          <input
            id="recipient"
            type="text"
            placeholder="0x..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            disabled={isSending}
            className="w-full px-4 py-3 bg-dark-secondary border border-white/10 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-primary/5 transition-all disabled:opacity-50"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="subject" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Subject
          </label>
          <input
            id="subject"
            type="text"
            placeholder="What's this about?"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={isSending}
            className="w-full px-4 py-3 bg-dark-secondary border border-white/10 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-primary/5 transition-all disabled:opacity-50"
          />
        </div>

        <div className="flex flex-col gap-2 flex-1">
          <label htmlFor="body" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Message
          </label>
          <textarea
            id="body"
            placeholder="Write your message here..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={isSending}
            className="w-full flex-1 min-h-[160px] px-4 py-3 bg-dark-secondary border border-white/10 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-primary/5 transition-all resize-none disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={!isConnected || isSending}
          className="w-full py-3.5 bg-linear-to-br from-primary to-accent text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          {isSending ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <span className="text-lg">→</span>
              Send Message
            </>
          )}
        </button>
      </form>
    </section>
  );
}
