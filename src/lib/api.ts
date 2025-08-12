const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

interface Word {
  id: string
  word: string
  translation: string
  example?: string
  user_id: string
  learned: boolean
}

interface WordCreate {
  word: string
  translation: string
  example?: string
}

interface DialogueResponse {
  response: string
  suggested_words: string[]
}

interface UserInfo {
  user_id: string
  email: string
  display_name?: string
  created_at: string
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

// Get Firebase ID token for authentication
async function getAuthToken(): Promise<string | null> {
  try {
    const { getAuth } = await import('firebase/auth')
    const auth = getAuth()
    const user = auth.currentUser
    if (user) {
      return await user.getIdToken()
    }
    return null
  } catch (error) {
    console.error('Failed to get auth token:', error)
    return null
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text()
    throw new ApiError(response.status, errorText)
  }
  return response.json()
}

// Types for dialogue sessions
export interface DialogueSession {
  session_id: string;
  user_id: string;
  messages: Message[];
  started_at: string;
  ended_at: string;
}

export interface SessionSummary {
  session_id: string;
  started_at: string;
  ended_at: string;
  message_count: number;
}

// Define Message type for dialogue sessions
export interface Message {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  timestamp: string;
}

// Save a dialogue session
export async function saveDialogueSession(userId: string, messages: any[], startedAt: string, endedAt: string) {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE}/dialogue-session`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ user_id: userId, messages, started_at: startedAt, ended_at: endedAt })
  });
  return handleResponse<{ session_id: string, status: string }>(response);
}

// List dialogue sessions
export async function getDialogueSessions(userId: string) {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE}/dialogue-sessions/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return handleResponse<SessionSummary[]>(response);
}

// Get a single session
export async function getDialogueSession(sessionId: string) {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE}/dialogue-session/${sessionId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return handleResponse<DialogueSession>(response);
}

export const api = {
  // User management
  async getUserInfo(): Promise<UserInfo> {
    const token = await getAuthToken()
    const response = await fetch(`${API_BASE.replace('/api', '')}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    return handleResponse<UserInfo>(response)
  },

  // Words management
  async getUserWords(userId: string): Promise<Word[]> {
    const token = await getAuthToken()
    const response = await fetch(`${API_BASE}/words/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    return handleResponse<Word[]>(response)
  },

  async createWord(word: WordCreate, userId: string): Promise<Word> {
    const token = await getAuthToken()
    const response = await fetch(`${API_BASE}/words`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...word, user_id: userId })
    })
    return handleResponse<Word>(response)
  },

  async updateWord(wordId: string, updates: Partial<Word>): Promise<Word> {
    const token = await getAuthToken()
    const response = await fetch(`${API_BASE}/words/${wordId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    })
    return handleResponse<Word>(response)
  },

  async markWordLearned(wordId: string): Promise<Word> {
    const token = await getAuthToken()
    const response = await fetch(`${API_BASE}/words/${wordId}/learned`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    return handleResponse<Word>(response)
  },

  async deleteWord(wordId: string): Promise<void> {
    const token = await getAuthToken()
    const response = await fetch(`${API_BASE}/words/${wordId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    if (!response.ok) {
      throw new ApiError(response.status, 'Failed to delete word')
    }
  },

  // Dialogue with AI
  async sendMessage(message: string, userId: string): Promise<DialogueResponse> {
    const token = await getAuthToken()
    const response = await fetch(`${API_BASE}/dialogue`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message, user_id: userId })
    })
    return handleResponse<DialogueResponse>(response)
  },

  // Fetch new words with examples for the user
  async getNewWords(userId: string): Promise<Word[]> {
    const token = await getAuthToken()
    const response = await fetch(`${API_BASE}/new-words/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    return handleResponse<Word[]>(response)
  },

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    const response = await fetch(`${API_BASE}/health`)
    return handleResponse<{ status: string }>(response)
  }
}

export type { Word, WordCreate, DialogueResponse, UserInfo } 