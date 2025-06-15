'use client';

import { WalletButton } from '../solana/solana-provider';
import * as React from 'react';
import { ReactNode, Suspense, useEffect, useRef, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

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
  Menu,
  X,
} from 'lucide-react';

// Animation variants (optimized for performance)
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: [0.4, 0, 1, 1] } },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const scaleOnHover = {
  scale: 1.02,
  transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
};

const tapScale = {
  scale: 0.98,
  transition: { duration: 0.1, ease: [0.4, 0, 1, 1] },
};

// Optimized loading spinner component
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center h-64 space-y-4">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ 
        duration: 2, 
        repeat: Infinity, 
        ease: 'linear',
        repeatType: 'loop'
      }}
      className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-500 rounded-full"
    />
    <motion.p 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="text-slate-400 text-sm"
    >
      Loading CarChain...
    </motion.p>
  </div>
);

export function UiLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { connected } = useWallet();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const navigationLinks = [
    { label: 'Home', path: '/', icon: <Home size={18} /> },
    { label: 'Government', path: '/government', icon: <Landmark size={18} />, role: 'government' },
    { label: 'Marketplace', path: '/marketplace', icon: <ShoppingCart size={18} /> },
    { label: 'My Cars', path: '/owned-cars', icon: <Car size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 ">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 40 }}
        className="sticky top-0 z-[99] bg-slate-800/80 backdrop-blur-lg border-b border-purple-500/20"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              whileHover={scaleOnHover}
              whileTap={tapScale}
              className="flex items-center space-x-3"
            >
              <Link href="/" className="flex items-center space-x-3">
                <motion.div 
                  className="p-2 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg shadow-lg"
                  whileHover={{ rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Car size={24} className="text-white" />
                </motion.div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                  CarChain
                </span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <motion.nav
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="hidden lg:flex items-center space-x-1"
            >
              {navigationLinks.map(({ label, path, icon }) => (
                <motion.div key={path} variants={fadeInUp}>
                  <Link
                    href={path}
                    className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2 group ${
                      pathname === path
                        ? 'text-purple-300 bg-purple-500/20 shadow-lg shadow-purple-500/10'
                        : 'text-slate-300 hover:text-purple-300 hover:bg-slate-700/50'
                    }`}
                  >
                    <span className="transition-transform group-hover:scale-110">
                      {icon}
                    </span>
                    <span>{label}</span>
                    {pathname === path && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-purple-500/10 border border-purple-500/30 rounded-xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                </motion.div>
              ))}
            </motion.nav>

            {/* Right Side */}
            <div className="flex items-center space-x-3">
              <motion.div 
                className="hidden md:block"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <ClusterUiSelect />
              </motion.div>
              
              <motion.div
                whileHover={scaleOnHover}
                whileTap={tapScale}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <WalletButton />
              </motion.div>

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={scaleOnHover}
                whileTap={tapScale}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl bg-slate-700/80 text-slate-300 hover:bg-slate-600/80 hover:text-white transition-all duration-200 backdrop-blur-sm"
                aria-label="Toggle mobile menu"
              >
                <motion.div
                  animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                >
                  {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </motion.div>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence mode="wait">
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="lg:hidden bg-slate-800/95 backdrop-blur-lg border-t border-purple-500/20"
            >
              <motion.div 
                className="p-4 space-y-2"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {navigationLinks.map(({ label, path, icon }, index) => (
                  <motion.div
                    key={path}
                    variants={fadeInUp}
                    custom={index}
                  >
                    <Link
                      href={path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                        pathname === path
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-lg shadow-purple-500/10'
                          : 'text-slate-300 hover:bg-slate-700/50 hover:text-purple-300'
                      }`}
                    >
                      <span className="transition-transform group-hover:scale-110">
                        {icon}
                      </span>
                      <span className="font-medium">{label}</span>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Connection Status Banner */}
      <AnimatePresence>
        {!connected && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ type: 'spring', damping: 25 }}
            className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-amber-500/20 text-amber-300 px-4 py-3 text-center text-sm backdrop-blur-sm"
          >
            <div className="flex items-center justify-center space-x-2 container mx-auto">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <BadgeAlert size={16} />
              </motion.div>
              <span className="font-medium">Connect your wallet to access CarChain features</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Network and Account Checkers */}
      <ClusterChecker>
        <AccountChecker />
      </ClusterChecker>

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="flex-1 container mx-auto px-4 py-8"
      >
        <Suspense fallback={<LoadingSpinner />}>
          {children}
        </Suspense>
      </motion.main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="bg-gradient-to-t from-slate-900 to-slate-800/50 border-t border-slate-700/50 mt-auto backdrop-blur-sm"
      >
        <div className="container mx-auto px-4 py-8 text-center">
          <motion.div 
            className="flex items-center justify-center space-x-2 mb-3"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div 
              className="p-1.5 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg shadow-lg"
              whileHover={{ rotate: 5 }}
            >
              <Car size={20} className="text-white" />
            </motion.div>
            <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              CarChain
            </span>
          </motion.div>
          <p className="text-slate-300 text-sm mb-2 font-medium">
            Decentralized Car Ownership & Trading Platform
          </p>
          <p className="text-slate-500 text-xs">
            Built on Solana • Powered by Anchor
          </p>
        </div>
      </motion.footer>

      {/* Toast Container */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: 'rgba(30, 41, 59, 0.95)',
            color: '#f1f5f9',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '12px',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          },
          success: {
            iconTheme: {
              primary: '#8b5cf6',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </div>
  );
}

// Rest of the components remain the same with minor optimizations...
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

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && show) {
        hide();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [show, hide]);

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.dialog
          ref={dialogRef}
          className="modal modal-open backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 300,
              duration: 0.4 
            }}
            className="modal-box max-w-2xl bg-slate-800/95 border border-slate-700/50 backdrop-blur-lg shadow-2xl shadow-purple-500/10"
          >
            <motion.div 
              className="flex items-center space-x-2 mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div 
                className="p-2 bg-purple-500/20 rounded-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Car size={20} className="text-purple-400" />
              </motion.div>
              <h3 className="text-xl font-semibold text-slate-100">{title}</h3>
            </motion.div>
            
            <motion.div 
              className="space-y-4 text-slate-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {children}
            </motion.div>
            
            <motion.div 
              className="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-700/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.button
                whileHover={scaleOnHover}
                whileTap={tapScale}
                onClick={hide}
                className="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors duration-200 rounded-lg hover:bg-slate-700/30"
              >
                Cancel
              </motion.button>
              {submit && (
                <motion.button
                  whileHover={scaleOnHover}
                  whileTap={tapScale}
                  onClick={submit}
                  disabled={submitDisabled}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
                >
                  {submitLabel || 'Save'}
                </motion.button>
              )}
            </motion.div>
          </motion.div>
          
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop bg-black/50 backdrop-blur-sm"
            onClick={hide}
          />
        </motion.dialog>
      )}
    </AnimatePresence>
  );
}

