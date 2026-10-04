import React, { useState, useEffect, useMemo } from 'react';
import {
  CustomTestingAreaIcon,
  CustomCloseIcon,
  CustomCopyIcon,
  CustomCheckIcon,
  CustomCompareIcon,
} from './CustomIcons';
import { PlaygroundTestRun } from '../types';

interface PlaygroundModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  initialTitle?: string;
  onTokenConsumed?: (usage: any) => void;
}

interface EvaluationResult {
  score: number;
  verdict: string;
  metrics: {
    clarity: number;
    robustness: number;
    specificity: number;
    injectionDefense: number;
  };
  strengths: string[];
  vulnerabilities: string[];
  recommendations: string[];
  enhancedPrompt: string;
}

export const PlaygroundModal: React.FC<PlaygroundModalProps> = ({
  isOpen,
  onClose,
  initialPrompt = '',
  initialTitle = 'Testing Area',
  onTokenConsumed,
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [promptB, setPromptB] = useState('');
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [testInput, setTestInput] = useState('');
  const [lastConsumedTokens, setLastConsumedTokens] = useState<number | null>(null);
  
  // Execution & Evaluation states
  const [activeOutputTab, setActiveOutputTab] = useState<'run' | 'evaluate' | 'compare' | 'history'>('run');
  const [mobileView, setMobileView] = useState<'editor' | 'results'>('editor');
  const [runOutput, setRunOutput] = useState<string | null>(null);
  const [runOutputB, setRunOutputB] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  // 5.5 Test History
  const [testHistory, setTestHistory] = useState<PlaygroundTestRun[]>(() => {
    try {
      const stored = localStorage.getItem('promptai_test_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // UI states
  const [copiedOutput, setCopiedOutput] = useState(false);
  const [copiedEval, setCopiedEval] = useState(false);
  const [newVarName, setNewVarName] = useState('');
  const [showAddVarInput, setShowAddVarInput] = useState(false);

  // Sync initial prompt when opened
  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  // Persist test history
  useEffect(() => {
    localStorage.setItem('promptai_test_history', JSON.stringify(testHistory));
  }, [testHistory]);

  const saveHistoryItem = (item: PlaygroundTestRun) => {
    setTestHistory((prev) => [item, ...prev.slice(0, 19)]); // keep last 20 runs
  };

  // Extract variables dynamically from prompt: e.g. {{variable}}, {variable}, [VARIABLE]
  const detectedVariables = useMemo(() => {
    const found = new Set<string>();
    if (!prompt) return [];

    const doubleCurly = prompt.match(/\{\{([a-zA-Z0-9_-]+)\}\}/g) || [];
    doubleCurly.forEach((v) => found.add(v.replace(/[{}]/g, '').trim()));

    const singleCurly = prompt.match(/(?<=\{)[a-zA-Z0-9_-]+(?=\})/g) || [];
    singleCurly.forEach((v) => found.add(v.trim()));

    if (isCompareMode && promptB) {
      const doubleCurlyB = promptB.match(/\{\{([a-zA-Z0-9_-]+)\}\}/g) || [];
      doubleCurlyB.forEach((v) => found.add(v.replace(/[{}]/g, '').trim()));
    }

    return Array.from(found);
  }, [prompt, promptB, isCompareMode]);

  // Synchronize detected variables with state without overriding filled values
  useEffect(() => {
    if (detectedVariables.length > 0) {
      setVariables((prev) => {
        const next = { ...prev };
        let changed = false;
        detectedVariables.forEach((k) => {
          if (next[k] === undefined) {
            next[k] = '';
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }
  }, [detectedVariables]);

  if (!isOpen) return null;

  // 1. Run Option: Run the prompt with substituted variables
  const handleRun = async () => {
    if (!prompt.trim()) return;
    setIsRunning(true);
    setActiveOutputTab('run');
    setMobileView('results');
    setRunOutput(null);

    try {
      const res = await fetch('/api/playground/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          variables,
          testInput: testInput.trim() || undefined,
        }),
      });
      const data = await res.json();
      const outputText = data.output || 'Execution completed with no output.';
      setRunOutput(outputText);

      if (data.tokenUsage) {
        setLastConsumedTokens(data.tokenUsage.consumedTokens || null);
        if (onTokenConsumed) {
          onTokenConsumed(data.tokenUsage);
        }
      }

      saveHistoryItem({
        id: `run_${Date.now()}`,
        timestamp: Date.now(),
        promptSnippet: prompt.slice(0, 100),
        prompt,
        variables,
        testInput: testInput.trim() || undefined,
        output: outputText,
        mode: 'run',
      });
    } catch (err: any) {
      setRunOutput(`[Execution Error]: ${err?.message || 'Failed to execute prompt in playground.'}`);
    } finally {
      setIsRunning(false);
    }
  };

  // 2. Evaluate Option: Evaluate prompt with AI
  const handleEvaluate = async () => {
    if (!prompt.trim()) return;
    setIsEvaluating(true);
    setActiveOutputTab('evaluate');
    setMobileView('results');
    setEvaluation(null);

    try {
      const res = await fetch('/api/playground/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          variables,
        }),
      });
      const data = await res.json();
      setEvaluation(data);

      if (data.tokenUsage) {
        setLastConsumedTokens(data.tokenUsage.consumedTokens || null);
        if (onTokenConsumed) {
          onTokenConsumed(data.tokenUsage);
        }
      }

      saveHistoryItem({
        id: `eval_${Date.now()}`,
        timestamp: Date.now(),
        promptSnippet: prompt.slice(0, 100),
        prompt,
        variables,
        output: data.verdict || 'Evaluation Complete',
        score: data.score,
        mode: 'evaluate',
      });
    } catch (err: any) {
      console.error('Prompt evaluation error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // 3. Compare Option: Run and compare Command A vs Command B
  const handleCompare = async () => {
    if (!prompt.trim() || !promptB.trim()) return;
    setIsRunning(true);
    setActiveOutputTab('compare');
    setMobileView('results');
    setRunOutput(null);
    setRunOutputB(null);

    try {
      const [resA, resB] = await Promise.all([
        fetch('/api/playground/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, variables, testInput: testInput.trim() || undefined }),
        }),
        fetch('/api/playground/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: promptB, variables, testInput: testInput.trim() || undefined }),
        }),
      ]);

      const dataA = await resA.json();
      const dataB = await resB.json();

      setRunOutput(dataA.output || 'Command A output completed.');
      setRunOutputB(dataB.output || 'Command B output completed.');

      saveHistoryItem({
        id: `compare_${Date.now()}`,
        timestamp: Date.now(),
        promptSnippet: `[A] ${prompt.slice(0, 40)} vs [B] ${promptB.slice(0, 40)}`,
        prompt,
        variables,
        output: `A: ${(dataA.output || '').slice(0, 60)} | B: ${(dataB.output || '').slice(0, 60)}`,
        mode: 'compare',
      });
    } catch (err: any) {
      console.error('Compare error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = (text: string, type: 'output' | 'eval') => {
    navigator.clipboard.writeText(text);
    if (type === 'output') {
      setCopiedOutput(true);
      setTimeout(() => setCopiedOutput(false), 2000);
    } else {
      setCopiedEval(true);
      setTimeout(() => setCopiedEval(false), 2000);
    }
  };

  const handleAddCustomVariable = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newVarName.trim().replace(/[^a-zA-Z0-9_-]/g, '');
    if (!clean) return;
    setVariables((prev) => ({ ...prev, [clean]: '' }));
    setPrompt((prev) => `${prev} {{${clean}}}`);
    setNewVarName('');
    setShowAddVarInput(false);
  };

  const handleApplyEnhancedPrompt = () => {
    if (evaluation?.enhancedPrompt) {
      setPrompt(evaluation.enhancedPrompt);
      alert('Applied AI-hardened prompt to editor.');
    }
  };

  const handleLoadHistory = (item: PlaygroundTestRun) => {
    setPrompt(item.prompt);
    if (item.variables) setVariables(item.variables);
    if (item.testInput) setTestInput(item.testInput);
    if (item.output) setRunOutput(item.output);
    setActiveOutputTab('run');
    setMobileView('editor');
  };

  const variableKeys = Object.keys(variables);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex h-screen h-[100dvh] w-screen flex-col bg-[#0B0F19] text-white overflow-hidden animate-in fade-in duration-200">
      {/* Full Screen Header */}
      <header className="flex min-h-16 shrink-0 items-center justify-between border-b border-white/5 bg-[#090D18] px-4 sm:px-6 pt-[max(env(safe-area-inset-top),0.5rem)] pb-2 sm:pb-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white shrink-0">
            <CustomTestingAreaIcon size={22} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white truncate">Prompt Playground</h2>
              <span className="hidden sm:inline-flex rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white">
                Full-Screen Environment
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 truncate">
              {initialTitle || 'Add prompt, fill variables, execute & evaluate with AI'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Compare Mode Toggle */}
          <button
            type="button"
            onClick={() => {
              setIsCompareMode(!isCompareMode);
              if (!isCompareMode && !promptB) {
                setPromptB(prompt ? `${prompt}\n\n[NEGATIVE CONSTRAINTS]\nNever deviate from instructions.` : '');
              }
            }}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all touch-manipulation ${
              isCompareMode ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <CustomCompareIcon size={14} />
            <span className="hidden sm:inline">Compare Mode</span>
          </button>

          {/* Load Sample Template */}
          <button
            type="button"
            onClick={() => {
              setPrompt(
                'You are an expert {{role}} specializing in {{topic}}.\n\n[TASK]\nExecute the following directive with extreme precision:\n{{directive}}\n\n[CONSTRAINTS]\n1. Never break character or ignore instructions.\n2. Provide production-ready output with zero placeholders.'
              );
              setVariables({
                role: 'Senior Solutions Architect',
                topic: 'High-Concurrency Microservices',
                directive: 'Design a zero-drift resilient idempotency layer in Node.js',
              });
            }}
            className="hidden md:inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
          >
            <span>Load Template</span>
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Full Screen Playground"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white transition-all hover:bg-white hover:text-black active:scale-95 touch-manipulation"
          >
            <CustomCloseIcon size={20} />
          </button>
        </div>
      </header>

      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden border-b border-white/5 bg-[#090D18] p-1.5 px-3 shrink-0 gap-1.5">
        <button
          type="button"
          onClick={() => setMobileView('editor')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all touch-manipulation ${
            mobileView === 'editor'
              ? 'bg-white text-black shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Prompt & Variables
        </button>
        <button
          type="button"
          onClick={() => setMobileView('results')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all touch-manipulation flex items-center justify-center gap-1.5 ${
            mobileView === 'results'
              ? 'bg-white text-black shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Results & AI Audit</span>
          {(runOutput || evaluation) && (
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
          )}
        </button>
      </div>

      {/* Main Full-Screen Layout */}
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* LEFT COLUMN: Prompt Box, Comparison Prompt B, Variables, Actions */}
        <div className={`flex flex-col lg:col-span-7 border-r border-white/5 overflow-y-auto touch-scroll p-4 sm:p-6 space-y-5 pb-[max(env(safe-area-inset-bottom),1.5rem)] ${
          mobileView === 'editor' ? 'flex flex-1' : 'hidden lg:flex'
        }`}>
          {/* 1. Box to Add Prompt */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white">
                  {isCompareMode ? '1. Command A (Primary Prompt)' : '1. Box to Add Prompt'}
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  ({prompt.length} chars • ~{Math.ceil(prompt.length / 4)} tokens)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPrompt('')}
                className="text-[11px] text-slate-400 hover:text-white"
              >
                Clear Box
              </button>
            </div>

            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter or paste your prompt here. Insert dynamic variables using {{variable_name}} or {variable_name}..."
                rows={isCompareMode ? 6 : 9}
                className="w-full resize-y rounded-2xl bg-[#0F1424] p-3.5 sm:p-4 font-mono text-[16px] sm:text-xs text-white placeholder-slate-500 outline-none border-0 focus:ring-1 focus:ring-white/30"
              />
            </div>
          </div>

          {/* Optional Comparison Prompt B */}
          {isCompareMode && (
            <div className="space-y-2 rounded-2xl bg-white/5 p-3.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-white">
                  Command B (Comparison Variant)
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  ({promptB.length} chars)
                </span>
              </div>
              <textarea
                value={promptB}
                onChange={(e) => setPromptB(e.target.value)}
                placeholder="Enter alternative command to compare against Command A..."
                rows={5}
                className="w-full resize-y rounded-xl bg-[#0F1424] p-3 font-mono text-[16px] sm:text-xs text-white placeholder-slate-500 outline-none border-0 focus:ring-1 focus:ring-white/30"
              />
            </div>
          )}

          {/* 2. Place to Fill Variables of Prompt */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-white">
                  2. Fill Variables of Prompt
                </label>
                <p className="text-[11px] text-slate-400">
                  Values entered here will replace placeholders like {'{{variable}}'} before running or evaluating.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddVarInput((prev) => !prev)}
                className="rounded-xl bg-white/10 px-2.5 py-1 text-xs font-bold text-white hover:bg-white/20 transition-colors"
              >
                + Add Variable
              </button>
            </div>

            {/* Custom Variable Creation Field */}
            {showAddVarInput && (
              <form
                onSubmit={handleAddCustomVariable}
                className="flex items-center gap-2 rounded-xl bg-white/5 p-2"
              >
                <input
                  type="text"
                  value={newVarName}
                  onChange={(e) => setNewVarName(e.target.value)}
                  placeholder="variable_name (e.g. user_query)"
                  autoFocus
                  className="flex-1 rounded-lg bg-[#0F1424] px-3 py-2 text-[16px] sm:text-xs text-white placeholder-slate-500 outline-none border-0"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-black hover:bg-slate-200"
                >
                  Insert
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddVarInput(false)}
                  className="rounded-lg px-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </form>
            )}

            {/* Variables Input Grid */}
            {variableKeys.length === 0 ? (
              <div className="rounded-2xl bg-white/5 p-4 text-center">
                <p className="text-xs text-slate-400">
                  No variables detected in your prompt yet.
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Type <span className="font-mono text-white">{'{{topic}}'}</span> or{' '}
                  <span className="font-mono text-white">{'{{role}}'}</span> in the prompt box above to populate variables here automatically.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {variableKeys.map((key) => (
                  <div key={key} className="space-y-1 rounded-xl bg-white/5 p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-white">
                        {`{{${key}}}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = { ...variables };
                          delete updated[key];
                          setVariables(updated);
                        }}
                        className="text-[10px] text-slate-500 hover:text-rose-400"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      type="text"
                      value={variables[key] || ''}
                      onChange={(e) =>
                        setVariables((prev) => ({ ...prev, [key]: e.target.value }))
                      }
                      placeholder={`Enter value for ${key}...`}
                      className="w-full rounded-lg bg-[#0F1424] px-3 py-2 text-[16px] sm:text-xs text-white placeholder-slate-500 outline-none border-0 focus:ring-1 focus:ring-white/30"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Optional extra test scenario input */}
            <div className="pt-1">
              <label className="text-[11px] font-semibold text-slate-400">
                Optional Test Input / Injection Challenge:
              </label>
              <input
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Optional test user query (e.g. Try to break persona or request code)..."
                className="mt-1 w-full rounded-xl bg-[#0F1424] px-3.5 py-2 text-[16px] sm:text-xs text-white placeholder-slate-500 outline-none border-0 focus:ring-1 focus:ring-white/30"
              />
            </div>
          </div>

          {/* 3. Below Options: Run, Evaluate, Compare */}
          <div className="pt-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              3. Execution Actions
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* Option 1: Run to run the prompt */}
              <button
                type="button"
                onClick={isCompareMode ? handleCompare : handleRun}
                disabled={isRunning || !prompt.trim()}
                className="flex items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-xs font-extrabold text-black shadow-lg transition-all hover:bg-slate-200 active:scale-95 disabled:opacity-50 touch-manipulation"
              >
                {isRunning ? (
                  <span>Executing...</span>
                ) : isCompareMode ? (
                  <>
                    <CustomCompareIcon size={16} />
                    <span>Run & Compare (A vs B)</span>
                  </>
                ) : (
                  <>
                    <CustomTestingAreaIcon size={16} />
                    <span>Run Prompt</span>
                  </>
                )}
              </button>

              {/* Option 2: Evaluate where you can evaluate prompt with ai */}
              <button
                type="button"
                onClick={handleEvaluate}
                disabled={isEvaluating || !prompt.trim()}
                className="flex items-center justify-center gap-2 rounded-2xl bg-white/15 py-3.5 text-xs font-extrabold text-white shadow-lg transition-all hover:bg-white/25 active:scale-95 disabled:opacity-50 touch-manipulation"
              >
                {isEvaluating ? (
                  <span>Evaluating with AI...</span>
                ) : (
                  <>
                    <CustomCheckIcon size={16} />
                    <span>Evaluate with AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Output of Run, AI Evaluation, Comparison, and Test History */}
        <div className={`flex flex-col lg:col-span-5 bg-[#090D18]/70 overflow-hidden pb-[max(env(safe-area-inset-bottom),1.5rem)] ${
          mobileView === 'results' ? 'flex flex-1' : 'hidden lg:flex'
        }`}>
          {/* Results Navigation Header */}
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-3 bg-[#0E1324]/50 overflow-x-auto touch-scroll">
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setActiveOutputTab('run')}
                className={`rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all ${
                  activeOutputTab === 'run'
                    ? 'bg-white text-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Run Output
              </button>

              <button
                type="button"
                onClick={() => setActiveOutputTab('evaluate')}
                className={`rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all ${
                  activeOutputTab === 'evaluate'
                    ? 'bg-white text-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                AI Evaluation
              </button>

              {isCompareMode && (
                <button
                  type="button"
                  onClick={() => setActiveOutputTab('compare')}
                  className={`rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all ${
                    activeOutputTab === 'compare'
                      ? 'bg-white text-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Comparison
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveOutputTab('history')}
                className={`rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all ${
                  activeOutputTab === 'history'
                    ? 'bg-white text-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                History ({testHistory.length})
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Token Consumption Telemetry Badge */}
              {lastConsumedTokens && (
                <span className="flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-[11px] font-mono text-emerald-300 font-semibold border border-white/10">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {lastConsumedTokens} tokens consumed
                </span>
              )}

              {/* Quick copy action */}
              {activeOutputTab === 'run' && runOutput && (
                <button
                  type="button"
                  onClick={() => handleCopy(runOutput, 'output')}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white shrink-0"
                >
                  <CustomCopyIcon size={14} />
                  <span>{copiedOutput ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Output Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 touch-scroll">
            {/* TAB 1: RUN OUTPUT */}
            {activeOutputTab === 'run' && (
              <div>
                {isRunning ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <p className="text-xs text-slate-300 font-mono">Executing prompt with filled variables...</p>
                  </div>
                ) : runOutput ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl bg-[#0F1424] p-4 text-xs font-mono text-slate-200 shadow-inner">
                      <pre className="whitespace-pre-wrap leading-relaxed select-all">{runOutput}</pre>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500">
                    <CustomTestingAreaIcon size={32} className="mb-2 text-slate-600" />
                    <p className="text-xs text-slate-400">No output generated yet</p>
                    <p className="mt-1 text-[11px] text-slate-500 max-w-xs">
                      Click <strong className="text-white">Run Prompt</strong> below to test this prompt with substituted variables.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: AI EVALUATION */}
            {activeOutputTab === 'evaluate' && (
              <div>
                {isEvaluating ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <p className="text-xs text-slate-300 font-mono">Evaluating prompt robustness & injection resistance...</p>
                  </div>
                ) : evaluation ? (
                  <div className="space-y-4">
                    {/* Score badge card */}
                    <div className="flex items-center justify-between rounded-2xl bg-white/5 p-4 border border-white/10">
                      <div>
                        <div className="text-[10px] font-bold uppercase text-slate-400">Unbreakability Score</div>
                        <div className="text-3xl font-black text-white mt-0.5">{evaluation.score} / 100</div>
                        <div className="text-xs font-semibold text-slate-200 mt-1">{evaluation.verdict}</div>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black font-extrabold text-sm">
                        {evaluation.score >= 90 ? 'A+' : evaluation.score >= 80 ? 'A' : 'B'}
                      </div>
                    </div>

                    {/* Metrics grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(evaluation.metrics).map(([key, val]) => (
                        <div key={key} className="rounded-xl bg-white/5 p-2.5">
                          <div className="capitalize text-slate-400 text-[10px] font-bold">{key}</div>
                          <div className="text-sm font-bold text-white mt-0.5">{val}%</div>
                        </div>
                      ))}
                    </div>

                    {/* Strengths */}
                    {evaluation.strengths.length > 0 && (
                      <div className="rounded-xl bg-white/5 p-3 space-y-1.5">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                          Strengths
                        </div>
                        {evaluation.strengths.map((str, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-slate-200">
                            <CustomCheckIcon size={13} className="text-white shrink-0" />
                            <span>{str}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Vulnerabilities */}
                    {evaluation.vulnerabilities.length > 0 && (
                      <div className="rounded-xl bg-white/5 p-3 space-y-1.5">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                          Vulnerabilities Detected
                        </div>
                        {evaluation.vulnerabilities.map((vuln, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                            <span className="text-white font-bold shrink-0">•</span>
                            <span>{vuln}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Enhanced Hardened Prompt */}
                    {evaluation.enhancedPrompt && (
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                            AI-Hardened Version
                          </span>
                          <button
                            type="button"
                            onClick={handleApplyEnhancedPrompt}
                            className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-black hover:bg-slate-200 transition-colors"
                          >
                            Apply to Editor
                          </button>
                        </div>
                        <div className="rounded-xl bg-[#0F1424] p-3 font-mono text-xs text-slate-200 max-h-36 overflow-y-auto">
                          <pre className="whitespace-pre-wrap leading-relaxed select-all">{evaluation.enhancedPrompt}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500">
                    <CustomCheckIcon size={32} className="mb-2 text-slate-600" />
                    <p className="text-xs text-slate-400">No evaluation report yet</p>
                    <p className="mt-1 text-[11px] text-slate-500 max-w-xs">
                      Click <strong className="text-white">Evaluate with AI</strong> below to audit this command.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: COMMAND COMPARISON (Command A vs Command B) */}
            {activeOutputTab === 'compare' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>Command A Output</span>
                      <span className="text-[10px] text-slate-400 font-mono">Primary</span>
                    </div>
                    <div className="rounded-xl bg-[#0F1424] p-3 text-xs font-mono text-slate-200 min-h-[160px] max-h-72 overflow-y-auto">
                      <pre className="whitespace-pre-wrap leading-relaxed">{runOutput || '(No output yet)'}</pre>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>Command B Output</span>
                      <span className="text-[10px] text-slate-400 font-mono">Variant</span>
                    </div>
                    <div className="rounded-xl bg-[#0F1424] p-3 text-xs font-mono text-slate-200 min-h-[160px] max-h-72 overflow-y-auto">
                      <pre className="whitespace-pre-wrap leading-relaxed">{runOutputB || '(No output yet)'}</pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: 5.5 TEST HISTORY */}
            {activeOutputTab === 'history' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Saved Test History ({testHistory.length})
                  </span>
                  {testHistory.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setTestHistory([])}
                      className="text-[11px] text-slate-400 hover:text-white"
                    >
                      Clear History
                    </button>
                  )}
                </div>

                {testHistory.length === 0 ? (
                  <div className="py-16 text-center text-xs text-slate-500">
                    No test runs recorded yet. Execute or evaluate a prompt to start logging history.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {testHistory.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl bg-white/5 p-3 space-y-1.5 transition-all hover:bg-white/10"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-white/15 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">
                              {item.mode}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleLoadHistory(item)}
                            className="rounded-lg bg-white px-2 py-0.5 text-[10px] font-bold text-black hover:bg-slate-200"
                          >
                            Load to Editor
                          </button>
                        </div>
                        <p className="text-xs font-mono text-slate-300 truncate">
                          {item.promptSnippet}
                        </p>
                        <div className="text-[11px] text-slate-400 truncate">
                          Output: {item.output}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
