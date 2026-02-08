// Reference and Content Grounding Failure Rates
// Data structure: domain -> model -> { reference_failure_rate, content_failure_rate }
// Rates are percentages (0-100), extracted from aggregate HTML reports (ref/total_facts, content/total_facts)

const GROUNDING_FAILURES = {
    "legal_cases": {
        "gpt-5": { reference_failure: 26.1, content_failure: 52.3 },
        "gpt-5-thinking": { reference_failure: 17.5, content_failure: 46.6 },
        "gpt-5.2": { reference_failure: 16.0, content_failure: 45.8 },
        "gpt-5.2-medium-websearch": { reference_failure: 16.3, content_failure: 35.1 },
        "claude-haiku-4-5": { reference_failure: 37.8, content_failure: 66.1 },
        "claude-sonnet-4-5": { reference_failure: 24.3, content_failure: 51.0 },
        "claude-opus-4-5": { reference_failure: 17.7, content_failure: 44.5 },
        "claude-opus-4-5-websearch": { reference_failure: 13.6, content_failure: 32.9 },
        "gemini-3-flash": { reference_failure: 27.0, content_failure: 51.8 },
        "gemini-3-pro": { reference_failure: 20.0, content_failure: 45.5 },
        "deepseek-chat": { reference_failure: 25.3, content_failure: 55.8 },
        "deepseek-reasoner": { reference_failure: 33.4, content_failure: 55.4 },
        "kimi-k2-thinking": { reference_failure: 39.4, content_failure: 69.3 },
        "kimi-k2.5-thinking": { reference_failure: 34.4, content_failure: 64.9 }
    },
    "research_questions": {
        "gpt-5": { reference_failure: 62.7, content_failure: 90.4 },
        "gpt-5-thinking": { reference_failure: 40.7, content_failure: 87.1 },
        "gpt-5.2": { reference_failure: 32.0, content_failure: 78.3 },
        "gpt-5.2-medium-websearch": { reference_failure: 6.4, content_failure: 51.6 },
        "claude-haiku-4-5": { reference_failure: 67.3, content_failure: 92.9 },
        "claude-sonnet-4-5": { reference_failure: 41.4, content_failure: 87.3 },
        "claude-opus-4-5": { reference_failure: 38.6, content_failure: 83.9 },
        "claude-opus-4-5-websearch": { reference_failure: 7.0, content_failure: 29.5 },
        "gemini-3-flash": { reference_failure: 58.7, content_failure: 88.6 },
        "gemini-3-pro": { reference_failure: 44.0, content_failure: 83.9 },
        "deepseek-chat": { reference_failure: 63.9, content_failure: 89.7 },
        "deepseek-reasoner": { reference_failure: 62.6, content_failure: 88.3 },
        "kimi-k2-thinking": { reference_failure: 62.8, content_failure: 93.1 },
        "kimi-k2.5-thinking": { reference_failure: 49.8, content_failure: 92.6 }
    },
    "medical_guidelines": {
        "gpt-5": { reference_failure: 65.9, content_failure: 93.3 },
        "gpt-5-thinking": { reference_failure: 33.8, content_failure: 78.7 },
        "gpt-5.2": { reference_failure: 20.8, content_failure: 71.7 },
        "gpt-5.2-medium-websearch": { reference_failure: 4.7, content_failure: 48.6 },
        "claude-haiku-4-5": { reference_failure: 51.4, content_failure: 95.4 },
        "claude-sonnet-4-5": { reference_failure: 32.0, content_failure: 85.3 },
        "claude-opus-4-5": { reference_failure: 39.4, content_failure: 85.0 },
        "claude-opus-4-5-websearch": { reference_failure: 1.8, content_failure: 29.1 },
        "gemini-3-flash": { reference_failure: 58.4, content_failure: 88.3 },
        "gemini-3-pro": { reference_failure: 49.3, content_failure: 85.7 },
        "deepseek-chat": { reference_failure: 45.6, content_failure: 89.0 },
        "deepseek-reasoner": { reference_failure: 57.4, content_failure: 87.8 },
        "kimi-k2-thinking": { reference_failure: 62.7, content_failure: 94.4 },
        "kimi-k2.5-thinking": { reference_failure: 53.6, content_failure: 92.4 }
    }
};
