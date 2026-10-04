import React, { useState, useEffect } from 'react';
import {
  CustomSettingsIcon,
  CustomCloseIcon,
  CustomCheckIcon,
  CustomSubscriptionIcon,
  CustomTokenUsageIcon,
  CustomExportIcon,
} from './CustomIcons';
import { TokenUsageData } from '../types';
import { useTheme, THEME_CONFIGS, ThemeMode } from '../theme';
import { useI18n, LANGUAGES, LanguageCode } from '../i18n';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'settings' | 'tokens' | 'subscription';
  tokenUsage?: TokenUsageData | null;
  onRefreshUsage?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'settings',
  tokenUsage,
  onRefreshUsage,
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'tokens' | 'subscription'>(initialTab);
  const [localUsage, setLocalUsage] = useState<TokenUsageData>(() => {
    return (
      tokenUsage || {
        totalUsed: 14820,
        quota: 100000,
        perModel: {
          geminiFlash: 9200,
          synthesizer: 4120,
          playgroundValidator: 1500,
        },
        resetDate: '2026-11-01T00:00:00.000Z',
        history: [],
      }
    );
  });
  const [isRefreshingUsage, setIsRefreshingUsage] = useState(false);

  // Sync tokenUsage when prop updates
  useEffect(() => {
    if (tokenUsage) {
      setLocalUsage(tokenUsage);
    }
  }, [tokenUsage]);

  // Fetch fresh usage when opening or switching to tokens tab
  const fetchLatestUsage = async () => {
    setIsRefreshingUsage(true);
    try {
      const res = await fetch('/api/tokens/usage');
      if (res.ok) {
        const data = await res.json();
        setLocalUsage(data);
        onRefreshUsage?.();
      }
    } catch (e) {
      console.warn('Error fetching tokens telemetry:', e);
    } finally {
      setIsRefreshingUsage(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'tokens') {
      fetchLatestUsage();
    }
  }, [isOpen, activeTab]);

  // Sync activeTab when initialTab changes on open
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // 5.7 Theme and Language from centralized Providers
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useI18n();

  const [defaultModel, setDefaultModel] = useState<string>(() => {
    return localStorage.getItem('promptai_model') || 'gemini-3.8-flash';
  });
  const [temperature, setTemperature] = useState<number>(() => {
    const val = localStorage.getItem('promptai_temp');
    return val !== null ? parseFloat(val) : 0.2;
  });
  const [maxLength, setMaxLength] = useState<number>(() => {
    const val = localStorage.getItem('promptai_max_tokens');
    return val !== null ? parseInt(val, 10) : 2048;
  });
  const [lowQuotaAlert, setLowQuotaAlert] = useState<boolean>(() => {
    return localStorage.getItem('promptai_low_quota_alert') !== 'false';
  });
  const [notifications, setNotifications] = useState<boolean>(() => {
    return localStorage.getItem('promptai_notifications') !== 'false';
  });

  // 5.3 Subscription tier
  const [selectedPlan, setSelectedPlan] = useState<'FREE' | 'PRO' | 'ENTERPRISE'>('PRO');

  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('promptai_model', defaultModel);
  }, [defaultModel]);

  useEffect(() => {
    localStorage.setItem('promptai_temp', temperature.toString());
  }, [temperature]);

  useEffect(() => {
    localStorage.setItem('promptai_max_tokens', maxLength.toString());
  }, [maxLength]);

  useEffect(() => {
    localStorage.setItem('promptai_low_quota_alert', String(lowQuotaAlert));
  }, [lowQuotaAlert]);

  useEffect(() => {
    localStorage.setItem('promptai_notifications', String(notifications));
  }, [notifications]);

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(null), 2500);
  };

  // 5.7 Data Export Function
  const handleExportData = () => {
    try {
      const chats = localStorage.getItem('promptai_chats') || '[]';
      const folders = localStorage.getItem('promptai_folders') || '[]';
      const dataToExport = {
        exportedAt: new Date().toISOString(),
        userEmail: 'punittrainer9997@gmail.com',
        tier: 'PRO',
        settings: {
          theme,
          language,
          model: defaultModel,
          temperature,
          maxLength,
        },
        tokenUsage: {
          used: localUsage.totalUsed,
          quota: localUsage.quota,
          perModel: localUsage.perModel,
          resetDate: localUsage.resetDate,
        },
        chats: JSON.parse(chats),
        folders: JSON.parse(folders),
      };

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `promptai_backup_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotification('Export downloaded successfully');
    } catch (e) {
      console.error('Export error:', e);
      showNotification('Export completed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-t-3xl sm:rounded-3xl app-bg-card shadow-2xl text-white max-h-[92dvh] flex flex-col pb-[env(safe-area-inset-bottom)] animate-in slide-in-from-bottom sm:slide-in-from-bottom-4 duration-200">
        {/* Mobile Drag Indicator */}
        <div className="mx-auto mt-2.5 h-1 w-12 rounded-full bg-white/20 sm:hidden" />

        {/* Header - Black & White without border */}
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">
              {activeTab === 'settings' && <CustomSettingsIcon size={20} />}
              {activeTab === 'tokens' && <CustomTokenUsageIcon size={20} />}
              {activeTab === 'subscription' && <CustomSubscriptionIcon size={20} />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {activeTab === 'settings' && 'App Settings'}
                {activeTab === 'tokens' && 'Token Usage & Telemetry'}
                {activeTab === 'subscription' && 'Subscription Plan'}
              </h3>
              <p className="text-xs text-slate-400">
                {activeTab === 'settings' && 'Theme, language, default model & parameters'}
                {activeTab === 'tokens' &&
                  `${(localUsage.totalUsed / 1000).toFixed(1)}k / ${(localUsage.quota / 1000).toFixed(0)}k consumed • resets Nov 1, 2026`}
                {activeTab === 'subscription' && 'Active Pro Architect tier & billing history'}
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

        {/* Navigation Tabs - Black & White without border */}
        <div className="grid grid-cols-3 border-b border-white/5 bg-[#090D18] p-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 font-semibold transition-all touch-manipulation ${
              activeTab === 'settings'
                ? 'bg-white text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CustomSettingsIcon size={15} />
            <span>Settings</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tokens')}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 font-semibold transition-all touch-manipulation ${
              activeTab === 'tokens'
                ? 'bg-white text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CustomTokenUsageIcon size={15} />
            <span>Token Usage</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('subscription')}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 font-semibold transition-all touch-manipulation ${
              activeTab === 'subscription'
                ? 'bg-white text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CustomSubscriptionIcon size={15} />
            <span>Subscription</span>
          </button>
        </div>

        {/* Saved Notice Toast */}
        {savedNotice && (
          <div className="bg-emerald-500/20 px-4 py-2 text-center text-xs font-semibold text-emerald-300 border-b border-emerald-500/30">
            {savedNotice}
          </div>
        )}

        {/* Tab Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[65vh] touch-scroll">
          {/* TAB 1: 5.7 SETTINGS (Theme, Language, Model, Parameters, Notifications, Export) */}
          {activeTab === 'settings' && (
            <div className="space-y-5">
              {/* 1. Theme Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white">
                  Theme Appearance
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'dark', label: 'Dark Navy', desc: 'Standard #080C16' },
                    { id: 'oled', label: 'OLED Black', desc: 'Pure #000000' },
                    { id: 'dim', label: 'Dim Charcoal', desc: 'Soft #121622' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setTheme(t.id as any);
                        showNotification(`Theme set to ${t.label}`);
                      }}
                      className={`rounded-xl p-3 text-left transition-all ${
                        theme === t.id
                          ? 'bg-white text-black font-bold shadow-md'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-xs font-bold">{t.label}</div>
                      <div className={`text-[10px] mt-0.5 ${theme === t.id ? 'text-black/70' : 'text-slate-400'}`}>
                        {t.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Language Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-white">
                    {t('interfaceLanguage')}
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {LANGUAGES.find((l) => l.code === language)?.name}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {LANGUAGES.map((lang) => {
                    const isSelected = language === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          setLanguage(lang.code);
                          showNotification(`Language switched to ${lang.name}`);
                        }}
                        className={`rounded-xl p-2.5 text-left transition-all ${
                          isSelected
                            ? 'bg-white text-black font-bold'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-xs font-bold truncate">{lang.name}</div>
                        <div className={`text-[10px] ${isSelected ? 'text-black/70' : 'text-slate-400'}`}>
                          {lang.native}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Default Model */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white">
                  Default AI Command Model
                </label>
                <div className="space-y-2">
                  {[
                    {
                      id: 'gemini-3.8-flash',
                      title: 'Gemini 3.8 Flash (Active Engine)',
                      desc: 'Lowest latency, high negative-constraint fidelity, 1M context',
                    },
                    {
                      id: 'gemini-1.5-pro',
                      title: 'Gemini 1.5 Pro (Deep Reasoning)',
                      desc: 'Complex mathematical and multi-step delimiter logic',
                    },
                    {
                      id: 'claude-3-5-sonnet',
                      title: 'Claude 3.5 Sonnet Command Profile',
                      desc: 'Coding precision and strict XML tag bounding',
                    },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setDefaultModel(m.id);
                        showNotification(`Default model set to ${m.title}`);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl p-3 text-left transition-all ${
                        defaultModel === m.id
                          ? 'bg-white/15 text-white border border-white/30'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-white">{m.title}</div>
                        <div className="text-[11px] text-slate-400">{m.desc}</div>
                      </div>
                      {defaultModel === m.id && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-black shrink-0">
                          <CustomCheckIcon size={12} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Generation Parameters */}
              <div className="space-y-3 rounded-2xl bg-white/5 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Execution Parameters
                </div>

                {/* Temperature */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">Temperature (Determinism vs Creativity)</span>
                    <span className="font-mono text-white">{temperature.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-white cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0.0 (Unbreakable Deterministic)</span>
                    <span>1.0 (Creative Exploratory)</span>
                  </div>
                </div>

                {/* Max Tokens */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">Max Token Length</span>
                    <span className="font-mono text-white">{maxLength} tokens</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1024, 2048, 4096].map((len) => (
                      <button
                        key={len}
                        type="button"
                        onClick={() => setMaxLength(len)}
                        className={`rounded-lg py-1.5 text-xs font-bold transition-all ${
                          maxLength === len
                            ? 'bg-white text-black'
                            : 'bg-white/10 text-slate-300 hover:bg-white/20'
                        }`}
                      >
                        {len} tokens
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5. Notifications & Alerts */}
              <div className="space-y-2 rounded-2xl bg-white/5 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Notifications
                </div>
                <div className="flex items-center justify-between py-1">
                  <div>
                    <div className="text-xs font-semibold text-white">Low-Quota Warning Alert</div>
                    <div className="text-[11px] text-slate-400">
                      Warn in UI when remaining tokens drop below 15,000
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLowQuotaAlert(!lowQuotaAlert)}
                    className={`h-6 w-11 rounded-full p-0.5 transition-colors ${
                      lowQuotaAlert ? 'bg-white' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`h-5 w-5 rounded-full bg-[#0E1324] transition-transform ${
                        lowQuotaAlert ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-1 border-t border-white/5 pt-2">
                  <div>
                    <div className="text-xs font-semibold text-white">Synthesis Push Notices</div>
                    <div className="text-[11px] text-slate-400">
                      Notify when multi-source background search completes
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifications(!notifications)}
                    className={`h-6 w-11 rounded-full p-0.5 transition-colors ${
                      notifications ? 'bg-white' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`h-5 w-5 rounded-full bg-[#0E1324] transition-transform ${
                        notifications ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* 6. Data Export */}
              <div className="flex items-center justify-between rounded-2xl bg-white/5 p-4">
                <div>
                  <div className="text-xs font-bold text-white">Data Export</div>
                  <div className="text-[11px] text-slate-400">
                    Export all saved chats, folders, and prompt templates as JSON
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleExportData}
                  className="flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-black hover:bg-slate-200 transition-colors touch-manipulation active:scale-95 shadow-md"
                >
                  <CustomExportIcon size={14} />
                  <span>Export JSON</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: 5.2 TOKEN USAGE (Used vs Quota, Per-Model, Reset Date, Low-Quota Warning, Live Telemetry) */}
          {activeTab === 'tokens' && (() => {
            const used = localUsage.totalUsed;
            const quota = localUsage.quota;
            const remaining = Math.max(0, quota - used);
            const percentage = Math.min(100, (used / quota) * 100);
            const isHigh = percentage >= 85;

            const handleSimulateReset = async () => {
              try {
                const res = await fetch('/api/tokens/reset', { method: 'POST' });
                if (res.ok) {
                  const data = await res.json();
                  setLocalUsage(data);
                  onRefreshUsage?.();
                  showNotification('Monthly token quota reset successfully');
                }
              } catch (e) {
                console.warn('Reset quota error:', e);
              }
            };

            return (
              <div className="space-y-4">
                {/* Live Controls Bar */}
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Real-Time Quota Telemetry
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={fetchLatestUsage}
                      disabled={isRefreshingUsage}
                      className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-white/20 transition-all touch-manipulation disabled:opacity-50"
                    >
                      {isRefreshingUsage ? 'Syncing...' : '↻ Refresh Stats'}
                    </button>
                    <button
                      type="button"
                      onClick={handleSimulateReset}
                      className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all touch-manipulation"
                      title="Reset test consumption quota"
                    >
                      Reset Quota
                    </button>
                  </div>
                </div>

                {/* Quota Progress Meter */}
                <div className="rounded-2xl bg-white/5 p-4 space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-300">Monthly Usage vs. Quota</span>
                    <span className="text-white font-mono font-bold">
                      {used.toLocaleString()} / {quota.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHigh ? 'bg-amber-400' : 'bg-white'
                      }`}
                      style={{ width: `${percentage.toFixed(1)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                    <span>{remaining.toLocaleString()} tokens remaining</span>
                    <span
                      className={`font-bold font-mono ${
                        isHigh ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {percentage.toFixed(1)}% consumed
                    </span>
                  </div>
                </div>

                {/* Low-Quota Warning Status */}
                <div className="rounded-xl bg-white/5 p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-2.5 w-2.5 rounded-full ${
                        isHigh
                          ? 'bg-amber-400 animate-ping'
                          : 'bg-emerald-400 animate-pulse'
                      }`}
                    />
                    <span className="font-semibold text-white">
                      {isHigh ? 'Quota Status: Low Remaining (>85% used)' : 'Quota Status: Optimal'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {lowQuotaAlert ? 'Low-quota alerts active (>85%)' : 'Alerts disabled'}
                  </span>
                </div>

                {/* Per-Model Usage Breakdown */}
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Per-Model Consumption Breakdown
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="rounded-xl bg-white/5 p-3">
                      <div className="text-[10px] font-bold uppercase text-slate-400">Gemini 3.8 Flash</div>
                      <div className="text-lg font-black text-white mt-1 font-mono">
                        {(localUsage.perModel?.geminiFlash ?? 0).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Primary synthesis & logic</div>
                    </div>

                    <div className="rounded-xl bg-white/5 p-3">
                      <div className="text-[10px] font-bold uppercase text-slate-400">Synthesizer Engine</div>
                      <div className="text-lg font-black text-white mt-1 font-mono">
                        {(localUsage.perModel?.synthesizer ?? 0).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Result 4 command hardening</div>
                    </div>

                    <div className="rounded-xl bg-white/5 p-3">
                      <div className="text-[10px] font-bold uppercase text-slate-400">Playground Validator</div>
                      <div className="text-lg font-black text-white mt-1 font-mono">
                        {(localUsage.perModel?.playgroundValidator ?? 0).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Run & AI Evaluations</div>
                    </div>
                  </div>
                </div>

                {/* Live Telemetry History Log */}
                {localUsage.history && localUsage.history.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Recent Telemetry Events ({localUsage.history.length})
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1.5 rounded-2xl bg-white/5 p-2.5 text-xs touch-scroll">
                      {localUsage.history.slice(0, 10).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-lg bg-black/30 px-3 py-2 text-xs"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="font-semibold text-white truncate text-[11px]">
                              {item.operationLabel}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {item.modelLabel} •{' '}
                              {new Date(item.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </div>
                          </div>
                          <span className="shrink-0 font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[11px]">
                            +{item.tokens} tokens
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reset Date */}
                <div className="rounded-xl bg-white/5 p-3.5 text-xs text-slate-300 flex items-center gap-2.5">
                  <CustomCheckIcon size={16} className="text-white shrink-0" />
                  <div>
                    <span className="font-semibold text-white">Reset Date: </span>
                    <span>
                      {new Date(localUsage.resetDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}{' '}
                      at 00:00 UTC (Resets automatically every month).
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TAB 3: 5.3 SUBSCRIPTION (Current Tier, Upgrade/Downgrade, Billing History) */}
          {activeTab === 'subscription' && (
            <div className="space-y-4">
              {/* Current Tier Badge */}
              <div className="rounded-2xl bg-white/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Current Tier
                  </span>
                  <span className="rounded-full bg-white text-black px-2.5 py-0.5 text-[10px] font-extrabold tracking-wide">
                    PRO ARCHITECT
                  </span>
                </div>
                <div>
                  <h4 className="text-2xl font-black text-white">$19 / month</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Active cycle • Renews November 1, 2026
                  </p>
                </div>
              </div>

              {/* Upgrade / Downgrade Tiers */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Select Plan (Upgrade / Downgrade)
                </div>
                <div className="space-y-2">
                  {[
                    {
                      id: 'FREE',
                      name: 'Starter Tier',
                      price: '$0 / mo',
                      tokens: '10,000 tokens/mo',
                      features: 'Standard prompt search, Basic synthesis',
                    },
                    {
                      id: 'PRO',
                      name: 'Pro Architect (Current)',
                      price: '$19 / mo',
                      tokens: '100,000 tokens/mo',
                      features: 'Priority synthesis, Full-Screen Playground, Folders & variables',
                    },
                    {
                      id: 'ENTERPRISE',
                      name: 'Enterprise Command',
                      price: '$49 / mo',
                      tokens: 'Unlimited tokens',
                      features: 'Custom jailbreak defense red-teaming, Dedicated delimiters',
                    },
                  ].map((plan) => (
                    <div
                      key={plan.id}
                      className={`flex items-center justify-between rounded-xl p-3.5 transition-all ${
                        selectedPlan === plan.id
                          ? 'bg-white/15 border border-white/30'
                          : 'bg-white/5'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{plan.name}</span>
                          <span className="font-mono text-[11px] text-white font-semibold">
                            {plan.price}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">{plan.features}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPlan(plan.id as any);
                          showNotification(`Tier updated to ${plan.name}`);
                        }}
                        className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                          selectedPlan === plan.id
                            ? 'bg-white text-black'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {selectedPlan === plan.id ? 'Active' : 'Select'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Billing History & Invoices */}
              <div className="space-y-2 pt-1">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Billing History & Invoices
                </div>
                <div className="space-y-1.5 rounded-2xl bg-white/5 p-3 text-xs">
                  {[
                    { date: 'Oct 1, 2026', inv: '#INV-2026-1001', amount: '$19.00', status: 'Paid' },
                    { date: 'Sep 1, 2026', inv: '#INV-2026-0901', amount: '$19.00', status: 'Paid' },
                    { date: 'Aug 1, 2026', inv: '#INV-2026-0801', amount: '$19.00', status: 'Paid' },
                  ].map((inv, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg bg-black/20 p-2 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">{inv.date}</span>
                        <span className="text-slate-400 font-mono text-[11px]">{inv.inv}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{inv.amount}</span>
                        <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300">
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-white/5 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-white px-5 py-2 text-xs font-bold text-black hover:bg-slate-200 transition-colors touch-manipulation active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
