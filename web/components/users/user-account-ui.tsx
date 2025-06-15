// src/components/user/user-account-ui.tsx
'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useState, useEffect } from 'react';
import { 
  User, 
  Search, 
  Shield, 
  ShieldCheck, 
  Clock, 
  UserPlus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Wallet,
  Copy,
  ExternalLink,
  Sparkles,
  Crown,
  Eye,
  RefreshCw,
  KeyRound,
  CheckCheck,
  Car,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useGetCurrentUser, 
  useSearchUserByUsername, 
  useRegisterUser, 
  useBalance,
  UserRole 
} from './user-data-access';
import { ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import toast from 'react-hot-toast';

export function UserAccountFeature() {
  const { publicKey } = useWallet();
  const [searchUsername, setSearchUsername] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // New state for username entry
  const [enteredUsername, setEnteredUsername] = useState('');
  const [showAccountView, setShowAccountView] = useState(false);

  const balanceQuery = useBalance(publicKey);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Address copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUsernameSubmit = () => {
    if (enteredUsername.trim()) {
      setShowAccountView(true);
    } else {
      toast.error('Please enter your username');
    }
  };

  const resetView = () => {
    setShowAccountView(false);
    setEnteredUsername('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900">
      <div className="container mx-auto px-4 py-8 space-y-8 max-w-6xl">
        {/* Animated Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6"
        >
          <div className="flex items-center justify-center gap-4">
            <motion.div 
              className="relative"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0] 
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                repeatDelay: 2 
              }}
            >
              <User className="w-12 h-12 text-purple-400" />
              <motion.div
                animate={{ 
                  y: [0, -5, 0],
                  opacity: [0.5, 1, 0.5] 
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity 
                }}
              >
                <Sparkles className="w-6 h-6 text-purple-300 absolute -top-1 -right-1" />
              </motion.div>
            </motion.div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-purple-500 bg-clip-text text-transparent">
              Account Management
            </h1>
          </div>
          <p className="text-purple-200/70 text-xl max-w-2xl mx-auto">
            Manage your digital identity in the car ownership ecosystem
          </p>
        </motion.div>

        {/* Wallet Balance Card */}
        {publicKey && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <WalletBalanceCard 
              publicKey={publicKey} 
              balance={balanceQuery.data || 0}
              isLoading={balanceQuery.isLoading}
              onCopy={copyToClipboard}
              copied={copied}
            />
          </motion.div>
        )}

        {/* Username Entry or Account View */}
        <AnimatePresence mode="wait">
          {!showAccountView ? (
            <motion.div
              key="username-entry"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <UsernameEntrySection 
                publicKey={publicKey}
                enteredUsername={enteredUsername}
                onUsernameChange={setEnteredUsername}
                onSubmit={handleUsernameSubmit}
                onShowRegister={() => setShowRegister(true)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="account-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AccountViewSection 
                publicKey={publicKey}
                username={enteredUsername}
                onBack={resetView}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <UserSearchSection 
            searchUsername={searchUsername}
            onSearchChange={setSearchUsername}
          />
        </motion.div>

        {/* Registration Modal */}
        <AnimatePresence>
          {showRegister && (
            <UserRegistrationModal onClose={() => setShowRegister(false)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function UsernameEntrySection({ 
  publicKey, 
  enteredUsername, 
  onUsernameChange, 
  onSubmit, 
  onShowRegister 
}: {
  publicKey: PublicKey | null;
  enteredUsername: string;
  onUsernameChange: (value: string) => void;
  onSubmit: () => void;
  onShowRegister: () => void;
}) {
  if (!publicKey) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-slate-900/90 to-slate-800/90 backdrop-blur-sm border border-amber-500/30 rounded-3xl p-8 shadow-2xl"
      >
        <div className="text-center space-y-6">
          <motion.div 
            animate={{ 
              bounce: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              repeatDelay: 1 
            }}
          >
            <AlertTriangle className="w-20 h-20 text-amber-400 mx-auto" />
          </motion.div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-amber-400">Wallet Not Connected</h2>
            <p className="text-purple-200/70 text-lg">
              Connect your Solana wallet to access the car chain platform
            </p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <span className="text-amber-200">Please connect your wallet from the top navigation bar</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-r from-slate-900/90 to-purple-900/50 backdrop-blur-sm border border-purple-500/30 rounded-3xl p-8 shadow-2xl hover:shadow-purple-500/20"
    >
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <motion.div 
              className="relative"
              animate={{ 
                scale: [1, 1.05, 1] 
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity 
              }}
            >
              <KeyRound className="w-16 h-16 text-purple-400" />
              <motion.div 
                className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-purple-400/30"
                animate={{ 
                  scale: [1, 1.2, 1] 
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  delay: 0.5 
                }}
              >
                <Eye className="w-3 h-3 text-purple-300" />
              </motion.div>
            </motion.div>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">
            Enter Your Username
          </h2>
          <p className="text-purple-200/70 text-lg max-w-lg mx-auto">
            Please provide your registered username to view your account details
          </p>
        </div>

        <div className="max-w-md mx-auto space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-white font-semibold text-lg">Username</label>
              <span className="text-purple-400 text-sm font-medium">Required</span>
            </div>
            <motion.div 
              className="relative"
              whileFocus={{ scale: 1.02 }}
            >
              <input
                type="text"
                placeholder="Enter your username..."
                className="w-full bg-slate-800/50 border border-purple-500/30 rounded-2xl px-4 py-4 text-lg text-white placeholder-purple-300/50 focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 pr-12"
                value={enteredUsername}
                onChange={(e) => onUsernameChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && onSubmit()}
              />
              <User className="w-5 h-5 text-purple-400 absolute right-4 top-1/2 transform -translate-y-1/2" />
            </motion.div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-4 px-6 rounded-2xl font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onSubmit}
            disabled={!enteredUsername.trim()}
          >
            <Eye className="w-5 h-5" />
            View My Account
          </motion.button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-purple-500/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-900 text-purple-300/60">OR</span>
            </div>
          </div>

          <div className="text-center space-y-4">
            <p className="text-purple-200/60">Don't have an account yet?</p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-slate-800/50 hover:bg-slate-700/50 text-purple-300 hover:text-white px-6 py-3 rounded-2xl border border-purple-500/30 hover:border-purple-400/50 transition-all duration-200 flex items-center gap-2 mx-auto"
              onClick={onShowRegister}
            >
              <UserPlus className="w-4 h-4" />
              Register New Account
            </motion.button>
          </div>
        </div>

        {/* Current wallet info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4"
        >
          <div className="flex items-center gap-3 w-full">
            <Wallet className="w-5 h-5 text-purple-400 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-semibold text-white">Connected Wallet</div>
              <code className="text-xs text-purple-300/70">{ellipsify(publicKey.toString())}</code>
            </div>
            <ExplorerLink
              path={`account/${publicKey.toString()}`}
              label={<ExternalLink className="w-4 h-4" />}
              className="bg-slate-800/50 hover:bg-slate-700/50 text-purple-300 hover:text-white p-2 rounded-xl transition-all duration-200"
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function AccountViewSection({ 
  publicKey, 
  username, 
  onBack 
}: {
  publicKey: PublicKey | null;
  username: string;
  onBack: () => void;
}) {
  const userQuery = useSearchUserByUsername(username);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-slate-800/50 hover:bg-slate-700/50 text-purple-300 hover:text-white px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2"
        onClick={onBack}
      >
        <RefreshCw className="w-4 h-4" />
        Change Username
      </motion.button>

      {/* Account Status */}
      <WalletAccountStatus 
        publicKey={publicKey}
        userQuery={userQuery}
        username={username}
      />
    </div>
  );
}

function WalletAccountStatus({ 
  publicKey, 
  userQuery, 
  username 
}: {
  publicKey: PublicKey | null;
  userQuery: any;
  username: string;
}) {
  if (!publicKey) {
    return null;
  }

  if (userQuery.isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-slate-900/90 backdrop-blur-sm border border-purple-500/30 rounded-3xl p-8 shadow-2xl"
      >
        <div className="text-center space-y-6">
          <div className="flex flex-col items-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-2 border-purple-500/30 border-t-purple-400 rounded-full"
            />
            <div className="space-y-2">
              <p className="text-xl font-semibold text-white">Loading Account</p>
              <p className="text-purple-200/70">Searching for user "{username}"...</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (userQuery.error || !userQuery.data) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-slate-900/90 to-amber-900/20 backdrop-blur-sm border border-amber-500/30 rounded-3xl p-8 shadow-2xl"
      >
        <div className="text-center space-y-6">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              repeatDelay: 1 
            }}
          >
            <XCircle className="w-20 h-20 text-amber-400 mx-auto opacity-60" />
          </motion.div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-amber-400">
              User Not Found
            </h2>
            <p className="text-purple-200/70 text-lg">
              No account found with username: <strong className="text-amber-300">"{username}"</strong>
            </p>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div className="text-left">
                <div className="font-semibold text-amber-200">Username Mismatch</div>
                <div className="text-sm text-amber-300/70">This username is not associated with your wallet</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-purple-200/60">
              Make sure you entered the correct username for this wallet:
            </p>
            <code className="text-xs bg-slate-800/50 text-purple-300 px-3 py-2 rounded-xl border border-purple-500/20">
              {ellipsify(publicKey.toString())}
            </code>
          </div>
        </div>
      </motion.div>
    );
  }

  const { user } = userQuery.data;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-r from-slate-900/90 to-emerald-900/20 backdrop-blur-sm border border-emerald-500/30 rounded-3xl p-8 shadow-2xl"
    >
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
              <motion.div 
                className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.7, 1, 0.7] 
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity 
                }}
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-emerald-400">Account Found!</h2>
              <p className="text-purple-200/70 text-lg">
                Welcome back, <strong className="text-emerald-300">{username}</strong>
              </p>
            </div>
          </div>
          <UserRoleBadge role={user.role} />
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>

        <UserAccountDetails user={user} />
      </div>
    </motion.div>
  );
}

