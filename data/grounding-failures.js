// Reference and Content Grounding Failure Rates
// Data structure: domain -> model -> { reference_failure_rate, content_failure_rate }
// Rates are percentages (0-100)

const GROUNDING_FAILURES = {
    "legal_cases": {
        "gpt-5": { reference_failure: 15.2, content_failure: 45.3 },
        "gpt-5-thinking": { reference_failure: 12.8, content_failure: 38.5 },
        "gpt-5.2": { reference_failure: 11.5, content_failure: 39.2 },
        "gpt-5.2-medium-websearch": { reference_failure: 5.2, content_failure: 32.1 },
        "claude-haiku-4-5": { reference_failure: 18.5, content_failure: 52.3 },
        "claude-sonnet-4-5": { reference_failure: 14.2, content_failure: 41.8 },
        "claude-opus-4-5": { reference_failure: 10.8, content_failure: 37.5 },
        "claude-opus-4-5-websearch": { reference_failure: 4.5, content_failure: 28.2 },
        "gemini-3-flash": { reference_failure: 13.5, content_failure: 42.0 },
        "gemini-3-pro": { reference_failure: 11.2, content_failure: 38.5 },
        "deepseek-chat": { reference_failure: 16.8, content_failure: 43.2 },
        "deepseek-reasoner": { reference_failure: 15.5, content_failure: 43.8 },
        "kimi-k2-thinking": { reference_failure: 19.2, content_failure: 54.3 },
        "kimi-k2.5-thinking": { reference_failure: 34.5, content_failure: 64.9 }
    },
    "research_questions": {
        "gpt-5": { reference_failure: 22.5, content_failure: 72.3 },
        "gpt-5-thinking": { reference_failure: 18.8, content_failure: 71.2 },
        "gpt-5.2": { reference_failure: 16.5, content_failure: 66.5 },
        "gpt-5.2-medium-websearch": { reference_failure: 8.2, content_failure: 47.8 },
        "claude-haiku-4-5": { reference_failure: 25.2, content_failure: 71.5 },
        "claude-sonnet-4-5": { reference_failure: 20.5, content_failure: 70.2 },
        "claude-opus-4-5": { reference_failure: 18.2, content_failure: 69.5 },
        "claude-opus-4-5-websearch": { reference_failure: 6.5, content_failure: 25.8 },
        "gemini-3-flash": { reference_failure: 21.8, content_failure: 70.5 },
        "gemini-3-pro": { reference_failure: 19.5, content_failure: 68.2 },
        "deepseek-chat": { reference_failure: 23.2, content_failure: 70.8 },
        "deepseek-reasoner": { reference_failure: 22.8, content_failure: 69.5 },
        "kimi-k2-thinking": { reference_failure: 26.5, content_failure: 70.8 },
        "kimi-k2.5-thinking": { reference_failure: 49.8, content_failure: 92.7 }
    },
    "medical_guidelines": {
        "gpt-5": { reference_failure: 18.5, content_failure: 78.2 },
        "gpt-5-thinking": { reference_failure: 15.2, content_failure: 72.5 },
        "gpt-5.2": { reference_failure: 12.8, content_failure: 63.8 },
        "gpt-5.2-medium-websearch": { reference_failure: 7.5, content_failure: 44.2 },
        "claude-haiku-4-5": { reference_failure: 22.5, content_failure: 77.8 },
        "claude-sonnet-4-5": { reference_failure: 19.2, content_failure: 70.5 },
        "claude-opus-4-5": { reference_failure: 16.8, content_failure: 72.5 },
        "claude-opus-4-5-websearch": { reference_failure: 5.2, content_failure: 26.5 },
        "gemini-3-flash": { reference_failure: 20.5, content_failure: 72.2 },
        "gemini-3-pro": { reference_failure: 18.2, content_failure: 71.5 },
        "deepseek-chat": { reference_failure: 21.8, content_failure: 71.0 },
        "deepseek-reasoner": { reference_failure: 20.5, content_failure: 71.2 },
        "kimi-k2-thinking": { reference_failure: 23.5, content_failure: 75.2 },
        "kimi-k2.5-thinking": { reference_failure: 53.6, content_failure: 92.4 }
    }
};
