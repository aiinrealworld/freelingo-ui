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

interface UserProgress {
  total_words: number
  learned_words: number
  dialogue_sessions: number
  streak_days: number
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

export const api = {
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

  // User progress
  async getUserProgress(userId: string): Promise<UserProgress> {
    const token = await getAuthToken()
    const response = await fetch(`${API_BASE}/user/${userId}/progress`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    return handleResponse<UserProgress>(response)
  },

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    const response = await fetch(`${API_BASE}/health`)
    return handleResponse<{ status: string }>(response)
  }
}

export type { Word, WordCreate, DialogueResponse, UserProgress } 