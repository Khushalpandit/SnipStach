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
export declare const Language: {
    readonly JAVASCRIPT: "javascript";
    readonly TYPESCRIPT: "typescript";
    readonly PYTHON: "python";
    readonly JAVA: "java";
    readonly CSHARP: "csharp";
    readonly PHP: "php";
    readonly RUBY: "ruby";
    readonly GO: "go";
    readonly RUST: "rust";
    readonly SWIFT: "swift";
    readonly KOTLIN: "kotlin";
    readonly BASH: "bash";
    readonly HTML: "html";
    readonly CSS: "css";
    readonly SQL: "sql";
    readonly JSON: "json";
    readonly YAML: "yaml";
    readonly MARKDOWN: "markdown";
    readonly OTHER: "other";
};
export type Language = typeof Language[keyof typeof Language];
export declare const AutoTag: {
    readonly LOOP: "loop";
    readonly API: "api";
    readonly ERROR_HANDLING: "error-handling";
    readonly ARRAY_OPS: "array-ops";
    readonly DEBUGGING: "debugging";
    readonly ASYNC: "async";
    readonly DATABASE: "database";
    readonly AUTH: "auth";
    readonly VALIDATION: "validation";
    readonly UTILITY: "utility";
    readonly UI: "ui";
    readonly TESTING: "testing";
};
export type AutoTag = typeof AutoTag[keyof typeof AutoTag];
//# sourceMappingURL=index.d.ts.map