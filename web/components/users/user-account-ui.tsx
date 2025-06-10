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
  CheckCheck
} from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300">
      <div className="container mx-auto px-4 py-8 space-y-8 max-w-6xl">
        {/* Animated Header */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-4">
            <div className="relative">
              <User className="w-12 h-12 text-primary animate-pulse" />
              <Sparkles className="w-6 h-6 text-accent absolute -top-1 -right-1 animate-bounce" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient">
              Account Management
            </h1>
          </div>
          <p className="text-base-content/70 text-xl max-w-2xl mx-auto">
            Manage your digital identity in the car ownership ecosystem
          </p>
        </div>

        {/* Wallet Balance Card */}
        {publicKey && (
          <WalletBalanceCard 
            publicKey={publicKey} 
            balance={balanceQuery.data || 0}
            isLoading={balanceQuery.isLoading}
            onCopy={copyToClipboard}
            copied={copied}
          />
        )}

        {/* Username Entry or Account View */}
        {!showAccountView ? (
          <UsernameEntrySection 
            publicKey={publicKey}
            enteredUsername={enteredUsername}
            onUsernameChange={setEnteredUsername}
            onSubmit={handleUsernameSubmit}
            onShowRegister={() => setShowRegister(true)}
          />
        ) : (
          <AccountViewSection 
            publicKey={publicKey}
            username={enteredUsername}
            onBack={resetView}
          />
        )}

        {/* User Search */}
        <UserSearchSection 
          searchUsername={searchUsername}
          onSearchChange={setSearchUsername}
        />

        {/* Registration Modal */}
        {showRegister && (
          <UserRegistrationModal onClose={() => setShowRegister(false)} />
        )}
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
      <div className="card bg-gradient-to-r from-warning/10 to-error/10 border border-warning/30 shadow-xl">
        <div className="card-body text-center space-y-6">
          <div className="animate-bounce">
            <AlertTriangle className="w-20 h-20 text-warning mx-auto" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-warning">Wallet Not Connected</h2>
            <p className="text-base-content/70 text-lg">
              Connect your Solana wallet to access the car chain platform
            </p>
          </div>
          <div className="alert alert-warning">
            <AlertTriangle className="w-5 h-5" />
            <span>Please connect your wallet from the top navigation bar</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="card-body space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="relative">
              <KeyRound className="w-16 h-16 text-primary animate-pulse" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                <Eye className="w-3 h-3 text-accent-content" />
              </div>
            </div>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Enter Your Username
          </h2>
          <p className="text-base-content/70 text-lg max-w-lg mx-auto">
            Please provide your registered username to view your account details
          </p>
        </div>

        <div className="max-w-md mx-auto space-y-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-lg">Username</span>
              <span className="label-text-alt text-primary">Required</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter your username..."
                className="input input-bordered input-primary w-full text-lg pr-12 focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={enteredUsername}
                onChange={(e) => onUsernameChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && onSubmit()}
              />
              <User className="w-5 h-5 text-primary absolute right-4 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          <button
            className="btn btn-primary btn-lg w-full gap-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            onClick={onSubmit}
            disabled={!enteredUsername.trim()}
          >
            <Eye className="w-5 h-5" />
            View My Account
          </button>

          <div className="divider text-base-content/50">OR</div>

          <div className="text-center space-y-4">
            <p className="text-base-content/60">Don't have an account yet?</p>
            <button 
              className="btn btn-outline btn-primary gap-2 hover:scale-105 transition-all duration-200"
              onClick={onShowRegister}
            >
              <UserPlus className="w-4 h-4" />
              Register New Account
            </button>
          </div>
        </div>

        {/* Current wallet info */}
        <div className="alert alert-info">
          <div className="flex items-center gap-3 w-full">
            <Wallet className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-semibold">Connected Wallet</div>
              <code className="text-xs opacity-70">{ellipsify(publicKey.toString())}</code>
            </div>
            <ExplorerLink
              path={`account/${publicKey.toString()}`}
              label={<ExternalLink className="w-4 h-4" />}
              className="btn btn-sm btn-ghost"
            />
          </div>
        </div>
      </div>
    </div>
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
      <button
        className="btn btn-ghost gap-2 hover:bg-base-200 transition-all duration-200"
        onClick={onBack}
      >
        <RefreshCw className="w-4 h-4" />
        Change Username
      </button>

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
      <div className="card bg-base-100 shadow-xl border border-info/20">
        <div className="card-body text-center space-y-6">
          <div className="flex flex-col items-center gap-4">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <div className="space-y-2">
              <p className="text-xl font-semibold">Loading Account</p>
              <p className="text-base-content/70">Searching for user "{username}"...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (userQuery.error || !userQuery.data) {
    return (
      <div className="card bg-gradient-to-r from-warning/10 to-error/10 border border-warning/30 shadow-xl">
        <div className="card-body text-center space-y-6">
          <div className="animate-pulse">
            <XCircle className="w-20 h-20 text-warning mx-auto opacity-60" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-warning">
              User Not Found
            </h2>
            <p className="text-base-content/70 text-lg">
              No account found with username: <strong>"{username}"</strong>
            </p>
          </div>

          <div className="alert alert-warning">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Username Mismatch</div>
                <div className="text-sm opacity-70">This username is not associated with your wallet</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-base-content/60">
              Make sure you entered the correct username for this wallet:
            </p>
            <code className="text-xs bg-base-300 px-3 py-2 rounded">{ellipsify(publicKey.toString())}</code>
          </div>
        </div>
      </div>
    );
  }

  const { user } = userQuery.data;

  return (
    <div className="card bg-gradient-to-r from-success/10 to-primary/10 border border-success/30 shadow-xl">
      <div className="card-body space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <CheckCircle className="w-10 h-10 text-success" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full animate-ping opacity-75"></div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-success">Account Found!</h2>
              <p className="text-base-content/70 text-lg">
                Welcome back, <strong>{username}</strong>
              </p>
            </div>
          </div>
          <UserRoleBadge role={user.role} />
        </div>

        <div className="divider my-0"></div>

        <UserAccountDetails user={user} />
      </div>
    </div>
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
    <div className="card bg-base-100 shadow-xl border border-secondary/20 hover:border-secondary/40 transition-all duration-300">
      <div className="card-body space-y-6">
        <div className="flex items-center gap-3">
          <Search className="w-8 h-8 text-secondary" />
          <h2 className="text-2xl font-bold">Search Other Users</h2>
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Enter Username</span>
            <span className="label-text-alt text-secondary">Public search</span>
          </label>
          <div className="join w-full">
            <input
              type="text"
              placeholder="Search any username..."
              className="input input-bordered join-item flex-1 focus:input-secondary"
              value={searchUsername}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <button className="btn btn-secondary join-item">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {searchUsername && (
          <div className="mt-6">
            <UserSearchResults query={userQuery} username={searchUsername} />
          </div>
        )}
      </div>
    </div>
  );
}

