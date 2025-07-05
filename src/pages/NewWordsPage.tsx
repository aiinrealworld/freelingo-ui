import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api, type Word } from '../lib/api'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

function NewWordsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.uid) {
      loadWords()
    }
  }, [user?.uid])

  const loadWords = async () => {
    try {
      setLoading(true)
      setError(null)
      const userWords = await api.getUserWords(user!.uid)
      setWords(userWords)
    } catch (err) {
      console.error('Failed to load words:', err)
      setError('Failed to load words. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsLearned = async (wordId: string) => {
    try {
      const updatedWord = await api.markWordLearned(wordId)
      setWords(prevWords =>
        prevWords.map(word =>
          word.id === wordId ? updatedWord : word
        )
      )
    } catch (err) {
      console.error('Failed to mark word as learned:', err)
      setError('Failed to update word. Please try again.')
    }
  }

  const learnedCount = words.filter(word => word.learned).length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading words...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadWords}>Try Again</Button>
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
        {/* Progress Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Today's Vocabulary</h2>
            <div className="text-sm text-gray-600">
              {learnedCount} of {words.length} words learned
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${words.length > 0 ? (learnedCount / words.length) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        {/* Words Grid */}
        {words.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No words yet</h3>
            <p className="text-gray-600 mb-6">Add some words to get started with your learning journey!</p>
            <Button onClick={() => navigate('/words')}>
              Add Your First Word
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {words.map((word) => (
              <Card 
                key={word.id}
                className={`transition-all duration-200 ${
                  word.learned 
                    ? 'bg-green-50 border-green-200' 
                    : 'hover:shadow-lg'
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {word.word}
                    </CardTitle>
                    {word.learned && (
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    )}
                  </div>
                  <CardDescription className="text-lg font-medium text-blue-600">
                    {word.translation}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {word.example && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Example:</p>
                      <p className="text-gray-800 italic">"{word.example}"</p>
                    </div>
                  )}
                  <Button
                    onClick={() => handleMarkAsLearned(word.id)}
                    disabled={word.learned}
                    className={`w-full ${
                      word.learned 
                        ? 'bg-green-500 text-white cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {word.learned ? 'Learned ✓' : 'Mark as Learned'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Completion Message */}
        {words.length > 0 && learnedCount === words.length && (
          <div className="mt-8 text-center">
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="p-6">
                <div className="text-4xl mb-4">🎉</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Congratulations!
                </h3>
                <p className="text-gray-600 mb-4">
                  You've learned all the new words for today. Great job!
                </p>
                <div className="space-x-4">
                  <Button onClick={() => navigate('/dialogue')}>
                    Practice in Dialogue
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/dashboard')}>
                    Back to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}

export default NewWordsPage 