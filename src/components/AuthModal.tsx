import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User as UserIcon,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import { CustomCloseIcon } from './CustomIcons';
import { GoogleProfileAvatar } from './GoogleProfileAvatar';
import { AuthUser } from '../types';
import { signInWithFirebaseGoogle } from '../firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: AuthUser, token: string) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  React.useEffect(() => {
    setMode(initialMode);
    setErrorMessage(null);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (mode === 'register') {
      if (!name.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }
    }

    setIsLoading(true);

    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const payload =
        mode === 'register'
          ? {
              email: email.trim(),
              password,
              name: name.trim(),
              avatarUrl: 'https://lh3.googleusercontent.com/a/ACg8ocL7X8p9W1mQ0rZ',
            }
          : { email: email.trim(), password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify credentials.');
      }

      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFirebaseGoogleSignIn = async () => {
    setIsGoogleSigningIn(true);
    setErrorMessage(null);

    try {
      // 1. Authenticate with Google via Firebase Auth Popup
      const { firebaseUser, idToken } = await signInWithFirebaseGoogle();

      // 2. Exchange Firebase profile with Express backend to generate unified session
      const res = await fetch('/api/auth/firebase-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Google User',
          avatarUrl: firebaseUser.photoURL || '',
          idToken,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete Firebase session synchronization.');
      }

      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      console.warn('Firebase Google Sign-In notice:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Google Sign-In popup was closed before completion.');
      } else if (err?.code === 'auth/popup-blocked') {
        setErrorMessage('Browser blocked Google popup. Please allow popups or try again.');
      } else if (err?.code === 'auth/unauthorized-domain') {
        setErrorMessage('Current domain is not authorized in Firebase Auth. Check Firebase Console.');
      } else {
        setErrorMessage(err?.message || 'Firebase Google Sign-In encountered an error.');
      }
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-t-3xl sm:rounded-3xl bg-[#0F1424] shadow-2xl max-h-[92dvh] flex flex-col pb-[env(safe-area-inset-bottom)] animate-in slide-in-from-bottom sm:slide-in-from-bottom-4 duration-200">
        {/* Mobile Drag Indicator */}
        <div className="mx-auto mt-2.5 h-1 w-12 rounded-full bg-white/20 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {mode === 'login' ? 'User Login' : 'User Registration'}
              </h3>
              <p className="text-xs text-slate-400">
                {mode === 'login'
                  ? 'Access your saved unbreakable prompts & session'
                  : 'Register a secure account to sync prompts'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <CustomCloseIcon size={18} />
          </button>
        </div>

        {/* Real Firebase Google Sign-In Button */}
        <div className="p-4 bg-white/5 border-b border-white/5 space-y-2">
          <button
            type="button"
            onClick={handleFirebaseGoogleSignIn}
            disabled={isGoogleSigningIn || isLoading}
            className="w-full flex items-center justify-between gap-3 rounded-2xl bg-white text-black p-3.5 text-left transition-all hover:bg-slate-200 active:scale-[0.99] touch-manipulation group shadow-lg"
          >
            <div className="flex items-center gap-3">
              {/* Official Google G Logo */}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm border border-slate-200 shrink-0">
                <svg viewBox="0 0 24 24" className="h-5 w-5">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-xs font-black text-black">
                  {isGoogleSigningIn ? 'Connecting to Google...' : 'Sign in with Google'}
                </div>
                <div className="text-[11px] text-slate-600 font-medium">
                  Firebase Authentication • 1-Click
                </div>
              </div>
            </div>
            <span className="text-[11px] font-bold text-black bg-black/10 rounded-xl px-2.5 py-1 shrink-0">
              {isGoogleSigningIn ? 'Opening...' : 'Continue →'}
            </span>
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 border-b border-white/5 p-1 bg-[#0A0E1A]">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`rounded-xl py-2 text-xs font-bold transition-all ${
              mode === 'login'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In with Password
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`rounded-xl py-2 text-xs font-bold transition-all ${
              mode === 'register'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Register Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl bg-white/10 p-3 text-xs text-white">
              <AlertCircle className="h-4 w-4 shrink-0 text-white" />
              <span>{errorMessage}</span>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-300">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Punit Trainer"
                  className="w-full rounded-xl border border-slate-800 bg-[#090D18] py-2.5 pl-9 pr-3 text-[16px] sm:text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-slate-800 bg-[#090D18] py-2.5 pl-9 pr-3 text-[16px] sm:text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-300">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-800 bg-[#090D18] py-2.5 pl-9 pr-9 text-[16px] sm:text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-300">
                Confirm Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-800 bg-[#090D18] py-2.5 pl-9 pr-3 text-[16px] sm:text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-2.5 text-xs font-bold text-black shadow-md transition-all hover:bg-slate-200 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-black" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="h-4 w-4 text-black" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
