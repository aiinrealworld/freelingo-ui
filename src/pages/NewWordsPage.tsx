import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api, type Word } from '../lib/api'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

function NewWordsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [newWords, setNewWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addedWords, setAddedWords] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    if (user?.uid) {
      loadNewWords()
    }
  }, [user?.uid])

  const loadNewWords = async () => {
    try {
      setLoading(true)
      setError(null)
      const words = await api.getNewWords(user!.uid)
      setNewWords(words)
    } catch (err) {
      console.error('Failed to load new words:', err)
      setError('Failed to load new words. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddWord = async (word: Word) => {
    if (!user?.uid) return
    try {
      await api.createWord({ word: word.word, translation: word.translation, example: word.example }, user.uid)
      setAddedWords((prev) => ({ ...prev, [word.word]: true }))
    } catch (err) {
      console.error('Failed to add word:', err)
      // Optionally show a toast
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading new words...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadNewWords}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                ← Back to Dashboard
              </Button>
            </div>
            <h1 className="text-xl font-bold text-gray-900">New Words</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Today's New Words</h2>
        </div>
        {newWords.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No new words available</h3>
            <p className="text-gray-600 mb-6">Check back later for more new words!</p>
            <Button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {newWords.map((word, idx) => (
              <Card key={word.word + idx} className="transition-all duration-200 hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {word.word}
                    </CardTitle>
                    {word.translation && (
                      <CardDescription className="text-lg font-medium text-blue-600">
                        {word.translation}
                      </CardDescription>
                    )}
                  </div>
                  <div>
                    {addedWords[word.word] ? (
                      <span className="text-green-600 text-3xl" title="Added">✔️</span>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => handleAddWord(word)}
                        disabled={!!addedWords[word.word]}
                        title="Add to Vocabulary"
                        style={{ fontSize: '2.5rem', lineHeight: 1, padding: 0 }}
                      >
                        👍
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {word.example && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Usage:</p>
                      <p className="text-gray-800 italic">"{word.example}"</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default NewWordsPage 