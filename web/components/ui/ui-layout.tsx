'use client';

import { WalletButton } from '../solana/solana-provider';
import * as React from 'react';
import { ReactNode, Suspense, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { AccountChecker } from '../account/account-ui';
import {
  ClusterChecker,
  ClusterUiSelect,
  ExplorerLink,
} from '../cluster/cluster-ui';
import toast, { Toaster } from 'react-hot-toast';
import {
  Home,
  Landmark,
  Users,
  Search,
  ShoppingCart,
  Car,
  CheckCircle2,
  Clock,
  Sparkles,
  BadgeAlert,
  HelpCircle,
  User,
} from 'lucide-react';

export function UiLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { connected } = useWallet();

  // Define role-based navigation
  const navigationLinks = [
    { label: 'Home', path: '/', icon: <Home size={18} />, },
    { label: 'Government', path: '/government', icon: <Landmark size={18} />, role: 'government' },
    { label: 'Users', path: '/users', icon: <Users size={18} />, role: 'user' },
    { label: 'Inspectors', path: '/inspectors', icon: <Search size={18} />, role: 'inspector' },
    { label: 'Marketplace', path: '/marketplace', icon: <ShoppingCart size={18} /> },
    { label: 'My Cars', path: '/my-cars', icon: <Car size={18} /> },
  ];

  return (
    <div className="h-full flex flex-col min-h-screen bg-base-100">
      {/* Header */}
      <div className="navbar bg-primary text-primary-content shadow-lg">
        <div className="navbar-start">
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 text-base-content"
            >
              {navigationLinks.map(({ label, path, icon }) => (
                <li key={path}>
                  <Link
                    href={path}
                    className={pathname === path ? 'active' : ''}
                  >
                    <span className="mr-2">{icon}</span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <Link className="btn btn-ghost normal-case text-xl font-bold" href="/">
            <span className="mr-2"><Car size={24} /></span>
            CarChain
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            {navigationLinks.map(({ label, path, icon }) => (
              <li key={path}>
                <Link
                  className={`${pathname === path ? 'active bg-primary-focus' : ''} hover:bg-primary-focus`}
                  href={path}
                >
                  <span className="mr-1">{icon}</span>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="navbar-end space-x-2">
          <div className="hidden md:flex items-center space-x-2">
            <ClusterUiSelect />
          </div>
          <WalletButton />
        </div>
      </div>

      {/* Connection Status Banner */}
      {!connected && (
        <div className="alert alert-warning shadow-lg">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <span>Please connect your wallet to access Car Chain features</span>
          </div>
        </div>
      )}

      {/* Network and Account Checkers */}
      <ClusterChecker>
        <AccountChecker />
      </ClusterChecker>

      {/* Main Content */}
      <div className="flex-grow container mx-auto px-4 py-6">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center h-64">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <p className="mt-4 text-base-content/70">Loading Car Chain...</p>
            </div>
          }
        >
          {children}
        </Suspense>
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: 'hsl(var(--b1))',
              color: 'hsl(var(--bc))',
            },
          }}
        />
      </div>

      {/* Footer */}
      <footer className="footer footer-center p-6 bg-base-200 text-base-content mt-auto">
        <aside>
          <div className="flex items-center space-x-2 mb-2">
            <Car size={28} />
            <span className="font-bold text-lg">CarChain</span>
          </div>
          <p className="text-sm">
            Decentralized Car Ownership & Trading Platform
          </p>
          <p className="text-xs opacity-70">
            Built on Solana • Powered by Anchor
          </p>
        </aside>
      </footer>
    </div>
  );
}

export function AppModal({
  children,
  title,
  hide,
  show,
  submit,
  submitDisabled,
  submitLabel,
}: {
  children: ReactNode;
  title: string;
  hide: () => void;
  show: boolean;
  submit?: () => void;
  submitDisabled?: boolean;
  submitLabel?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (!dialogRef.current) return;
    if (show) {
      dialogRef.current.showModal();
    } else {
      dialogRef.current.close();
    }
  }, [show, dialogRef]);

  return (
    <dialog className="modal" ref={dialogRef}>
      <div className="modal-box space-y-5 max-w-2xl">
        <h3 className="font-bold text-lg flex items-center">
          <span className="mr-2">🚗</span>
          {title}
        </h3>
        {children}
        <div className="modal-action">
          <div className="join space-x-2">
            {submit ? (
              <button
                className="btn btn-xs lg:btn-md btn-primary"
                onClick={submit}
                disabled={submitDisabled}
              >
                {submitLabel || 'Save'}
              </button>
            ) : null}
            <button onClick={hide} className="btn btn-ghost">
              Close
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

export function AppHero({
  children,
  title,
  subtitle,
}: {
  children?: ReactNode;
  title: ReactNode;
  subtitle: ReactNode;
}) {
  return (
    <div className="hero py-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg">
      <div className="hero-content text-center">
        <div className="max-w-3xl">
          {typeof title === 'string' ? (
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {title}
            </h1>
          ) : (
            title
          )}
          {typeof subtitle === 'string' ? (
            <p className="py-6 text-lg text-base-content/80">{subtitle}</p>
          ) : (
            subtitle
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

// Car-specific components
export function CarStatusBadge({ status }: { status: string }) {
  const statusConfig = {
    verified: { color: 'badge-success', icon: <CheckCircle2 size={14} /> },
    pending: { color: 'badge-warning', icon: <Clock size={14} /> },
    for_sale: { color: 'badge-info', icon: <ShoppingCart size={14} /> },
    sold: { color: 'badge-neutral', icon: <Sparkles size={14} /> },
    inspection_needed: { color: 'badge-error', icon: <BadgeAlert size={14} /> },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    color: 'badge-ghost',
    icon: <HelpCircle size={14} />,
  };

  return (
    <div className={`badge ${config.color} gap-1`}>
      <span>{config.icon}</span>
      {status.replace('_', ' ').toUpperCase()}
    </div>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const roleConfig = {
    government: { color: 'badge-primary', icon: <Landmark size={14} /> },
    inspector: { color: 'badge-secondary', icon: <Search size={14} /> },
    user: { color: 'badge-accent', icon: <User size={14} /> },
  };

  const config = roleConfig[role as keyof typeof roleConfig] || {
    color: 'badge-ghost',
    icon: <HelpCircle size={14} />,
  };

  return (
    <div className={`badge ${config.color} gap-1`}>
      <span>{config.icon}</span>
      {role.toUpperCase()}
    </div>
  );
}

export function ellipsify(str = '', len = 4) {
  if (str.length > 30) {
    return (
      str.substring(0, len) + '..' + str.substring(str.length - len, str.length)
    );
  }
  return str;
}

export function useTransactionToast() {
  return (signature: string) => {
    toast.success(
      <div className={'text-center'}>
        <div className="text-lg font-semibold">🎉 Transaction Successful!</div>
        <ExplorerLink
          path={`tx/${signature}`}
          label={'View on Explorer'}
          className="btn btn-xs btn-primary mt-2"
        />
      </div>,
      {
        duration: 8000,
      }
    );
  };
}

export function useErrorToast() {
  return (message: string) => {
    toast.error(
      <div className={'text-center'}>
        <div className="text-lg font-semibold">❌ Transaction Failed</div>
        <div className="text-sm mt-1">{message}</div>
      </div>,
      {
        duration: 6000,
      }
    );
  };
}