// Rest of the components remain the same...
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
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className=" mx-auto relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900/30 via-slate-800/50 to-purple-800/30 border border-purple-500/20 shadow-2xl shadow-purple-500/10"
    >
      {/* Gradient overlays */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-purple-400/5 to-transparent" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
      </div>
      
      {/* Content container */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="relative text-center py-20 px-8"
      >
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Title */}
          {typeof title === 'string' ? (
            <motion.h1 
              className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-300 via-purple-200 to-purple-400 bg-clip-text text-transparent drop-shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {title}
            </motion.h1>
          ) : (
            title
          )}

          {/* Subtitle */}
          {typeof subtitle === 'string' ? (
            <motion.p 
              className="text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {subtitle}
            </motion.p>
          ) : (
            subtitle
          )}

          {/* Optional children */}
          {children && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="pt-4"
            >
              {children}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Decorative elements */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
    </motion.div>
  );
}

// Badge components remain unchanged as they're already well-optimized
export function CarStatusBadge({ status }: { status: string }) {
  const statusConfig = {
    verified: { color: 'bg-green-500/20 text-green-300 border-green-500/30', icon: <CheckCircle2 size={14} /> },
    pending: { color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: <Clock size={14} /> },
    for_sale: { color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: <ShoppingCart size={14} /> },
    sold: { color: 'bg-slate-500/20 text-slate-300 border-slate-500/30', icon: <Sparkles size={14} /> },
    inspection_needed: { color: 'bg-red-500/20 text-red-300 border-red-500/30', icon: <BadgeAlert size={14} /> },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    color: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    icon: <HelpCircle size={14} />,
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
      className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg border text-xs font-medium ${config.color}`}
    >
      <span>{config.icon}</span>
      <span>{status.replace('_', ' ').toUpperCase()}</span>
    </motion.div>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const roleConfig = {
    government: { color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', icon: <Landmark size={14} /> },
    inspector: { color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', icon: <Search size={14} /> },
    user: { color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: <User size={14} /> },
  };

  const config = roleConfig[role as keyof typeof roleConfig] || {
    color: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    icon: <HelpCircle size={14} />,
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
      className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg border text-xs font-medium ${config.color}`}
    >
      <span>{config.icon}</span>
      <span>{role.toUpperCase()}</span>
    </motion.div>
  );
}

// Utility functions remain the same
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
      <div className="text-center">
        <div className="text-lg font-semibold flex items-center justify-center space-x-2">
          <Sparkles size={18} className="text-green-400" />
          <span>Transaction Successful!</span>
        </div>
        <ExplorerLink
          path={`tx/${signature}`}
          label="View on Explorer"
          className="inline-block mt-2 px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors"
        />
      </div>,
      { duration: 8000 }
    );
  };
}

export function useErrorToast() {
  return (message: string) => {
    toast.error(
      <div className="text-center">
        <div className="text-lg font-semibold flex items-center justify-center space-x-2">
          <BadgeAlert size={18} className="text-red-400" />
          <span>Transaction Failed</span>
        </div>
        <div className="text-sm mt-1 text-slate-300">{message}</div>
      </div>,
      { duration: 6000 }
    );
  };
}