// Rest of the component functions remain the same...
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
    <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 shadow-2xl hover:shadow-3xl transition-all duration-300">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-12">
                <Wallet className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold">Wallet Balance</h3>
              <p className="text-base-content/60">Your SOL balance</p>
            </div>
          </div>
          <div className="text-right space-y-2">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <span className="loading loading-spinner loading-sm"></span>
                <span className="text-lg font-mono">Loading...</span>
              </div>
            ) : (
              <div className="text-3xl font-bold font-mono text-primary">
                {balance.toFixed(4)} SOL
              </div>
            )}
          </div>
        </div>

        <div className="divider my-2"></div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-base-content/70">
            <span>Address:</span>
            <code className="bg-base-300 px-2 py-1 rounded text-xs">
              {ellipsify(publicKey.toString())}
            </code>
          </div>
          <div className="flex gap-2">
            <button
              className={`btn btn-sm btn-ghost ${copied ? 'btn-success' : ''}`}
              onClick={() => onCopy(publicKey.toString())}
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
            <ExplorerLink
              path={`account/${publicKey.toString()}`}
              label={<ExternalLink className="w-4 h-4" />}
              className="btn btn-sm btn-ghost"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function UserSearchResults({ query, username }: { query: any; username: string }) {
  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center p-8 space-x-4">
        <span className="loading loading-spinner loading-md text-secondary"></span>
        <span className="text-base-content/70 text-lg">Searching for "{username}"...</span>
      </div>
    );
  }

  if (query.error || !query.data) {
    return (
      <div className="alert alert-warning shadow-lg">
        <AlertTriangle className="w-6 h-6" />
        <div>
          <h3 className="font-bold text-lg">User Not Found</h3>
          <div className="text-sm opacity-70">
            No registered user found with username: <strong>{username}</strong>
          </div>
        </div>
      </div>
    );
  }

  const { user } = query.data;

  return (
    <div className="card bg-gradient-to-r from-secondary/5 to-accent/5 border border-secondary/20">
      <div className="card-body space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-success" />
            <h3 className="text-xl font-semibold">User Found</h3>
          </div>
          <UserRoleBadge role={user.role} />
        </div>
        <UserAccountDetails user={user} />
      </div>
    </div>
  );
}

