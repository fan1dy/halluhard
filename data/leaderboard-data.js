// Leaderboard data
// This file aggregates data from all domains
// You can update this file by running a script that combines the turn_wise_rates.json files

const LEADERBOARD_DATA = {
    "coding": {
        "claude-haiku-4-5": {
            "1": 64.5,
            "3": 63.5,
            "5": 59.5
        },
        "claude-opus-4-5-websearch": {
            "1": 32.0,
            "3": 26.0,
            "5": 29.0
        },
        "claude-opus-4-5": {
            "1": 31.5,
            "3": 26.5,
            "5": 19.0
        },
        "claude-opus-4-6": {
            "1": 33.0,
            "3": 19.3,
            "5": 17.3
        },
        "claude-sonnet-4-5": {
            "1": 41.0,
            "3": 37.0,
            "5": 33.5
        },
        "claude-sonnet-4-6": {
            "1": 34.5,
            "3": 34.0,
            "5": 20.5
        },
        "deepseek-chat": {
            "1": 71.0,
            "3": 68.0,
            "5": 64.5
        },
        "deepseek-reasoner": {
            "1": 66.5,
            "3": 74.9,
            "5": 82.5
        },
        "gemini-3-flash": {
            "1": 54.5,
            "3": 43.5,
            "5": 47.0
        },
        "gemini-3-pro": {
            "1": 37.0,
            "3": 30.5,
            "5": 27.5
        },
        "gpt-5-medium": {
            "1": 46.5,
            "3": 39.0,
            "5": 38.0
        },
        "gpt-5-mini": {
            "1": 64.0,
            "3": 53.0,
            "5": 47.0
        },
        "gpt-5-nano": {
            "1": 77.0,
            "3": 72.5,
            "5": 63.5
        },
        "gpt-5.2-medium-websearch": {
            "1": 17.5,
            "3": 14.0,
            "5": 16.0
        },
        "gpt-5.2": {
            "1": 41.0,
            "3": 36.0,
            "5": 33.5
        },
        "gpt-5": {
            "1": 53.5,
            "3": 49.5,
            "5": 48.0
        },
        "gpt-5.2-thinking": {
            "1": 32.0,
            "3": 34.0,
            "5": 30.5
        },
        "glm-4-7-thinking": {
            "1": 64.5,
            "3": 58.0,
            "5": 58.5
        },
        "glm-5-thinking": {
            "1": 52.0,
            "3": 45.5,
            "5": 49.5
        },
        "kimi-k2-thinking": {
            "1": 61.5,
            "3": 60.0,
            "5": 64.0
        },
        "kimi-k2.5-thinking": {
            "1": 61.0,
            "3": 54.5,
            "5": 53.0
        },
        "grok-4.1-thinking-fast": {
            "1": 77.3,
            "3": 77.3,
            "5": 77.3
        },
        "grok-4-thinking": {
            "1": 60.5,
            "3": 54.0,
            "5": 52.5
        },
        "gemini-3.1-pro": {
            "1": 30.7,
            "3": 26.0,
            "5": 24.0
        },
        "gemini-3.1-pro-websearch": {
            "1": 27.5,
            "3": 20.0,
            "5": 27.0
        }
    },
    "legal_cases": {
        "claude-haiku-4-5": {
            "1": 59.5,
            "3": 68.8,
            "5": 72.6
        },
        "claude-opus-4-5-websearch": {
            "1": 29.8,
            "3": 32.7,
            "5": 36.5
        },
        "claude-opus-4-5": {
            "1": 35.0,
            "3": 48.7,
            "5": 51.1
        },
        "claude-opus-4-6": {
            "1": 39.6,
            "3": 53.8,
            "5": 56.5
        },
        "claude-sonnet-4-5": {
            "1": 43.1,
            "3": 57.3,
            "5": 59.0
        },
        "claude-sonnet-4-6": {
            "1": 46.0,
            "3": 51.5,
            "5": 51.0
        },
        "deepseek-chat": {
            "1": 45.0,
            "3": 58.8,
            "5": 64.9
        },
        "deepseek-reasoner": {
            "1": 44.8,
            "3": 58.5,
            "5": 63.5
        },
        "gemini-3-flash": {
            "1": 34.8,
            "3": 58.4,
            "5": 62.8
        },
        "gemini-3-pro": {
            "1": 34.9,
            "3": 47.7,
            "5": 55.5
        },
        "gpt-5-medium": {
            "1": 34.4,
            "3": 49.5,
            "5": 57.2
        },
        "gpt-5-mini": {
            "1": 53.5,
            "3": 68.6,
            "5": 70.2
        },
        "gpt-5-nano": {
            "1": 72.9,
            "3": 79.7,
            "5": 79.5
        },
        "gpt-5.2-medium-websearch": {
            "1": 24.7,
            "3": 41.1,
            "5": 41.2
        },
        "gpt-5.2": {
            "1": 31.1,
            "3": 50.6,
            "5": 56.6
        },
        "gpt-5": {
            "1": 43.7,
            "3": 54.4,
            "5": 60.2,
            "7": 63.8
        },
        "gpt-5.2-thinking": {
            "1": 26.0,
            "3": 34.4,
            "5": 39.9
        },
        "glm-4-7-thinking": {
            "1": 49.4,
            "3": 68.5,
            "5": 77.1
        },
        "glm-5-thinking": {
            "1": 44.5,
            "3": 61.3,
            "5": 66.0
        },
        "kimi-k2-thinking": {
            "1": 51.5,
            "3": 75.7,
            "5": 83.5
        },
        "kimi-k2.5-thinking": {
            "1": 47.5,
            "3": 71.5,
            "5": 76.0
        },
        "grok-4.1-thinking-fast": {
            "1": 73.4,
            "3": 73.4,
            "5": 73.4
        },
        "grok-4-thinking": {
            "1": 42.3,
            "3": 60.4,
            "5": 76.8
        },
        "gemini-3.1-pro": {
            "1": 35.2,
            "3": 45.3,
            "5": 49.5
        },
        "gemini-3.1-pro-websearch": {
            "1": 21.9,
            "3": 38.4,
            "5": 44.5
        }
    },
    "medical_guidelines": {
        "claude-haiku-4-5": {
            "1": 95.1,
            "3": 96.2,
            "5": 100.0
        },
        "claude-opus-4-5-websearch": {
            "1": 26.2,
            "3": 29.1,
            "5": 32.2
        },
        "claude-opus-4-5": {
            "1": 83.5,
            "3": 86.2,
            "5": 89.6
        },
        "claude-opus-4-6": {
            "1": 88.8,
            "3": 89.4,
            "5": 89.8
        },
        "claude-sonnet-4-5": {
            "1": 82.2,
            "3": 88.9,
            "5": 88.8
        },
        "claude-sonnet-4-6": {
            "1": 84.7,
            "3": 91.2,
            "5": 93.0
        },
        "deepseek-chat": {
            "1": 84.7,
            "3": 91.2,
            "5": 97.3
        },
        "deepseek-reasoner": {
            "1": 88.4,
            "3": 89.1,
            "5": 85.0
        },
        "gemini-3-flash": {
            "1": 85.4,
            "3": 92.1,
            "5": 89.4
        },
        "gemini-3-pro": {
            "1": 82.3,
            "3": 87.9,
            "5": 87.7
        },
        "gpt-5-medium": {
            "1": 76.3,
            "3": 90.0,
            "5": 88.8
        },
        "gpt-5-mini": {
            "1": 88.4,
            "3": 93.8,
            "5": 95.9
        },
        "gpt-5-nano": {
            "1": 88.2,
            "3": 95.0,
            "5": 98.7
        },
        "gpt-5.2-medium-websearch": {
            "1": 41.7,
            "3": 52.6,
            "5": 51.9
        },
        "gpt-5.2": {
            "1": 71.9,
            "3": 74.3,
            "5": 72.1
        },
        "gpt-5": {
            "1": 92.6,
            "3": 93.8,
            "5": 95.3
        },
        "gpt-5.2-thinking": {
            "1": 68.2,
            "3": 74.4,
            "5": 78.7
        },
        "glm-4-7-thinking": {
            "1": 89.4,
            "3": 94.7,
            "5": 91.1
        },
        "glm-5-thinking": {
            "1": 82.7,
            "3": 87.4,
            "5": 91.5
        },
        "kimi-k2-thinking": {
            "1": 91.2,
            "3": 96.1,
            "5": 97.3
        },
        "kimi-k2.5-thinking": {
            "1": 88.6,
            "3": 94.5,
            "5": 96.6
        },
        "grok-4.1-thinking-fast": {
            "1": 96.1,
            "3": 96.1,
            "5": 96.1
        },
        "grok-4-thinking": {
            "1": 87.7,
            "3": 93.4,
            "5": 97.2
        },
        "gemini-3.1-pro": {
            "1": 77.2,
            "3": 80.4,
            "5": 82.3
        },
        "gemini-3.1-pro-websearch": {
            "1": 68.0,
            "3": 70.8,
            "5": 76.3
        }
    },
    "research_questions": {
        "claude-haiku-4-5": {
            "1": 89.7,
            "3": 94.1,
            "5": 95.5
        },
        "claude-opus-4-5-websearch": {
            "1": 27.6,
            "3": 31.8,
            "5": 29.4
        },
        "claude-opus-4-5": {
            "1": 77.7,
            "3": 86.5,
            "5": 87.3
        },
        "claude-opus-4-6": {
            "1": 74.3,
            "3": 86.1,
            "5": 84.6
        },
        "claude-sonnet-4-5": {
            "1": 79.6,
            "3": 89.7,
            "5": 92.7
        },
        "claude-sonnet-4-6": {
            "1": 81.8,
            "3": 88.4,
            "5": 87.2
        },
        "deepseek-chat": {
            "1": 86.3,
            "3": 92.4,
            "5": 91.8
        },
        "deepseek-reasoner": {
            "1": 82.8,
            "3": 89.4,
            "5": 93.7
        },
        "gemini-3-flash": {
            "1": 85.7,
            "3": 88.8,
            "5": 91.3
        },
        "gemini-3-pro": {
            "1": 79.0,
            "3": 86.4,
            "5": 87.0
        },
        "gpt-5-medium": {
            "1": 78.7,
            "3": 93.2,
            "5": 91.1
        },
        "gpt-5-mini": {
            "1": 91.5,
            "3": 93.9,
            "5": 92.5
        },
        "gpt-5-nano": {
            "1": 94.0,
            "3": 97.5,
            "5": 99.3
        },
        "gpt-5.2-medium-websearch": {
            "1": 41.7,
            "3": 54.5,
            "5": 61.7
        },
        "gpt-5.2": {
            "1": 75.7,
            "3": 80.8,
            "5": 81.8
        },
        "gpt-5": {
            "1": 87.3,
            "3": 92.5,
            "5": 93.5
        },
        "gpt-5.2-thinking": {
            "1": 68.5,
            "3": 77.3,
            "5": 80.2
        },
        "glm-4-7-thinking": {
            "1": 87.9,
            "3": 93.3,
            "5": 95.1
        },
        "glm-5-thinking": {
            "1": 86.4,
            "3": 91.8,
            "5": 92.1
        },
        "kimi-k2-thinking": {
            "1": 89.4,
            "3": 94.9,
            "5": 96.3
        },
        "kimi-k2.5-thinking": {
            "1": 87.2,
            "3": 93.1,
            "5": 98.4
        },
        "grok-4.1-thinking-fast": {
            "1": 97.4,
            "3": 97.4,
            "5": 97.4
        },
        "grok-4-thinking": {
            "1": 86.2,
            "3": 94.7,
            "5": 97.6
        },
        "gemini-3.1-pro": {
            "1": 71.3,
            "3": 80.2,
            "5": 83.0
        },
        "gemini-3.1-pro-websearch": {
            "1": 76.7,
            "3": 83.4,
            "5": 87.3
        }
    }
};

