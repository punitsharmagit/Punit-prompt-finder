import React, { useState } from 'react';
import {
  CustomTestingAreaIcon,
  CustomFolderIcon,
  CustomSettingsIcon,
  CustomTokenUsageIcon,
  CustomSubscriptionIcon,
  CustomChatBubbleIcon,
  CustomNewChatIcon,
  CustomDeleteChatIcon,
  CustomSearchIcon,
  CustomCloseIcon,
  CustomCheckIcon,
  CustomPinIcon,
  CustomRenameIcon,
} from './CustomIcons';
import { GoogleProfileAvatar } from './GoogleProfileAvatar';
import { ChatSession, AuthUser, TokenUsageData } from '../types';
import { useI18n } from '../i18n';

interface ThreeLinesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPlayground: () => void;
  onOpenFolders: () => void;
  onOpenSettings: (tab?: 'settings' | 'tokens' | 'subscription') => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  currentUser: AuthUser | null;
  previousChats: ChatSession[];
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onRenameChat?: (id: string, newTitle: string) => void;
  onTogglePinChat?: (id: string) => void;
  onNewChat: () => void;
  savedPromptsCount: number;
  tokenUsage?: TokenUsageData;
}

export const ThreeLinesDrawer: React.FC<ThreeLinesDrawerProps> = ({
  isOpen,
  onClose,
  onOpenPlayground,
  onOpenFolders,
  onOpenSettings,
  onOpenProfile,
  onOpenAuth,
  currentUser,
  previousChats,
  currentChatId,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
  onTogglePinChat,
  onNewChat,
  savedPromptsCount,
  tokenUsage,
}) => {
  const { t } = useI18n();
  const [searchFilter, setSearchFilter] = useState('');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  if (!isOpen) return null;

  // Sort chats: pinned chats first, then newest first
  const sortedChats = [...previousChats].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.updatedAt - a.updatedAt;
  });

  const filteredChats = sortedChats.filter((chat) =>
    chat.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const startRename = (chat: ChatSession) => {
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
  };

  const handleSaveRename = (chatId: string) => {
    if (editingTitle.trim() && onRenameChat) {
      onRenameChat(chatId, editingTitle.trim());
    }
    setEditingChatId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* 3. THREE LINES MENU ("PROMPTAI MENU") */}
      <div className="relative z-10 flex h-full h-[100dvh] w-[86%] sm:w-[66.666%] min-w-[290px] max-w-[420px] flex-col app-bg-surface text-white shadow-2xl transition-transform duration-300 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        {/* Header: "PROMPTAI MENU" with a close (X) button */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black uppercase tracking-wider text-white">
              PROMPTAI MENU
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white touch-manipulation"
          >
            <CustomCloseIcon size={18} />
          </button>
        </div>

        {/* 3.1 Options (each has an icon, title, subtitle, badge) */}
        <div className="p-3">
          <div className="space-y-1">
            {/* 1. Playground [Live Test] */}
            <button
              type="button"
              onClick={() => {
                onOpenPlayground();
                onClose();
              }}
              className="flex w-full items-center gap-3.5 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-white/5 touch-manipulation"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                <CustomTestingAreaIcon size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{t('playground')}</span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white">
                    Live Test
                  </span>
                </div>
                <p className="truncate text-xs text-slate-400">
                  Testing area for unbreakable commands
                </p>
              </div>
            </button>

            {/* 2. Folders [saved count] */}
            <button
              type="button"
              onClick={() => {
                onOpenFolders();
                onClose();
              }}
              className="flex w-full items-center gap-3.5 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-white/5 touch-manipulation"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                <CustomFolderIcon size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{t('folders')}</span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                    {savedPromptsCount} saved
                  </span>
                </div>
                <p className="truncate text-xs text-slate-400">
                  Organized prompt collections
                </p>
              </div>
            </button>

            {/* 3. Settings */}
            <button
              type="button"
              onClick={() => {
                onOpenSettings('settings');
                onClose();
              }}
              className="flex w-full items-center gap-3.5 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-white/5 touch-manipulation"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                <CustomSettingsIcon size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{t('settings')}</span>
                </div>
                <p className="truncate text-xs text-slate-400">
                  App preferences & parameters
                </p>
              </div>
            </button>

            {/* 4. Token Usage [Dynamic tokens / quota] */}
            {(() => {
              const used = tokenUsage?.totalUsed ?? 14820;
              const quota = tokenUsage?.quota ?? 100000;
              const formatK = (n: number) => {
                if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
                if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
                return `${n}`;
              };
              const isHigh = used / quota >= 0.85;

              return (
                <button
                  type="button"
                  onClick={() => {
                    onOpenSettings('tokens');
                    onClose();
                  }}
                  className="flex w-full items-center gap-3.5 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-white/5 touch-manipulation"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                    <CustomTokenUsageIcon size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">{t('tokenUsage')}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold font-mono transition-colors ${
                          isHigh
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-white/10 text-white'
                        }`}
                      >
                        {formatK(used)} / {formatK(quota)}
                      </span>
                    </div>
                    <p className="truncate text-xs text-slate-400">
                      Quota consumption & model telemetry
                    </p>
                  </div>
                </button>
              );
            })()}

            {/* 5. Subscription [PRO] */}
            <button
              type="button"
              onClick={() => {
                onOpenSettings('subscription');
                onClose();
              }}
              className="flex w-full items-center gap-3.5 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-white/5 touch-manipulation"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                <CustomSubscriptionIcon size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Subscription</span>
                  <span className="rounded-full bg-white text-black px-2 py-0.5 text-[10px] font-black">
                    PRO
                  </span>
                </div>
                <p className="truncate text-xs text-slate-400">
                  Active plan & tier upgrades
                </p>
              </div>
            </button>

            {/* 6. Profile row [Google Account / Login] */}
            <button
              type="button"
              onClick={() => {
                if (currentUser) {
                  onOpenProfile();
                } else {
                  onOpenAuth();
                }
                onClose();
              }}
              className="flex w-full items-center gap-3.5 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-white/5 touch-manipulation"
            >
              <GoogleProfileAvatar
                name={currentUser?.name}
                email={currentUser?.email}
                avatarUrl={currentUser?.avatarUrl}
                size="md"
                showGoogleBadge={true}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white truncate">
                    {currentUser ? currentUser.name : 'Sign In / Register'}
                  </span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-200 shrink-0">
                    {currentUser ? 'Google Account' : 'Login'}
                  </span>
                </div>
                <p className="truncate text-xs text-slate-400">
                  {currentUser ? currentUser.email : 'Opens account sheet'}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative my-1 px-4">
          <div className="h-px w-full bg-white/10" />
        </div>

        {/* 3.2 PREVIOUS CHATS SECTION */}
        <div className="flex flex-1 flex-col overflow-hidden px-3 py-2">
          {/* Header with count and "New" button */}
          <div className="mb-2 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Previous Chats ({previousChats.length})
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">
                Cloud Synced
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                onNewChat();
                onClose();
              }}
              className="flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-[11px] font-semibold text-white hover:bg-white/20 touch-manipulation"
            >
              <CustomNewChatIcon size={14} />
              <span>New</span>
            </button>
          </div>

          {/* Search box: "Search chat history..." */}
          <div className="relative mb-2">
            <div className="pointer-events-none absolute left-3 top-2.5 text-slate-400">
              <CustomSearchIcon size={14} />
            </div>
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search chat history..."
              className="w-full rounded-xl bg-white/5 py-2 pl-9 pr-3 text-[16px] sm:text-xs text-white placeholder-slate-400 outline-none border-0 focus:ring-1 focus:ring-white/20"
            />
          </div>

          {/* Each chat shows title, date/time, and trash icon to delete + pin and rename */}
          <div className="flex-1 space-y-1 overflow-y-auto pr-1 touch-scroll">
            {filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-slate-500">
                <CustomChatBubbleIcon size={26} className="mb-2 text-slate-500" />
                <p className="text-xs text-slate-400">No previous chats found</p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {searchFilter ? 'Try a different search query' : 'Submit an instruction to start'}
                </p>
              </div>
            ) : (
              filteredChats.map((chat) => {
                const isSelected = chat.id === currentChatId;
                const formattedDate = new Date(chat.updatedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const isEditing = editingChatId === chat.id;

                return (
                  <div
                    key={chat.id}
                    className={`group relative flex items-center justify-between rounded-xl px-2.5 py-2 transition-all ${
                      isSelected
                        ? 'bg-white/15 text-white'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {isEditing ? (
                      <div className="flex w-full items-center gap-1.5 py-1">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(chat.id);
                            if (e.key === 'Escape') setEditingChatId(null);
                          }}
                          autoFocus
                          className="flex-1 rounded-lg bg-black px-2 py-1 text-xs text-white outline-none border border-white/30"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveRename(chat.id)}
                          className="rounded-lg bg-white px-2 py-1 text-[10px] font-bold text-black"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingChatId(null)}
                          className="rounded-lg px-1.5 text-[10px] text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectChat(chat.id);
                            onClose();
                          }}
                          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                        >
                          <div
                            className={`shrink-0 ${
                              chat.isPinned
                                ? 'text-white'
                                : isSelected
                                ? 'text-white'
                                : 'text-slate-400 group-hover:text-white'
                            }`}
                          >
                            {chat.isPinned ? (
                              <CustomPinIcon size={15} className="rotate-45 text-white" />
                            ) : (
                              <CustomChatBubbleIcon size={15} />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="truncate text-xs font-semibold text-white">
                                {chat.title || 'Untitled Instruction'}
                              </span>
                              {chat.isPinned && (
                                <span className="rounded bg-white/20 px-1 py-0.2 text-[9px] font-bold text-white">
                                  Pinned
                                </span>
                              )}
                              {chat.isIncognito && (
                                <span className="rounded bg-white/10 px-1 py-0.2 text-[9px] text-slate-300">
                                  Incognito
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">{formattedDate}</span>
                          </div>
                        </button>

                        {/* Action buttons: Pin, Rename, Delete */}
                        <div className="ml-1 flex items-center gap-0.5 opacity-90 sm:opacity-0 transition-opacity group-hover:opacity-100">
                          {onTogglePinChat && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onTogglePinChat(chat.id);
                              }}
                              title={chat.isPinned ? 'Unpin chat' : 'Pin chat'}
                              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                                chat.isPinned
                                  ? 'text-white hover:bg-white/20'
                                  : 'text-slate-400 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              <CustomPinIcon size={14} className={chat.isPinned ? 'rotate-45' : ''} />
                            </button>
                          )}

                          {onRenameChat && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                startRename(chat);
                              }}
                              title="Rename chat"
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
                            >
                              <CustomRenameIcon size={14} />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteChat(chat.id);
                            }}
                            aria-label="Delete chat"
                            title="Delete chat"
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-500/20 hover:text-rose-400"
                          >
                            <CustomDeleteChatIcon size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer: "PromptAI Engine • GitHub, Reddit & FlowGPT Search" */}
        <div className="p-3.5 text-center text-[11px] font-medium text-slate-400 border-t border-white/5">
          PromptAI Engine • GitHub, Reddit & FlowGPT Search
        </div>
      </div>
    </div>
  );
};
