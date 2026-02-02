/**
 * Hook: load emails from contract + IPFS, poll for new messages, refresh.
 * Logic is detached from EmailList UI.
 */

import { useEffect, useState, useCallback } from 'react';
import { Email } from '../types';
import { EmailService } from '../services';

const POLL_INTERVAL_MS = 30 * 1000;

export interface UseEmailsParams {
  userAddress: string;
  emailService: EmailService;
}

export interface UseEmailsReturn {
  emails: Email[];
  isLoading: boolean;
  isRefreshing: boolean;
  refresh: () => Promise<void>;
  addEmail: (email: Email) => void;
}

export function useEmails({
  userAddress,
  emailService,
}: UseEmailsParams): UseEmailsReturn {
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async () => {
    const list = await emailService.load(userAddress);
    setEmails(list);
  }, [userAddress, emailService]);

  const refresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);

    try {
      await load();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [load, isRefreshing]);

  const addEmail = useCallback((email: Email) => {
    setEmails((prev) => {
      if (prev.some((e) => e.cid === email.cid)) return prev;
      return [email, ...prev];
    });
  }, []);

  useEffect(() => {
    if (!userAddress) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    let pollInterval: ReturnType<typeof setInterval>;

    const pollForEvents = async () => {
      try {
        const newEmails = await emailService.load(userAddress);
        setEmails(newEmails);
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    const init = async () => {
      try {
        await load();
        pollInterval = setInterval(pollForEvents, POLL_INTERVAL_MS);
      } catch (error) {
        console.error('Error loading emails:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [userAddress, load]);

  return {
    emails,
    isLoading,
    isRefreshing,
    refresh,
    addEmail,
  };
}
