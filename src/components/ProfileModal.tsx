import React, { useState } from 'react';
import { GoogleProfileAvatar } from './GoogleProfileAvatar';
import { CustomCloseIcon } from './CustomIcons';
import { AuthUser } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenAuth,
  onLogout,
  onDeleteAccount,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    const token = localStorage.getItem('promptai_token');
    try {
      if (token) {
        await fetch('/api/auth/account', {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      onDeleteAccount();
      onClose();
    } catch (e) {
      console.error('Account deletion error:', e);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-t-3xl sm:rounded-3xl bg-[#0E1324] shadow-2xl text-white max-h-[92dvh] flex flex-col pb-[env(safe-area-inset-bottom)] animate-in slide-in-from-bottom sm:slide-in-from-bottom-4 duration-200">
        {/* Mobile Drag Indicator */}
        <div className="mx-auto mt-2.5 h-1 w-12 rounded-full bg-white/20 sm:hidden" />

        {/* Header - Black & White without border */}
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <h3 className="text-base font-bold text-white">Account</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <CustomCloseIcon size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {currentUser ? (
            <>
              {/* User Profile Header with Google PFP & badge */}
              <div className="flex items-center gap-3.5 pb-2">
                <GoogleProfileAvatar
                  size="lg"
                  name={currentUser.name}
                  email={currentUser.email}
                  avatarUrl={currentUser.avatarUrl}
                  showGoogleBadge={true}
                />
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-base font-extrabold text-white">
                    {currentUser.name}
                  </h4>
                  <p className="truncate text-xs text-slate-400">{currentUser.email}</p>
                  <span className="inline-block mt-1 rounded bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                    Verified Google Account
                  </span>
                </div>
              </div>

              {/* Account Options: Delete account & Log out */}
              <div className="space-y-2.5 pt-2">
                {/* Delete account */}
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex w-full items-center justify-between rounded-2xl bg-rose-500/10 px-4 py-3.5 text-left text-xs font-semibold text-rose-400 transition-all hover:bg-rose-500/20 active:scale-[0.99] touch-manipulation"
                >
                  <span className="font-bold">Delete account</span>
                  <span className="text-[11px] text-rose-300 font-mono">Permanent</span>
                </button>

                {/* Log out */}
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3.5 text-left text-xs font-bold text-black transition-all hover:bg-slate-200 active:scale-[0.99] touch-manipulation"
                >
                  <span>Log out</span>
                  <span>→</span>
                </button>
              </div>

              {/* Confirmation Modal for Delete Account */}
              {showDeleteConfirm && (
                <div className="rounded-2xl bg-rose-500/15 border border-rose-500/30 p-4 space-y-3 mt-3 animate-in fade-in duration-150">
                  <div className="text-xs font-bold text-rose-300">
                    Are you sure you want to delete your account?
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    This action is permanent and will delete your account, session tokens, and saved collections.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isDeleting}
                      className="flex-1 rounded-xl bg-white/10 py-2.5 text-xs font-semibold text-white hover:bg-white/20 touch-manipulation"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-500 touch-manipulation"
                    >
                      {isDeleting ? 'Deleting...' : 'Yes, Delete Permanently'}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Sign In with Google</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Connect your Google account to sync unbreakable prompts and quota telemetry across sessions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="w-full rounded-2xl bg-white py-3.5 text-xs font-bold text-black hover:bg-slate-200 transition-all touch-manipulation active:scale-[0.99] shadow-lg flex items-center justify-center gap-2"
              >
                <span>Continue to Google Sign-In</span>
                <span>→</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