function UserSearchSection({ 
  searchUsername, 
  onSearchChange 
}: {
  searchUsername: string;
  onSearchChange: (value: string) => void;
}) {
  const userQuery = useSearchUserByUsername(searchUsername);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/90 backdrop-blur-sm border border-purple-500/30 rounded-3xl p-8 shadow-2xl hover:border-purple-400/40 transition-all duration-300"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Search className="w-8 h-8 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Search Other Users</h2>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-white font-semibold">Enter Username</label>
            <span className="text-purple-400 text-sm">Public search</span>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search any username..."
              className="flex-1 bg-slate-800/50 border border-purple-500/30 rounded-2xl px-4 py-3 text-white placeholder-purple-300/50 focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
              value={searchUsername}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-2xl transition-all duration-200 flex items-center"
            >
              <Search className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {searchUsername && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6"
            >
              <UserSearchResults query={userQuery} username={searchUsername} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function WalletBalanceCard({ 
  publicKey, 
  balance, 
  isLoading, 
  onCopy, 
  copied 
}: {
  publicKey: PublicKey;
  balance: number;
  isLoading: boolean;
  onCopy: (text: string) => void;
  copied: boolean;
}) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-r from-slate-900/90 to-purple-900/50 backdrop-blur-sm border border-purple-500/30 rounded-3xl p-6 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center"
            animate={{ 
              rotate: [0, 5, -5, 0] 
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              repeatDelay: 2 
            }}
          >
            <Wallet className="w-6 h-6 text-purple-400" />
          </motion.div>
          <div>
            <h3 className="text-xl font-bold text-white">Wallet Balance</h3>
            <p className="text-purple-200/60">Your SOL balance</p>
          </div>
        </div>
        <div className="text-right space-y-2">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-400 rounded-full"
              />
              <span className="text-lg font-mono text-purple-300">Loading...</span>
            </div>
          ) : (
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-3xl font-bold font-mono text-purple-400"
            >
              {balance.toFixed(4)} SOL
            </motion.div>
          )}
        </div>
      </div>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent my-4"></div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-purple-200/70">
          <span>Address:</span>
          <code className="bg-slate-800/50 px-3 py-1 rounded-xl text-xs text-purple-300 border border-purple-500/20">
            {ellipsify(publicKey.toString())}
          </code>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-2 rounded-xl transition-all duration-200 ${
              copied 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-slate-800/50 hover:bg-slate-700/50 text-purple-300 hover:text-white border border-purple-500/30 hover:border-purple-400/50'
            }`}
            onClick={() => onCopy(publicKey.toString())}
          >
            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </motion.button>
          <ExplorerLink
            path={`account/${publicKey.toString()}`}
            label={<ExternalLink className="w-4 h-4" />}
            className="bg-slate-800/50 hover:bg-slate-700/50 text-purple-300 hover:text-white p-2 rounded-xl transition-all duration-200 border border-purple-500/30 hover:border-purple-400/50"
          />
        </div>
      </div>
    </motion.div>
  );
}

function UserSearchResults({ query, username }: { query: any; username: string }) {
  if (query.isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center p-8 space-x-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-400 rounded-full"
        />
        <span className="text-purple-200/70 text-lg">Searching for "{username}"...</span>
      </motion.div>
    );
  }

  if (query.error || !query.data) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 shadow-lg"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-lg text-amber-200">User Not Found</h3>
            <div className="text-sm text-amber-300/70 mt-1">
              No registered user found with username: <strong>{username}</strong>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const { user } = query.data;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 border border-purple-500/20 rounded-2xl p-6"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
            <h3 className="text-xl font-semibold text-white">User Found</h3>
          </div>
          <UserRoleBadge role={user.role} />
        </div>
        <UserAccountDetails user={user} />
      </div>
    </motion.div>
  );
}

function UserAccountDetails({ user }: { user: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-200/60 font-medium">Username</span>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-purple-500/20">
            <span className="text-white font-semibold text-lg">{user.userName}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-200/60 font-medium">Wallet Address</span>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-purple-500/20">
            <code className="text-purple-300 text-xs break-all">
              {user.publicKey}
            </code>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-200/60 font-medium">Account Status</span>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-purple-500/20">
            <UserStatusBadge status={user.verificationStatus?.verified ? 'verified' : 'pending'} />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-200/60 font-medium">Data URIs</span>
          </div>
          <div className="space-y-2">
            {user.publicDataUri && (
              <motion.a
                whileHover={{ scale: 1.02 }}
                href={user.publicDataUri}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-slate-800/50 hover:bg-slate-700/50 rounded-xl p-3 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-200 group-hover:text-white transition-colors">
                    Public Data
                  </span>
                  <ExternalLink className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
                </div>
              </motion.a>
            )}
            {user.privateDataUri && (
              <motion.a
                whileHover={{ scale: 1.02 }}
                href={user.privateDataUri}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-slate-800/50 hover:bg-slate-700/50 rounded-xl p-3 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-200 group-hover:text-white transition-colors">
                    Private Data
                  </span>
                  <ExternalLink className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
                </div>
              </motion.a>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function UserRoleBadge({ role }: { role: UserRole }) {
  const roleConfig = {
    [UserRole.Owner]: {
      icon: Car,
      label: 'Car Owner',
      className: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    },
    [UserRole.Inspector]: {
      icon: Shield,
      label: 'Inspector',
      className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    [UserRole.ConfirmityExpert]: {
      icon: Award,
      label: 'Conformity Expert',
      className: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    },
    [UserRole.Government]: {
      icon: Crown,
      label: 'Government',
      className: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    }
  };

  const config = roleConfig[role] || roleConfig[UserRole.Owner];
  const IconComponent = config.icon;

  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-sm font-semibold ${config.className}`}
    >
      <IconComponent className="w-4 h-4" />
      {config.label}
    </motion.div>
  );
}

