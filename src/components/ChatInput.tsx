import React, { useState, useRef, useEffect } from 'react';
import {
  CustomMicIcon,
  CustomAddIcon,
  CustomCameraIcon,
  CustomImageIcon,
  CustomFileIcon,
  CustomSendIcon,
  CustomCloseIcon,
} from './CustomIcons';
import { Attachment } from '../types';
import { useI18n } from '../i18n';

interface ChatInputProps {
  onSend: (instruction: string, attachments: Attachment[]) => void;
  isLoading: boolean;
  onOpenCamera: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  isLoading,
  onOpenCamera,
}) => {
  const { t, language } = useI18n();
  const [instruction, setInstruction] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [micSupported, setMicSupported] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Close plus menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target as Node)) {
        setIsPlusMenuOpen(false);
      }
    };
    if (isPlusMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isPlusMenuOpen]);

  // Setup Web Speech API for Mic Speech-to-Text
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      const langMap: Record<string, string> = {
        en: 'en-US',
        es: 'es-ES',
        fr: 'fr-FR',
        de: 'de-DE',
        ja: 'ja-JP',
        zh: 'zh-CN',
        hi: 'hi-IN',
        ar: 'ar-SA',
      };
      recognition.lang = langMap[language] || 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInstruction((prev) => (prev ? `${prev.trim()} ${transcript.trim()}` : transcript.trim()));
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Speech recognition setup error:', e);
      setMicSupported(false);
    }
  }, []);

  const toggleMic = () => {
    if (!micSupported || !recognitionRef.current) {
      alert('Speech-to-text is not supported by your current browser. You can type instructions directly.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start recognition:', err);
      }
    }
  };

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const dataUrl = loadEvt.target?.result as string;
        const newAttachment: Attachment = {
          id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          name: file.name,
          type: 'file',
          mimeType: file.type || 'text/plain',
          size: `${(file.size / 1024).toFixed(1)} KB`,
          dataUrl,
        };
        setAttachments((prev) => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsPlusMenuOpen(false);
  };

  const handleAddGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const dataUrl = loadEvt.target?.result as string;
        const newAttachment: Attachment = {
          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          name: file.name,
          type: 'gallery',
          mimeType: file.type,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          dataUrl,
        };
        setAttachments((prev) => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });

    if (galleryInputRef.current) galleryInputRef.current.value = '';
    setIsPlusMenuOpen(false);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = () => {
    if ((!instruction.trim() && attachments.length === 0) || isLoading) return;
    onSend(instruction.trim(), attachments);
    setInstruction('');
    setAttachments([]);
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-4xl px-3 sm:px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
      {/* Attachment chips */}
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 text-xs text-white backdrop-blur-md"
            >
              {att.dataUrl && (att.type === 'camera' || att.type === 'gallery') ? (
                <img
                  src={att.dataUrl}
                  alt={att.name}
                  className="h-6 w-6 rounded-md object-cover"
                />
              ) : (
                <CustomFileIcon size={16} className="text-white" />
              )}
              <span className="max-w-[140px] truncate font-medium">{att.name}</span>
              <button
                type="button"
                onClick={() => removeAttachment(att.id)}
                className="rounded-full p-0.5 text-white/70 hover:bg-white/20 hover:text-white touch-manipulation"
              >
                <CustomCloseIcon size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Speech Listening Pulse Bar */}
      {isListening && (
        <div className="mb-2 flex items-center justify-between rounded-xl bg-white/10 px-3 py-1.5 text-xs text-white backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
            </span>
            <span>Listening... Speak your instruction now</span>
          </div>
          <button
            type="button"
            onClick={toggleMic}
            className="text-[11px] font-bold uppercase tracking-wider text-white hover:underline touch-manipulation"
          >
            Done
          </button>
        </div>
      )}

      {/* 1.1 Chat Bubble Container - Black & White without border */}
      <div className="relative flex items-end gap-1.5 sm:gap-2 rounded-3xl app-bg-input p-1.5 sm:p-2 shadow-2xl backdrop-blur-xl">
        {/* 1.1.1 Plus Icon (+) Menu - Black & White without border */}
        <div className="relative shrink-0" ref={plusMenuRef}>
          <button
            type="button"
            onClick={() => setIsPlusMenuOpen((prev) => !prev)}
            aria-label="Add attachments"
            className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all touch-manipulation active:scale-95 ${
              isPlusMenuOpen
                ? 'bg-white text-black rotate-45'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <CustomAddIcon size={24} />
          </button>

          {/* Plus popup menu: Files, Camera, Gallery - Black & White without border */}
          {isPlusMenuOpen && (
            <div className="absolute bottom-14 left-0 z-40 w-52 rounded-2xl bg-[#161a28] p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 text-white">
              {/* Option 1: Adds files */}
              <button
                type="button"
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-white transition-colors hover:bg-white/10"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white">
                  <CustomFileIcon size={18} />
                </div>
                <span>Add files</span>
              </button>

              {/* Option 2: Adds a picture from the camera */}
              <button
                type="button"
                onClick={() => {
                  setIsPlusMenuOpen(false);
                  onOpenCamera();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-white transition-colors hover:bg-white/10"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white">
                  <CustomCameraIcon size={18} />
                </div>
                <span>Camera</span>
              </button>

              {/* Option 3: Adds a picture from the gallery */}
              <button
                type="button"
                onClick={() => {
                  galleryInputRef.current?.click();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-white transition-colors hover:bg-white/10"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white">
                  <CustomImageIcon size={18} />
                </div>
                <span>Gallery</span>
              </button>
            </div>
          )}

          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".txt,.md,.json,.js,.ts,.tsx,.py,.html,.css,.csv,.pdf"
            onChange={handleAddFiles}
            className="hidden"
          />
          <input
            ref={galleryInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleAddGallery}
            className="hidden"
          />
        </div>

        {/* Input Text Area: giving instructions */}
        <textarea
          ref={textareaRef}
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('inputPlaceholder')}
          rows={1}
          className="max-h-36 min-h-[44px] flex-1 resize-none bg-transparent py-2.5 px-2 text-[16px] sm:text-sm text-white placeholder-slate-400 outline-none border-0 leading-relaxed touch-manipulation"
          style={{ height: 'auto' }}
        />

        {/* Action icons on right - Black & White without border */}
        <div className="flex items-center gap-1 shrink-0 pb-0.5">
          {/* 1.1.2 Mic Icon: Speech to text - Black & White without border */}
          <button
            type="button"
            onClick={toggleMic}
            aria-label={isListening ? 'Stop listening' : 'Start speech to text'}
            className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all touch-manipulation active:scale-95 ${
              isListening
                ? 'bg-white text-black animate-pulse'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <CustomMicIcon size={20} className={isListening ? 'animate-pulse' : ''} />
          </button>

          {/* 1.1.3 Send: Sends the instruction - Black & White without border */}
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={(!instruction.trim() && attachments.length === 0) || isLoading}
            aria-label="Send instruction"
            className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all touch-manipulation ${
              instruction.trim() || attachments.length > 0
                ? 'bg-white text-black hover:bg-slate-200 active:scale-95'
                : 'cursor-not-allowed text-white/30'
            }`}
          >
            <CustomSendIcon size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