function UserAccountDetails({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="stat bg-gradient-to-br from-base-300 to-base-200 rounded-2xl shadow-md">
          <div className="stat-figure">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div className="stat-title text-xs opacity-60">Username</div>
          <div className="stat-value text-lg text-primary">{user.userName}</div>
        </div>

        <div className="stat bg-gradient-to-br from-base-300 to-base-200 rounded-2xl shadow-md">
          <div className="stat-figure">
            {user.isVerified ? (
              <ShieldCheck className="w-8 h-8 text-success" />
            ) : (
              <Clock className="w-8 h-8 text-warning animate-pulse" />
            )}
          </div>
          <div className="stat-title text-xs opacity-60">Status</div>
          <div className={`stat-value text-lg ${user.isVerified ? 'text-success' : 'text-warning'}`}>
            {user.isVerified ? 'Verified' : 'Pending'}
          </div>
        </div>

        <div className="stat bg-gradient-to-br from-base-300 to-base-200 rounded-2xl shadow-md">
          <div className="stat-figure">
            <Clock className="w-8 h-8 text-accent" />
          </div>
          <div className="stat-title text-xs opacity-60">Registered</div>
          <div className="stat-value text-sm text-accent">
            {user.createdTimestamp ? new Date(user.createdTimestamp.toNumber() * 1000).toLocaleDateString() : 'Not available'}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center p-4 bg-base-200 rounded-xl hover:bg-base-300 transition-colors duration-200">
          <span className="font-medium flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Public Key:
          </span>
          <ExplorerLink
            path={`account/${user.authority.toString()}`}
            label={ellipsify(user.authority.toString())}
            className="link link-primary hover:link-accent transition-colors duration-200"
          />
        </div>
      </div>

      {!user.isVerified && (
        <div className="alert alert-warning shadow-lg">
          <Clock className="w-6 h-6 animate-pulse" />
          <div>
            <h3 className="font-bold">Verification Pending</h3>
            <div className="text-sm opacity-70">
              Your account is awaiting government verification. You'll be notified once approved.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UserRoleBadge({ role }: { role: any }) {
  // Handle the role object format from Rust
  let roleString = '';
  let config = { color: 'badge-primary', icon: User };
  console.log(role)
  if (role.confirmityExpert) {
    roleString = 'Confirimity Expert';
    config = { color: 'badge-accent', icon: CheckCheck };
  } else if (role.inspector) {
    roleString = 'Inspector';
    config = { color: 'badge-secondary', icon: Shield };
  } else {
    roleString = 'Owner';
    config = { color: 'badge-primary', icon: User };
  }

  const Icon = config.icon;

  return (
    <div className={`badge ${config.color} gap-2 p-3 text-sm font-semibold shadow-lg`}>
      <Icon className="w-4 h-4" />
      {roleString}
    </div>
  );
}

function UserRegistrationModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    userName: '',
    publicDataUri: 'https://example.com/public-data',
    privateDataUri: 'https://example.com/private-data',
    encryptedKeyForGov: 'sample-encrypted-key-gov',
    encryptedKeyForUser: 'sample-encrypted-key-user',
    role: UserRole.Owner,
  });

  const registerMutation = useRegisterUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userName.trim()) {
      toast.error('Username is required!');
      return;
    }
    
    registerMutation.mutate(formData, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl bg-gradient-to-br from-base-100 to-base-200">
        <div className="flex items-center gap-3 mb-6">
          <UserPlus className="w-8 h-8 text-primary" />
          <h3 className="font-bold text-2xl">Register New Account</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">
                Username <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="text"
              className="input input-bordered input-primary focus:input-primary"
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              placeholder="Enter your unique username"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Role</span>
            </label>
            <select
              className="select select-bordered select-primary"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
            >
              <option value={UserRole.Owner}>🚗 Car Owner</option>
              <option value={UserRole.Inspector}>🔍 Inspector</option>
              <option value={UserRole.ConfirmityExpert}>🏛️ Confirimity Expert</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Public Data URI</span>
              </label>
              <input
                type="url"
                className="input input-bordered input-sm"
                value={formData.publicDataUri}
                onChange={(e) => setFormData({ ...formData, publicDataUri: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Private Data URI</span>
              </label>
              <input
                type="url"
                className="input input-bordered input-sm"
                value={formData.privateDataUri}
                onChange={(e) => setFormData({ ...formData, privateDataUri: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="alert alert-info">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 mt-0.5" />
              <div className="text-sm">
                <strong>Important:</strong> After registration, your account will be in pending status 
                until verified by government authorities. You'll receive notification once approved.
              </div>
            </div>
          </div>

          <div className="modal-action">
            <button 
              type="button" 
              className="btn btn-ghost btn-lg" 
              onClick={onClose}
              disabled={registerMutation.isPending}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary btn-lg gap-2 shadow-lg"
              disabled={registerMutation.isPending || !formData.userName.trim()}
            >
              {registerMutation.isPending ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Registering...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Register Account
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
