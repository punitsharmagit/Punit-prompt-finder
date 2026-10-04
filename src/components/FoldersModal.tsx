import React, { useState } from 'react';
import {
  CustomFolderIcon,
  CustomTestingAreaIcon,
  CustomDeleteChatIcon,
  CustomCloseIcon,
  CustomCopyIcon,
  CustomCheckIcon,
  CustomRenameIcon,
} from './CustomIcons';
import { SavedFolder } from '../types';

interface FoldersModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: SavedFolder[];
  onAddFolder: (name: string, instruction?: string) => void;
  onRenameFolder?: (folderId: string, newName: string) => void;
  onDeleteFolder?: (folderId: string) => void;
  onUpdateFolderInstruction?: (folderId: string, instruction: string) => void;
  onMovePromptToFolder?: (promptId: string, fromFolderId: string, toFolderId: string) => void;
  onDeletePromptFromFolder: (folderId: string, promptId: string) => void;
  onSendToPlayground: (prompt: string, title: string) => void;
}

export const FoldersModal: React.FC<FoldersModalProps> = ({
  isOpen,
  onClose,
  folders,
  onAddFolder,
  onRenameFolder,
  onDeleteFolder,
  onUpdateFolderInstruction,
  onMovePromptToFolder,
  onDeletePromptFromFolder,
  onSendToPlayground,
}) => {
  const [activeFolderId, setActiveFolderId] = useState<string>(folders[0]?.id || '');
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderInstruction, setNewFolderInstruction] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Rename folder state
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  // Folder-level instruction state
  const [isEditingInstruction, setIsEditingInstruction] = useState(false);
  const [instructionValue, setInstructionValue] = useState('');

  if (!isOpen) return null;

  const currentFolder = folders.find((f) => f.id === activeFolderId) || folders[0];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    onAddFolder(newFolderName.trim(), newFolderInstruction.trim() || undefined);
    setNewFolderName('');
    setNewFolderInstruction('');
    setIsCreatingFolder(false);
  };

  const handleSaveRename = () => {
    if (renameValue.trim() && onRenameFolder && currentFolder) {
      onRenameFolder(currentFolder.id, renameValue.trim());
    }
    setIsRenaming(false);
  };

  const handleSaveInstruction = () => {
    if (onUpdateFolderInstruction && currentFolder) {
      onUpdateFolderInstruction(currentFolder.id, instructionValue);
    }
    setIsEditingInstruction(false);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative z-10 flex h-[90vh] h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl bg-[#0E1324] shadow-2xl text-white pb-[env(safe-area-inset-bottom)] animate-in slide-in-from-bottom sm:slide-in-from-bottom-4 duration-200">
        {/* Mobile Drag Indicator */}
        <div className="mx-auto mt-2.5 h-1 w-12 rounded-full bg-white/20 sm:hidden" />

        {/* Header - Black & White without border */}
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">
              <CustomFolderIcon size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Prompt Folders</h3>
              <p className="text-xs text-slate-400">
                Create, rename, delete collections & apply folder-level instructions
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <CustomCloseIcon size={18} />
          </button>
        </div>

        {/* Content area */}
        <div className="grid flex-1 grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5 overflow-hidden">
          {/* Left Column: Folder List */}
          <div className="flex flex-col p-4 space-y-2 bg-[#0A0E1A]/40 overflow-y-auto touch-scroll">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Folders ({folders.length})
              </span>
              <button
                type="button"
                onClick={() => setIsCreatingFolder(true)}
                className="flex items-center gap-1 text-[11px] font-semibold text-white hover:text-slate-300 touch-manipulation"
              >
                <CustomFolderIcon size={14} />
                <span>+ New</span>
              </button>
            </div>

            {isCreatingFolder && (
              <form onSubmit={handleCreate} className="mb-2 space-y-2 rounded-xl bg-white/5 p-3 animate-in fade-in duration-150">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder name (e.g. System Security)..."
                  autoFocus
                  className="w-full rounded-lg border-0 bg-slate-900 px-2.5 py-1.5 text-xs text-white focus:outline-none"
                />
                <input
                  type="text"
                  value={newFolderInstruction}
                  onChange={(e) => setNewFolderInstruction(e.target.value)}
                  placeholder="Optional folder instruction..."
                  className="w-full rounded-lg border-0 bg-slate-900 px-2.5 py-1.5 text-[11px] text-slate-300 focus:outline-none"
                />
                <div className="flex items-center justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCreatingFolder(false)}
                    className="rounded px-2 py-1 text-[10px] text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded bg-white px-3 py-1 text-[10px] font-bold text-black hover:bg-slate-200"
                  >
                    Create
                  </button>
                </div>
              </form>
            )}

            {folders.map((folder) => {
              const isSelected = (currentFolder?.id || '') === folder.id;
              return (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => {
                    setActiveFolderId(folder.id);
                    setIsRenaming(false);
                    setIsEditingInstruction(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs transition-all touch-manipulation ${
                    isSelected
                      ? 'bg-white/10 text-white font-semibold'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <CustomFolderIcon
                      size={16}
                      className={`shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`}
                    />
                    <span className="truncate">{folder.name}</span>
                  </div>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                    {folder.prompts.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Column: Prompts in Selected Folder */}
          <div className="col-span-2 flex flex-col p-5 overflow-y-auto touch-scroll">
            {/* Folder Header Actions: Name, Rename, Delete */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
              <div className="flex-1 min-w-[200px]">
                {isRenaming ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename();
                        if (e.key === 'Escape') setIsRenaming(false);
                      }}
                      autoFocus
                      className="rounded-lg bg-black px-2 py-1 text-sm font-bold text-white border border-white/30 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleSaveRename}
                      className="rounded bg-white px-2 py-1 text-xs font-bold text-black"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsRenaming(false)}
                      className="text-xs text-slate-400 hover:text-white px-1"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">
                      {currentFolder?.name || 'All Saved Prompts'}
                    </h4>
                    {currentFolder && onRenameFolder && (
                      <button
                        type="button"
                        onClick={() => {
                          setRenameValue(currentFolder.name);
                          setIsRenaming(true);
                        }}
                        className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10"
                        title="Rename folder"
                      >
                        <CustomRenameIcon size={14} />
                      </button>
                    )}
                  </div>
                )}
                <p className="text-xs text-slate-400 mt-0.5">
                  {currentFolder?.prompts.length || 0} command templates saved
                </p>
              </div>

              {/* Folder Actions: Delete folder */}
              {currentFolder && onDeleteFolder && folders.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete folder "${currentFolder.name}" and its prompts?`)) {
                      onDeleteFolder(currentFolder.id);
                    }
                  }}
                  className="flex items-center gap-1 rounded-xl bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20"
                >
                  <CustomDeleteChatIcon size={14} />
                  <span>Delete Folder</span>
                </button>
              )}
            </div>

            {/* Folder-level instruction block */}
            {currentFolder && (
              <div className="mb-4 rounded-2xl bg-white/5 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <span>Folder-Level Instruction</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isEditingInstruction) {
                        setInstructionValue(currentFolder.folderInstruction || '');
                      }
                      setIsEditingInstruction(!isEditingInstruction);
                    }}
                    className="text-[10px] font-bold text-slate-300 hover:text-white underline"
                  >
                    {isEditingInstruction ? 'Cancel' : currentFolder.folderInstruction ? 'Edit' : '+ Add Instruction'}
                  </button>
                </div>

                {isEditingInstruction ? (
                  <div className="space-y-2 pt-1">
                    <textarea
                      value={instructionValue}
                      onChange={(e) => setInstructionValue(e.target.value)}
                      placeholder="e.g. Always format outputs as rigid JSON matrices with strict delimiter guards..."
                      rows={2}
                      className="w-full rounded-xl bg-black p-2.5 text-xs text-white placeholder-slate-500 outline-none border border-white/20"
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={handleSaveInstruction}
                        className="rounded-lg bg-white px-3 py-1 text-xs font-bold text-black"
                      >
                        Save Instruction
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-300 leading-relaxed font-mono">
                    {currentFolder.folderInstruction ||
                      'No folder-level instruction configured. Prompts in this folder inherit standard global parameters.'}
                  </p>
                )}
              </div>
            )}

            {/* Prompts list */}
            {(!currentFolder || currentFolder.prompts.length === 0) ? (
              <div className="flex flex-1 flex-col items-center justify-center text-center text-slate-500 py-16">
                <CustomFolderIcon size={36} className="mb-3 text-slate-600" />
                <p className="text-sm font-medium text-slate-400">No prompts in this folder</p>
                <p className="mt-1 text-xs text-slate-500 max-w-xs">
                  Save any prompt from search results to keep it accessible here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentFolder.prompts.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-[#0A0E1A] p-4 shadow-md transition-all hover:bg-[#0c1120]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white">
                            {item.source}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(item.savedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h5 className="mt-1 text-sm font-bold text-slate-100">{item.title}</h5>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Move to another folder selector */}
                        {folders.length > 1 && onMovePromptToFolder && (
                          <select
                            onChange={(e) => {
                              if (e.target.value && e.target.value !== currentFolder.id) {
                                onMovePromptToFolder(item.id, currentFolder.id, e.target.value);
                              }
                            }}
                            value={currentFolder.id}
                            className="rounded-lg bg-white/10 px-2 py-1 text-[11px] text-slate-200 outline-none border-0"
                            title="Move to another folder"
                          >
                            <option value={currentFolder.id} disabled>
                              Move to...
                            </option>
                            {folders
                              .filter((f) => f.id !== currentFolder.id)
                              .map((f) => (
                                <option key={f.id} value={f.id} className="bg-[#0E1324] text-white">
                                  {f.name}
                                </option>
                              ))}
                          </select>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            onSendToPlayground(item.prompt, item.title);
                            onClose();
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-white hover:bg-white/10 touch-manipulation"
                          title="Test in Playground"
                        >
                          <CustomTestingAreaIcon size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.prompt, item.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white touch-manipulation"
                          title="Copy prompt"
                        >
                          {copiedId === item.id ? (
                            <CustomCheckIcon size={15} className="text-white" />
                          ) : (
                            <CustomCopyIcon size={15} />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeletePromptFromFolder(currentFolder.id, item.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white touch-manipulation"
                          title="Delete"
                        >
                          <CustomDeleteChatIcon size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 rounded-xl bg-[#060810] p-3 font-mono text-xs text-slate-300 max-h-32 overflow-y-auto">
                      <pre className="whitespace-pre-wrap leading-relaxed select-all">{item.prompt}</pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
