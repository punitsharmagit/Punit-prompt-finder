import React, { useState } from 'react';
import {
  CustomThreeLinesIcon,
  CustomThreeDotsIcon,
  CustomIncognitoIcon,
} from './CustomIcons';
import { GoogleProfileAvatar } from './GoogleProfileAvatar';
import { AiGlowLogo } from './AiGlowLogo';
import { ThreeDotsMenu } from './ThreeDotsMenu';
import { AuthUser } from '../types';

interface HeaderProps {
  onOpenDrawer: () => void;
  onNewChat: () => void;
  onDeleteChat: () => void;
  isIncognito: boolean;
  onToggleIncognito: () => void;
  hasActiveChat: boolean;
  activeChatTitle?: string;
  currentUser: AuthUser | null;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDrawer,
  onNewChat,
  onDeleteChat,
  isIncognito,
  onToggleIncognito,
  hasActiveChat,
  activeChatTitle,
  currentUser,
  onOpenAuth,
  onOpenProfile,
}) => {
  const [isDotsOpen, setIsDotsOpen] = useState(false);

  return (
    <header className="relative z-30 flex min-h-16 w-full items-center justify-between app-bg-surface px-3 sm:px-4 pt-[max(env(safe-area-inset-top),0.5rem)] pb-2 transition-all border-b border-white/5">
      {/* 3 lines menu button - Black & White without border */}
      <button
        type="button"
        onClick={onOpenDrawer}
        aria-label="Open menu"
        className="flex h-11 w-11 items-center justify-center rounded-xl text-white transition-all hover:bg-white/10 active:scale-95 touch-manipulation"
      >
        <CustomThreeLinesIcon size={24} />
      </button>

      {/* Center Branding */}
      <div className="flex items-center gap-2.5">
        <AiGlowLogo size="sm" />
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold tracking-wide text-white">
              PromptAI
            </span>
            {isIncognito && (
              <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white">
                <CustomIncognitoIcon size={12} className="text-white" />
                <span>Incognito</span>
              </span>
            )}
          </div>
          {activeChatTitle && (
            <span className="max-w-[200px] truncate text-[11px] text-slate-400">
              {activeChatTitle}
            </span>
          )}
        </div>
      </div>

      {/* Right controls: User avatar (Google Account PFP) & 3 dots menu button */}
      <div className="flex items-center gap-2">
        {currentUser ? (
          <button
            type="button"
            onClick={onOpenProfile}
            title={`${currentUser.name} (${currentUser.email})`}
            className="flex items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95"
          >
            <GoogleProfileAvatar
              size="sm"
              name={currentUser.name}
              email={currentUser.email}
              avatarUrl={currentUser.avatarUrl}
              showGoogleBadge={true}
            />
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenAuth}
            className="rounded-xl bg-white px-3 py-1 text-xs font-bold text-black transition-colors hover:bg-slate-200"
          >
            Sign In
          </button>
        )}

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDotsOpen((prev) => !prev)}
            aria-label="More options"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-white transition-all hover:bg-white/10 active:scale-95 touch-manipulation"
          >
            <CustomThreeDotsIcon size={20} />
          </button>

          <ThreeDotsMenu
            isOpen={isDotsOpen}
            onClose={() => setIsDotsOpen(false)}
            onNewChat={onNewChat}
            onDeleteChat={onDeleteChat}
            isIncognito={isIncognito}
            onToggleIncognito={onToggleIncognito}
            hasActiveChat={hasActiveChat}
          />
        </div>
      </div>
    </header>
  );
};
