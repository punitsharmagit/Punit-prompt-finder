import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../data');
const USAGE_FILE = path.join(DATA_DIR, 'token_usage.json');

export interface TokenHistoryItem {
  id: string;
  timestamp: number;
  operation: 'search_synthesis' | 'playground_run' | 'playground_evaluate';
  operationLabel: string;
  tokens: number;
  model: 'geminiFlash' | 'synthesizer' | 'playgroundValidator';
  modelLabel: string;
}

export interface TokenUsageStats {
  totalUsed: number;
  quota: number;
  perModel: {
    geminiFlash: number;
    synthesizer: number;
    playgroundValidator: number;
  };
  resetDate: string;
  history: TokenHistoryItem[];
}

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DEFAULT_HISTORY: TokenHistoryItem[] = [
  {
    id: 'tok_init_1',
    timestamp: Date.now() - 3600000 * 2,
    operation: 'search_synthesis',
    operationLabel: 'Search & Unbreakable Command Synthesis',
    tokens: 420,
    model: 'synthesizer',
    modelLabel: 'PromptAI Synthesizer Engine',
  },
  {
    id: 'tok_init_2',
    timestamp: Date.now() - 3600000 * 5,
    operation: 'search_synthesis',
    operationLabel: 'Multi-Repository Prompt Retrieval',
    tokens: 650,
    model: 'geminiFlash',
    modelLabel: 'Gemini 3.8 Flash',
  },
  {
    id: 'tok_init_3',
    timestamp: Date.now() - 3600000 * 12,
    operation: 'playground_evaluate',
    operationLabel: 'Red-Team Boundary & Adversarial Evaluation',
    tokens: 580,
    model: 'playgroundValidator',
    modelLabel: 'Playground Red-Team Validator',
  },
];

const DEFAULT_USAGE: TokenUsageStats = {
  totalUsed: 14820,
  quota: 100000,
  perModel: {
    geminiFlash: 9200,
    synthesizer: 4120,
    playgroundValidator: 1500,
  },
  resetDate: '2026-11-01T00:00:00.000Z',
  history: DEFAULT_HISTORY,
};

function loadUsage(): TokenUsageStats {
  try {
    if (fs.existsSync(USAGE_FILE)) {
      const data = fs.readFileSync(USAGE_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed.totalUsed === 'number') {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading token usage file:', e);
  }
  return {
    ...DEFAULT_USAGE,
    perModel: { ...DEFAULT_USAGE.perModel },
    history: [...DEFAULT_HISTORY],
  };
}

function saveUsage(stats: TokenUsageStats) {
  try {
    fs.writeFileSync(USAGE_FILE, JSON.stringify(stats, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving token usage file:', e);
  }
}

let cachedUsage = loadUsage();

export function getUsageStats(): TokenUsageStats {
  return cachedUsage;
}

const OPERATION_LABELS: Record<string, string> = {
  search_synthesis: 'Prompt Synthesis & Multi-Source Search',
  playground_run: 'Playground Live Execution & Verification',
  playground_evaluate: 'Security Audit & Vulnerability Evaluation',
};

const MODEL_LABELS: Record<string, string> = {
  geminiFlash: 'Gemini 3.8 Flash',
  synthesizer: 'PromptAI Synthesizer Engine',
  playgroundValidator: 'Playground Red-Team Validator',
};

export function recordTokenConsumption(
  operation: 'search_synthesis' | 'playground_run' | 'playground_evaluate',
  tokens: number,
  modelName: 'geminiFlash' | 'synthesizer' | 'playgroundValidator' = 'geminiFlash'
): TokenUsageStats {
  const safeTokens = Math.max(1, Math.round(tokens));
  cachedUsage.totalUsed += safeTokens;
  cachedUsage.perModel[modelName] = (cachedUsage.perModel[modelName] || 0) + safeTokens;

  const historyItem: TokenHistoryItem = {
    id: `tok_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
    operation,
    operationLabel: OPERATION_LABELS[operation] || operation,
    tokens: safeTokens,
    model: modelName,
    modelLabel: MODEL_LABELS[modelName] || modelName,
  };

  cachedUsage.history.unshift(historyItem);

  if (cachedUsage.history.length > 50) {
    cachedUsage.history = cachedUsage.history.slice(0, 50);
  }

  saveUsage(cachedUsage);
  return cachedUsage;
}

export function resetUsageStats(): TokenUsageStats {
  cachedUsage = {
    totalUsed: 0,
    quota: 100000,
    perModel: {
      geminiFlash: 0,
      synthesizer: 0,
      playgroundValidator: 0,
    },
    resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    history: [],
  };
  saveUsage(cachedUsage);
  return cachedUsage;
}
