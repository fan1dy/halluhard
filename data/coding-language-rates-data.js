// Coding Language-Specific Hallucination Rates
// Data structure: model -> language -> rate (percentage 0-100)

const CODING_LANGUAGE_RATES = {
    "gpt-5-nano": {
        "elixir": 84.7,
        "python": 56.7,
        "r": 62.7,
        "scala": 80.0
    },
    "gpt-5-mini": {
        "elixir": 64.0,
        "python": 36.0,
        "r": 56.7,
        "scala": 62.0
    },
    "gpt-5": {
        "elixir": 62.0,
        "python": 28.7,
        "r": 47.3,
        "scala": 63.3
    },
    "gpt-5-medium": {
        "elixir": 48.7,
        "python": 34.7,
        "r": 40.0,
        "scala": 41.3
    },
    "gpt-5.2": {
        "elixir": 44.0,
        "python": 22.7,
        "r": 39.3,
        "scala": 41.3
    },
    "gpt-5.2-thinking": {
        "elixir": 35.3,
        "python": 30.0,
        "r": 29.3,
        "scala": 34.0
    },
    "gpt-5.2-medium-websearch": {
        "elixir": 18.0,
        "python": 11.3,
        "r": 18.0,
        "scala": 16.0
    },
    "claude-haiku-4-5": {
        "elixir": 67.3,
        "python": 52.0,
        "r": 62.0,
        "scala": 68.7
    },
    "claude-sonnet-4-5": {
        "elixir": 34.7,
        "python": 33.3,
        "r": 40.0,
        "scala": 40.7
    },
    "claude-opus-4-5": {
        "elixir": 23.3,
        "python": 20.0,
        "r": 30.0,
        "scala": 29.3
    },
    "claude-opus-4-6": {
        "elixir": 22.7,
        "python": 20.9,
        "r": 30.7,
        "scala": 18.7
    },
    "claude-sonnet-4-6": {
        "elixir": 35.3,
        "python": 18.0,
        "r": 36.0,
        "scala": 29.3
    },
    "claude-opus-4-5-websearch": {
        "elixir": 32.0,
        "python": 22.0,
        "r": 30.0,
        "scala": 32.0
    },
    "gemini-3-flash": {
        "elixir": 64.0,
        "python": 35.3,
        "r": 40.7,
        "scala": 53.3
    },
    "gemini-3-pro": {
        "elixir": 42.0,
        "python": 21.3,
        "r": 21.3,
        "scala": 42.0
    },
    "gemini-3.1-pro": {
        "elixir": 32.0,
        "python": 23.3,
        "r": 13.3,
        "scala": 39.3
    },
    "deepseek-chat": {
        "elixir": 82.7,
        "python": 48.7,
        "r": 60.0,
        "scala": 80.0
    },
    "deepseek-reasoner": {
        "elixir": 85.3,
        "python": 59.7,
        "r": 72.0,
        "scala": 81.3
    },
    "kimi-k2-thinking": {
        "elixir": 66.0,
        "python": 44.0,
        "r": 70.7,
        "scala": 66.7
    },
    "kimi-k2.5-thinking": {
        "elixir": 62.0,
        "python": 40.0,
        "r": 52.0,
        "scala": 70.7
    }
};
