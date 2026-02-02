// src/App.tsx
import { useState } from 'react';
import { ethers } from 'ethers';
import {
  Header,
  EmailList,
  ComposeForm,
  ConnectModal,
  CreateWalletModal,
  ImportWalletModal,
  EmailDetailModal,
  WelcomeScreen,
  Toast,
} from './components';
import { useToast } from './hooks/useToast';
import { useWallet } from './hooks/useWallet';
import { Email } from './types';

function App() {
  const { toast, showToast } = useToast();
  const {
    isConnected,
    emailService,
    isReconnecting,
    userAddress,
    networkName,
    cachedWallets,
    connectWithWallet,
    reconnectCachedWallet,
    disconnect,
    addEmail,
    markAsRead,
  } = useWallet(showToast);

  // UI state
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showCreateWalletModal, setShowCreateWalletModal] = useState(false);
  const [showImportWalletModal, setShowImportWalletModal] = useState(false);
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

  const handleUseWallet = async (wallet: ethers.Wallet | ethers.HDNodeWallet) => {
    await connectWithWallet(wallet);
    setShowConnectModal(false);
    setShowCreateWalletModal(false);
    setShowImportWalletModal(false);
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
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 mb-6 mx-auto relative">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin" />
              </div>
              <h2 className="text-xl font-semibold text-slate-200 mb-2">Reconnecting...</h2>
              <p className="text-slate-400 text-sm">Restoring your wallet</p>
            </div>
          </div>
        ) : !isConnected ? (
          <WelcomeScreen onConnect={() => setShowConnectModal(true)} />
        ) : (
          <>
            <EmailList
              userAddress={userAddress}
              emailService={emailService!}
              onEmailClick={handleEmailClick}
              newSentEmail={newSentEmail}
            />
            <ComposeForm
              isConnected={isConnected}
              userAddress={userAddress}
              emailService={emailService!}
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
        cachedWallets={cachedWallets}
        onReconnectCached={async (address) => {
          await reconnectCachedWallet(address);
          setShowConnectModal(false);
        }}
        onOpenCreateWallet={() => {
          setShowConnectModal(false);
          setShowCreateWalletModal(true);
        }}
        onOpenImportWallet={() => {
          setShowConnectModal(false);
          setShowImportWalletModal(true);
        }}
      />

      <CreateWalletModal
        isOpen={showCreateWalletModal}
        onClose={() => setShowCreateWalletModal(false)}
        onUseWallet={handleUseWallet}
      />

      <ImportWalletModal
        isOpen={showImportWalletModal}
        onClose={() => setShowImportWalletModal(false)}
        onUseWallet={handleUseWallet}
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
