// src/App.tsx
import { useState } from 'react';
import {
  Header,
  EmailList,
  ComposeForm,
  ConnectModal,
  EmailDetailModal,
  WelcomeScreen,
  Toast
} from './components';
import { useToast } from './hooks/useToast';
import { useWallet } from './hooks/useWallet';
import { Email } from './types';

function App() {
  const { toast, showToast } = useToast();
  const {
    isConnected,
    contract,
    userAddress,
    networkName,
    isReconnecting,
    connectHardhat,
    disconnect,
    addEmail,
    markAsRead,
  } = useWallet(showToast);

  // UI state
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [replyTo, setReplyTo] = useState('');
  const [newSentEmail, setNewSentEmail] = useState<Email | null>(null);

  // Handle email click
  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email);
    markAsRead(email.id);
  };

  // Handle reply
  const handleReply = (address: string) => {
    setReplyTo(address);
    setSelectedEmail(null);
  };

  // Handle connect
  const handleConnectHardhat = async (index: number) => {
    await connectHardhat(index);
    setShowConnectModal(false);
  };

  return (
    <div className="min-h-screen bg-dark-primary bg-pattern">
      <Header
        isConnected={isConnected}
        userAddress={userAddress}
        networkName={networkName}
        onConnect={() => setShowConnectModal(true)}
        onDisconnect={disconnect}
      />

      <main className="max-w-7xl mx-auto p-6 flex gap-6">
        {isReconnecting ? (
          /* Reconnecting State */
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 mb-6 mx-auto relative">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin" />
              </div>
              <h2 className="text-xl font-semibold text-slate-200 mb-2">Reconnecting...</h2>
              <p className="text-slate-400 text-sm">Restoring your previous session</p>
            </div>
          </div>
        ) : !isConnected ? (
          <WelcomeScreen onConnect={() => setShowConnectModal(true)} />
        ) : (
          <>
            <EmailList
              userAddress={userAddress}
              contract={contract!}
              onEmailClick={handleEmailClick}
              newSentEmail={newSentEmail}
            />
            <ComposeForm
              isConnected={isConnected}
              userAddress={userAddress}
              contract={contract}
              onMessageSent={(email) => {
                addEmail(email);
                setNewSentEmail(email);
              }}
              onError={(msg) => showToast(msg, 'error')}
              onSuccess={(msg) => showToast(msg, 'success')}
              initialRecipient={replyTo}
            />
          </>
        )}
      </main>

      <ConnectModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onConnectHardhat={handleConnectHardhat}
      />

      <EmailDetailModal
        email={selectedEmail}
        onClose={() => setSelectedEmail(null)}
        onReply={handleReply}
      />

      {toast && <Toast toast={toast} />}
    </div>
  );
}

export default App;
