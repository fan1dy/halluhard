// Coding Function-Category Hallucination Rates
// Data structure: model -> category -> rate (percentage 0-100)
// Categories: import (hallucinated package imports), install (hallucinated install commands), function (hallucinated function/API calls)
// Rates extracted from per-model aggregate HTML reports in coding/results/reports/

const CODING_FUNCTION_RATES = {
    "claude-haiku-4-5": {
        "import": 14.7,
        "install": 36.3,
        "function": 43.8
    },
    "claude-opus-4-5-websearch": {
        "import": 3.0,
        "install": 10.5,
        "function": 21.3
    },
    "claude-opus-4-5": {
        "import": 3.5,
        "install": 10.8,
        "function": 17.5
    },
    "claude-sonnet-4-5": {
        "import": 6.7,
        "install": 15.3,
        "function": 26.8
    },
    "deepseek-chat": {
        "import": 23.7,
        "install": 36.2,
        "function": 56.7
    },
    "deepseek-reasoner": {
        "import": 28.7,
        "install": 43.4,
        "function": 64.1
    },
    "gemini-3-flash": {
        "import": 16.5,
        "install": 18.2,
        "function": 43.7
    },
    "gemini-3-pro": {
        "import": 8.7,
        "install": 7.7,
        "function": 29.0
    },
    "gemini-3.1-pro": {
        "import": 6.5,
        "install": 7.5,
        "function": 23.7
    },
    "glm-4-7-thinking": {
        "import": 21.0,
        "install": 21.8,
        "function": 56.0
    },
    "glm-5-thinking": {
        "import": 15.3,
        "install": 12.2,
        "function": 44.7
    },
    "gpt-5-thinking": {
        "import": 10.7,
        "install": 10.8,
        "function": 35.3
    },
    "gpt-5-mini": {
        "import": 16.5,
        "install": 23.8,
        "function": 46.7
    },
    "gpt-5-nano": {
        "import": 25.0,
        "install": 34.2,
        "function": 61.2
    },
    "gpt-5.2-medium-websearch": {
        "import": 0.7,
        "install": 0.8,
        "function": 14.8
    },
    "gpt-5.2-thinking": {
        "import": 7.3,
        "install": 8.0,
        "function": 26.5
    },
    "gpt-5.2": {
        "import": 9.2,
        "install": 12.2,
        "function": 32.8
    },
    "gpt-5": {
        "import": 17.5,
        "install": 23.7,
        "function": 42.2
    },
    "grok-4.1-thinking-fast": {
        "import": 29.7,
        "install": 32.2,
        "function": 74.7
    },
    "grok-4-thinking": {
        "import": 12.8,
        "install": 15.3,
        "function": 51.5
    },
    "kimi-k2-thinking": {
        "import": 16.0,
        "install": 19.2,
        "function": 58.2
    },
    "kimi-k2.5-thinking": {
        "import": 12.0,
        "install": 12.3,
        "function": 52.2
    }
};
