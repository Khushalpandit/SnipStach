const tagPatterns = {
    'loop': [
        /\b(for|while)\s*\(/i,
        /\b(forEach|map|filter|reduce)\s*\(/i,
        /\bdo\s*\{/i,
    ],
    'api': [
        /\b(fetch|axios|XMLHttpRequest)\s*\(/i,
        /\b(http|https)\.(get|post|put|delete|patch)/i,
    ],
    'error-handling': [
        /\btry\s*\{/i,
        /\bcatch\s*\(/i,
        /\bthrow\s+/i,
    ],
    'array-ops': [
        /\b(map|filter|reduce|find|some|every|includes)\s*\(/i,
        /\b(push|pop|shift|unshift|splice|slice)\s*\(/i,
    ],
    'debugging': [
        /\bconsole\.(log|error|warn|info|debug)\s*\(/i,
        /\bdebugger\b/i,
    ],
    'async': [
        /\basync\s+function\b/i,
        /\bawait\s+/i,
        /\bPromise\.(all|race|resolve|reject)\b/i,
    ],
    'database': [
        /\b(mongodb|mongoose|sql|sequelize|prisma)\b/i,
        /\b(select|insert|update|delete|find|create|save)\b/i,
    ],
    'auth': [
        /\b(jwt|token|auth|login|register|password|hash)\b/i,
        /\b(session|cookie|oauth|google|github)\b/i,
    ],
    'validation': [
        /\b(validate|validation|isValid|required|optional)\b/i,
        /\b(zod|joi|yup|validator)\b/i,
    ],
    'utility': [
        /\b(utils|helpers|format|parse|stringify|encode|decode)\b/i,
        /\b(date|time|number|string|array|object)\b/i,
    ],
    'ui': [
        /\b(react|vue|angular|svelte)\b/i,
        /\b(component|render|props|state|style|css)\b/i,
    ],
    'testing': [
        /\b(jest|mocha|chai|cypress|test|spec|expect)\b/i,
        /\b(describe|it|before|after|mock|spy)\b/i,
    ],
};
const languageSpecificPatterns = {
    'javascript': {
        'async': [
            /\bnew\s+Promise\b/i,
            /\b\.then\(/i,
            /\b\.catch\(/i,
        ],
    },
    'typescript': {
        'validation': [
            /\b(interface|type|enum)\b/i,
            /\b(extends|implements)\b/i,
        ],
    },
    'python': {
        'async': [
            /\basync\s+def\b/i,
            /\bawait\b/i,
        ],
        'loop': [
            /\bfor\s+\w+\s+in\b/i,
            /\bwhile\s+\w+\s*:/i,
        ],
    },
};
export const generateAutoTags = (code, language) => {
    const tags = new Set();
    // Check common patterns
    Object.entries(tagPatterns).forEach(([tag, patterns]) => {
        if (patterns.some(pattern => pattern.test(code))) {
            tags.add(tag);
        }
    });
    // Check language-specific patterns
    const languagePatterns = languageSpecificPatterns[language];
    if (languagePatterns) {
        Object.entries(languagePatterns).forEach(([tag, patterns]) => {
            if (patterns.some(pattern => pattern.test(code))) {
                tags.add(tag);
            }
        });
    }
    return Array.from(tags);
};
