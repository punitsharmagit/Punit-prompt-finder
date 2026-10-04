import React, { useEffect, useRef } from 'react';
import {
  CustomNewChatIcon,
  CustomDeleteChatIcon,
  CustomIncognitoIcon,
} from './CustomIcons';

interface ThreeDotsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onDeleteChat: () => void;
  isIncognito: boolean;
  onToggleIncognito: () => void;
  hasActiveChat: boolean;
}

export const ThreeDotsMenu: React.FC<ThreeDotsMenuProps> = ({
  isOpen,
  onClose,
  onNewChat,
  onDeleteChat,
  isIncognito,
  onToggleIncognito,
  hasActiveChat,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-12 z-50 w-64 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-[#141724] p-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 text-white"
    >
      <div className="space-y-1">
        {/* Option 1: New Chat - Black & White without border */}
        <button
          type="button"
          onClick={() => {
            onNewChat();
            onClose();
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-white transition-colors hover:bg-white/10 touch-manipulation active:scale-[0.98]"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white shrink-0">
            <CustomNewChatIcon size={18} />
          </div>
          <div>
            <div className="font-semibold text-white">New chat</div>
            <div className="text-xs text-slate-400">Create a new prompt search</div>
          </div>
        </button>

        {/* Option 2: Delete Current Chat - Black & White without border */}
        <button
          type="button"
          onClick={() => {
            onDeleteChat();
            onClose();
          }}
          disabled={!hasActiveChat}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
            hasActiveChat
              ? 'text-white hover:bg-white/10'
              : 'cursor-not-allowed text-white/30'
          }`}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
              hasActiveChat
                ? 'bg-white/10 text-white'
                : 'bg-white/5 text-white/30'
            }`}
          >
            <CustomDeleteChatIcon size={18} />
          </div>
          <div>
            <div className="font-semibold">Delete</div>
            <div className="text-xs text-slate-400">Delete the current chat</div>
          </div>
        </button>

        {/* Option 3: Incognito Mode - Black & White without border */}
        <button
          type="button"
          onClick={() => {
            onToggleIncognito();
            onClose();
          }}
          className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
            isIncognito
              ? 'bg-white/15 text-white'
              : 'text-white hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white">
              <CustomIncognitoIcon size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-white">
                <span>Incognito</span>
                {isIncognito && (
                  <span className="rounded-full bg-white text-black px-1.5 py-0.2 text-[10px] font-bold">
                    ON
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400">Auto-deleted after session</div>
            </div>
          </div>
          <div
            className={`h-2.5 w-2.5 rounded-full transition-colors ${
              isIncognito ? 'bg-white shadow-[0_0_6px_#ffffff]' : 'bg-white/20'
            }`}
          />
        </button>
      </div>

      {isIncognito && (
        <div className="mt-2 flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-[11px] text-slate-300">
          <CustomIncognitoIcon size={14} className="text-white shrink-0" />
          <span>This chat will vanish forever once closed.</span>
        </div>
      )}
    </div>
  );
};