function UserStatusBadge({ status }: { status: string }) {
  const statusConfig = {
    pending: {
      icon: Clock,
      label: 'Pending Approval',
      className: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    verified: {
      icon: CheckCircle,
      label: 'Verified',
      className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    rejected: {
      icon: XCircle,
      label: 'Rejected',
      className: 'bg-red-500/20 text-red-300 border-red-500/30'
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const IconComponent = config.icon;

  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-sm font-semibold ${config.className}`}
    >
      <IconComponent className="w-4 h-4" />
      {config.label}
    </motion.div>
  );
}

function UserRegistrationModal({ onClose }: { onClose: () => void }) {
  const { publicKey } = useWallet();
  const registerMutation = useRegisterUser();
  const [formData, setFormData] = useState({
    userName: '',
    role: UserRole.Owner,
    publicDataUri: '',
    privateDataUri: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey || !formData.userName.trim()) return;

    try {
      await registerMutation.mutateAsync({
        ...formData,
        pubkey: publicKey
      });
      toast.success('Registration successful! Your account is pending approval.');
      onClose();
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('Registration failed. Please try again.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-r from-slate-900 to-purple-900/80 backdrop-blur-sm border border-purple-500/30 rounded-3xl p-8 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <motion.div 
              className="flex items-center justify-center gap-3"
              animate={{ 
                scale: [1, 1.05, 1] 
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity 
              }}
            >
              <UserPlus className="w-10 h-10 text-purple-400" />
              <h2 className="text-3xl font-bold text-white">Register New Account</h2>
            </motion.div>
            <p className="text-purple-200/70 text-lg">
              Create your account to access the car chain platform
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-white font-semibold text-lg">
                  Username
                </label>
                <span className="text-red-400 text-sm font-medium">Required</span>
              </div>
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="text"
                className="w-full bg-slate-800/50 border border-purple-500/30 rounded-2xl px-4 py-4 text-lg text-white placeholder-purple-300/50 focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                placeholder="Enter your unique username"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-white font-semibold text-lg">Role</label>
              <motion.select
                whileFocus={{ scale: 1.02 }}
                className="w-full bg-slate-800/50 border border-purple-500/30 rounded-2xl px-4 py-4 text-lg text-white focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              >
                <option value={UserRole.Owner}>🚗 Car Owner</option>
                <option value={UserRole.Inspector}>🔍 Inspector</option>
                <option value={UserRole.ConfirmityExpert}>🏛️ Conformity Expert</option>
              </motion.select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-white font-semibold">Public Data URI</label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="url"
                  className="w-full bg-slate-800/50 border border-purple-500/30 rounded-2xl px-4 py-3 text-white placeholder-purple-300/50 focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                  value={formData.publicDataUri}
                  onChange={(e) => setFormData({ ...formData, publicDataUri: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-3">
                <label className="text-white font-semibold">Private Data URI</label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="url"
                  className="w-full bg-slate-800/50 border border-purple-500/30 rounded-2xl px-4 py-3 text-white placeholder-purple-300/50 focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                  value={formData.privateDataUri}
                  onChange={(e) => setFormData({ ...formData, privateDataUri: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                <div className="space-y-2">
                  <div className="font-semibold text-amber-200">Important Notice</div>
                  <div className="text-sm text-amber-300/80">
                    After registration, your account will be in pending status until verified by government authorities. 
                    You'll receive notification once approved and can start using the platform.
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="flex gap-4 pt-4">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button" 
                className="flex-1 bg-slate-800/50 hover:bg-slate-700/50 text-purple-300 hover:text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-200 border border-purple-500/30 hover:border-purple-400/50"
                onClick={onClose}
                disabled={registerMutation.isPending}
              >
                Cancel
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit" 
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-4 px-6 rounded-2xl font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={registerMutation.isPending || !formData.userName.trim()}
              >
                {registerMutation.isPending ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Registering...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Register Account
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
