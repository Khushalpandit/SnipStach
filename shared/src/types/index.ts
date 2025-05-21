export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Snippet {
  id: string;
  userId: string;
  title: string;
  code: string;
  language: Language;
  description?: string;
  tags: string[];
  autoTags: AutoTag[];
  folderId?: string;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
}

export interface Folder {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const Language = {
  JAVASCRIPT: 'javascript',
  TYPESCRIPT: 'typescript',
  PYTHON: 'python',
  JAVA: 'java',
  CSHARP: 'csharp',
  PHP: 'php',
  RUBY: 'ruby',
  GO: 'go',
  RUST: 'rust',
  SWIFT: 'swift',
  KOTLIN: 'kotlin',
  BASH: 'bash',
  HTML: 'html',
  CSS: 'css',
  SQL: 'sql',
  JSON: 'json',
  YAML: 'yaml',
  MARKDOWN: 'markdown',
  OTHER: 'other'
} as const;

export type Language = typeof Language[keyof typeof Language];

export const AutoTag = {
  LOOP: 'loop',
  API: 'api',
  ERROR_HANDLING: 'error-handling',
  ARRAY_OPS: 'array-ops',
  DEBUGGING: 'debugging',
  ASYNC: 'async',
  DATABASE: 'database',
  AUTH: 'auth',
  VALIDATION: 'validation',
  UTILITY: 'utility',
  UI: 'ui',
  TESTING: 'testing'
} as const;

export type AutoTag = typeof AutoTag[keyof typeof AutoTag]; 