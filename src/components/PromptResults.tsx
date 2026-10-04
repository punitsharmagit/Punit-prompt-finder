import React, { useState } from 'react';
import {
  ExternalLink,
  Sparkles,
  Flame,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  CustomFolderIcon,
  CustomTestingAreaIcon,
  CustomCopyIcon,
  CustomCheckIcon,
} from './CustomIcons';
import { PromptSearchResponse, PromptSearchResult, SynthesisedPrompt } from '../types';
import { useI18n } from '../i18n';

interface PromptResultsProps {
  data: PromptSearchResponse;
  onSendToPlayground: (prompt: string, title: string) => void;
  onSavePromptToFolder: (prompt: string, title: string, source: string) => void;
}

export const PromptResults: React.FC<PromptResultsProps> = ({
  data,
  onSendToPlayground,
  onSavePromptToFolder,
}) => {
  const { t } = useI18n();
  const [copiedIndex, setCopiedIndex] = useState<number | string | null>(null);
  const [savedIndex, setSavedIndex] = useState<number | string | null>(null);
  const [expandedBreakdown, setExpandedBreakdown] = useState<boolean>(true);

  const handleCopy = (text: string, identifier: number | string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(identifier);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  const handleSave = (prompt: string, title: string, source: string, identifier: number | string) => {
    onSavePromptToFolder(prompt, title, source);
    setSavedIndex(identifier);
    setTimeout(() => {
      setSavedIndex(null);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Search Overview Banner */}
      <div className="rounded-2xl border border-slate-800 bg-[#0E1322]/80 p-4 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              4 Search & Synthesis Results Ready
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="rounded-full bg-slate-800/80 px-2 py-0.5 text-slate-300 font-mono">
              GitHub • Reddit • FlowGPT
            </span>
          </div>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-300">{data.summary}</p>
      </div>

      {/* RESULTS 1 TO 3: Best prompts found from searching GitHub, Reddit, FlowGPT */}
      <div className="grid gap-5">
        {data.results.map((result: PromptSearchResult, idx: number) => {
          const isCopied = copiedIndex === idx;
          const isSaved = savedIndex === idx;

          // Source badges and color schemes
          const sourceColors = {
            GitHub: {
              badge: 'bg-slate-800 text-slate-200 border-slate-700',
              icon: '🐙',
              accent: 'border-l-4 border-l-slate-400',
            },
            Reddit: {
              badge: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
              icon: '💬',
              accent: 'border-l-4 border-l-orange-500',
            },
            FlowGPT: {
              badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
              icon: '⚡',
              accent: 'border-l-4 border-l-purple-500',
            },
          }[result.source] || {
            badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
            icon: '🔍',
            accent: 'border-l-4 border-l-blue-500',
          };

          return (
            <div
              key={idx}
              className={`group relative overflow-hidden rounded-2xl border border-slate-800/90 app-bg-card p-5 shadow-xl transition-all duration-200 hover:border-slate-700 ${sourceColors.accent}`}
            >
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      RESULT {idx + 1} OF 4
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${sourceColors.badge}`}
                    >
                      <span>{sourceColors.icon}</span>
                      <span>{result.source}</span>
                    </span>
                    <span className="rounded-full bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-400">
                      {result.sourceDetail}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {result.title}
                  </h4>
                </div>

                <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white">
                  <CustomCheckIcon size={13} className="text-white" />
                  <span>{result.effectivenessScore}% Unbreakable</span>
                </div>
              </div>

              {/* Description */}
              <p className="mt-2.5 text-xs text-slate-400 leading-relaxed">
                {result.description}
              </p>

              {/* The Unbreakable Prompt Command Box */}
              <div className="mt-3.5 relative rounded-xl border border-slate-800 bg-[#090D18] p-3.5 font-mono text-xs text-slate-200 shadow-inner">
                <div className="mb-2 flex items-center justify-between border-b border-slate-800/80 pb-1.5 text-[11px] text-slate-400">
                  <span className="font-semibold uppercase text-slate-400">Command Prompt</span>
                  <span className="text-[10px] text-slate-500">Delimited System Directive</span>
                </div>
                <pre className="max-h-56 overflow-y-auto whitespace-pre-wrap font-mono leading-relaxed text-slate-200 select-all pr-2">
                  {result.prompt}
                </pre>
              </div>

              {/* Unbreakable Rules & Guardrails */}
              {result.unbreakableRules && result.unbreakableRules.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {result.unbreakableRules.map((rule, rIdx) => (
                    <span
                      key={rIdx}
                      className="inline-flex items-center gap-1 rounded-md bg-slate-800/80 px-2 py-0.5 text-[10px] font-medium text-slate-300"
                    >
                      <CustomCheckIcon size={12} className="text-white" />
                      <span>{rule}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Card Footer Actions */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-3">
                <div className="flex flex-wrap gap-1.5">
                  {result.tags?.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="rounded bg-slate-800/50 px-2 py-0.5 text-[10px] text-slate-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end pt-1 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => handleSave(result.prompt, result.title, result.source, idx)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-white/20 touch-manipulation"
                  >
                    {isSaved ? (
                      <CustomCheckIcon size={14} className="text-white" />
                    ) : (
                      <CustomFolderIcon size={14} className="text-white" />
                    )}
                    <span>{isSaved ? t('copied') : t('saveToFolder')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSendToPlayground(result.prompt, result.title)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-white/20 touch-manipulation"
                  >
                    <CustomTestingAreaIcon size={14} className="text-white" />
                    <span>{t('playground')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(result.prompt, idx)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-bold text-black transition-all hover:bg-slate-200 active:scale-95 touch-manipulation"
                  >
                    {isCopied ? (
                      <CustomCheckIcon size={14} className="text-black" />
                    ) : (
                      <CustomCopyIcon size={14} className="text-black" />
                    )}
                    <span>{isCopied ? t('copied') : t('copyPrompt')}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* RESULT 4: AI'S OWN SYNTHESISED UNBREAKABLE PROMPT */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-cyan-500/50 bg-gradient-to-b from-[#131b33] via-[#0f1527] to-[#0a0e1a] p-6 shadow-2xl shadow-cyan-950/50 ring-1 ring-cyan-500/20">
        {/* Glowing badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/20 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-cyan-500 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-slate-950 shadow-md">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Result 4: AI Synthesised Prompt</span>
              </span>
              <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-300">
                Unbreakable Command Master
              </span>
            </div>
            <h3 className="text-base font-extrabold text-white">
              {data.synthesised.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
            <Award className="h-4 w-4 text-white" />
            <span>Score: {data.synthesised.unbreakableScore}% Lock</span>
          </div>
        </div>

        {/* Why Unbreakable explanation */}
        <div className="mt-3.5 rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-3 text-xs text-cyan-200/90 leading-relaxed">
          <span className="font-bold text-cyan-300">Why this command is unbreakable: </span>
          {data.synthesised.whyUnbreakable}
        </div>

        {/* Structural Breakdown Toggle */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setExpandedBreakdown((prev) => !prev)}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300"
          >
            <span>Unbreakable Command Architecture</span>
            {expandedBreakdown ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {expandedBreakdown && (
            <div className="mt-2.5 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-800 bg-[#0A0E1A]/80 p-3">
                <span className="font-bold text-slate-300">🔒 Core Directives:</span>
                <ul className="mt-1.5 space-y-1 text-slate-400">
                  {data.synthesised.coreDirectives.map((d, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-cyan-400">•</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-slate-800 bg-[#0A0E1A]/80 p-3">
                <span className="font-bold text-slate-300">🛡️ Immutable Constraints:</span>
                <ul className="mt-1.5 space-y-1 text-slate-400">
                  {data.synthesised.constraints.map((c, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-400">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* The Master Unbreakable Prompt Codebox */}
        <div className="mt-4 relative rounded-2xl border border-cyan-500/30 bg-[#070A14] p-4 font-mono text-xs text-slate-100 shadow-2xl">
          <div className="mb-2 flex items-center justify-between border-b border-slate-800 pb-2 text-[11px] text-slate-400">
            <span className="font-bold text-cyan-400">SYNTHESISED MASTER COMMAND (UNBREAKABLE)</span>
            <span className="text-slate-500 font-mono">Ready to deploy into any LLM</span>
          </div>
          <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap font-mono leading-relaxed text-slate-100 select-all pr-2">
            {data.synthesised.prompt}
          </pre>
        </div>

        {/* Bottom Actions */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-cyan-500/20 pt-4">
          <div className="text-xs text-slate-400">
            Output Format: <span className="text-slate-200 font-medium">{data.synthesised.outputFormat}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleSave(data.synthesised.prompt, data.synthesised.title, 'AI Synthesised', 'synthesised')}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-white/20 touch-manipulation"
            >
              {savedIndex === 'synthesised' ? (
                <CustomCheckIcon size={16} className="text-white" />
              ) : (
                <CustomFolderIcon size={16} className="text-white" />
              )}
              <span>{savedIndex === 'synthesised' ? t('copied') : t('saveToFolder')}</span>
            </button>

            <button
              type="button"
              onClick={() => onSendToPlayground(data.synthesised.prompt, data.synthesised.title)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-white/15 px-3.5 py-2.5 text-xs font-bold text-white transition-all hover:bg-white/25 active:scale-95 touch-manipulation"
            >
              <CustomTestingAreaIcon size={16} className="text-white" />
              <span>{t('playground')}</span>
            </button>

            <button
              type="button"
              onClick={() => handleCopy(data.synthesised.prompt, 'synthesised')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-black shadow-md transition-all hover:bg-slate-200 active:scale-95 touch-manipulation"
            >
              {copiedIndex === 'synthesised' ? (
                <CustomCheckIcon size={16} className="text-black" />
              ) : (
                <CustomCopyIcon size={16} className="text-black" />
              )}
              <span>{copiedIndex === 'synthesised' ? t('copied') : t('copyPrompt')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
