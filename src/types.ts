export interface Attachment {
  id: string;
  name: string;
  type: 'file' | 'camera' | 'gallery';
  mimeType: string;
  size?: string;
  dataUrl?: string; // base64 or preview
}

export interface PromptSearchResult {
  title: string;
  source: 'GitHub' | 'Reddit' | 'FlowGPT';
  sourceDetail: string;
  category: string;
  effectivenessScore: number;
  prompt: string;
  description: string;
  tags: string[];
  unbreakableRules: string[];
}

export interface SynthesisedPrompt {
  title: string;
  prompt: string;
  role: string;
  coreDirectives: string[];
  constraints: string[];
  edgeCaseHandling: string[];
  outputFormat: string;
  unbreakableScore: number;
  whyUnbreakable: string;
}

export interface TokenHistoryItem {
  id: string;
  timestamp: number;
  operation: string;
  operationLabel: string;
  tokens: number;
  model: string;
  modelLabel: string;
}

export interface TokenUsageData {
  totalUsed: number;
  quota: number;
  perModel: {
    geminiFlash: number;
    synthesizer: number;
    playgroundValidator: number;
  };
  resetDate: string;
  history?: TokenHistoryItem[];
}

export interface PromptSearchResponse {
  query: string;
  summary: string;
  results: [PromptSearchResult, PromptSearchResult, PromptSearchResult];
  synthesised: SynthesisedPrompt;
  tokenUsage?: {
    consumedTokens: number;
    totalUsed: number;
    quota: number;
    perModel: {
      geminiFlash: number;
      synthesizer: number;
      playgroundValidator: number;
    };
    resetDate: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  attachments?: Attachment[];
  promptResults?: PromptSearchResponse;
  isLoading?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  isIncognito?: boolean;
  isPinned?: boolean;
  folderId?: string;
}

export interface SavedFolder {
  id: string;
  name: string;
  color: string;
  folderInstruction?: string; // 5.4 folder-level instructions
  prompts: Array<{
    id: string;
    title: string;
    source: string;
    prompt: string;
    savedAt: number;
  }>;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: number;
  tier?: 'FREE' | 'PRO' | 'ENTERPRISE';
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface PlaygroundTestRun {
  id: string;
  timestamp: number;
  promptSnippet: string;
  prompt: string;
  variables: Record<string, string>;
  testInput?: string;
  output: string;
  score?: number;
  mode: 'run' | 'evaluate' | 'compare';
}

export interface AppSettings {
  theme: 'dark' | 'oled' | 'dim';
  language: string;
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  lowQuotaAlert: boolean;
  quotaThreshold: number;
  promptNotifications: boolean;
}