// Overall hallucination rates extracted from HTML reports
// These are the actual overall rates from the reports, not averages of turn rates
// For coding domain, rates are from _coding_direct reports
const OVERALL_RATES = {
    "coding": {
        "claude-haiku-4-5": 62.5,
        "claude-opus-4-5-websearch": 29.0,
        "claude-opus-4-5": 25.7,
        "claude-opus-4-6": 23.2,
        "claude-sonnet-4-5": 37.2,
        "claude-sonnet-4-6": 29.7,
        "deepseek-chat": 67.8,
        "deepseek-reasoner": 74.6,
        "gemini-3-flash": 48.3,
        "gemini-3-pro": 31.7,
        "gpt-5-medium": 41.2,
        "gpt-5-mini": 54.7,
        "gpt-5-nano": 71.0,
        "gpt-5.2-medium-websearch": 15.8,
        "gpt-5.2": 36.8,
        "gpt-5.2-thinking": 32.2,
        "gpt-5": 50.3,
        "glm-4-7-thinking": 59.2,
        "glm-5-thinking": 49.0,
        "kimi-k2-thinking": 61.8,
        "kimi-k2.5-thinking": 56.2,
        "grok-4.1-thinking-fast": 77.3,
        "grok-4-thinking": 55.7,
        "gemini-3.1-pro": 27.0,
        "gemini-3.1-pro-websearch": 24.8
    },
    "legal_cases": {
        "claude-haiku-4-5": 67.1,
        "claude-opus-4-5": 44.8,
        "claude-opus-4-6": 49.7,
        "claude-sonnet-4-5": 51.8,
        "claude-sonnet-4-6": 49.5,
        "deepseek-chat": 56.4,
        "deepseek-reasoner": 55.7,
        "gemini-3-flash": 52.0,
        "gemini-3-pro": 46.0,
        "gpt-5-medium": 46.9,
        "gpt-5-mini": 63.5,
        "gpt-5-nano": 77.3,
        "gpt-5.2-medium-websearch": 35.6,
        "gpt-5.2": 46.4,
        "gpt-5.2-thinking": 33.5,
        "gpt-5": 52.8,
        "glm-4-7-thinking": 67.7,
        "glm-5-thinking": 57.3,
        "kimi-k2-thinking": 70.0,
        "kimi-k2.5-thinking": 65.2,
        "grok-4.1-thinking-fast": 73.4,
        "grok-4-thinking": 60.1,
        "gemini-3.1-pro": 43.3,
        "gemini-3.1-pro-websearch": 35.0
    },
    "medical_guidelines": {
        "claude-haiku-4-5": 95.7,
        "claude-opus-4-5-websearch": 29.2,
        "claude-opus-4-5": 85.6,
        "claude-opus-4-6": 89.3,
        "claude-sonnet-4-5": 86.1,
        "claude-sonnet-4-6": 89.7,
        "deepseek-chat": 89.0,
        "deepseek-reasoner": 88.1,
        "gemini-3-flash": 89.0,
        "gemini-3-pro": 85.9,
        "gpt-5-medium": 83.8,
        "gpt-5-mini": 92.7,
        "gpt-5-nano": 95.3,
        "gpt-5.2-medium-websearch": 48.8,
        "gpt-5.2": 72.7,
        "gpt-5.2-thinking": 74.0,
        "gpt-5": 92.8,
        "glm-4-7-thinking": 90.9,
        "glm-5-thinking": 87.3,
        "kimi-k2-thinking": 95.0,
        "kimi-k2.5-thinking": 93.2,
        "grok-4.1-thinking-fast": 96.1,
        "grok-4-thinking": 92.7,
        "gemini-3.1-pro": 80.0,
        "gemini-3.1-pro-websearch": 71.8
    },
    "research_questions": {
        "claude-haiku-4-5": 92.9,
        "claude-opus-4-5-websearch": 29.6,
        "claude-opus-4-5": 84.0,
        "claude-opus-4-6": 81.6,
        "claude-sonnet-4-5": 87.3,
        "claude-sonnet-4-6": 85.8,
        "deepseek-chat": 90.1,
        "deepseek-reasoner": 88.6,
        "gemini-3-flash": 88.6,
        "gemini-3-pro": 84.1,
        "gpt-5-medium": 87.3,
        "gpt-5-mini": 92.6,
        "gpt-5-nano": 96.9,
        "gpt-5.2-medium-websearch": 52.6,
        "gpt-5.2": 79.4,
        "gpt-5.2-thinking": 75.3,
        "gpt-5": 91.1,
        "glm-4-7-thinking": 90.7,
        "glm-5-thinking": 90.1,
        "kimi-k2-thinking": 93.5,
        "kimi-k2.5-thinking": 92.9,
        "grok-4.1-thinking-fast": 97.4,
        "grok-4-thinking": 92.8,
        "gemini-3.1-pro": 78.2,
        "gemini-3.1-pro-websearch": 77.2
    }
};
