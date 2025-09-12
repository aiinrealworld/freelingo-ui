import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api, type Word, type EndSessionResponse } from '../lib/api'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

function SessionResultsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [addedWords, setAddedWords] = useState<{ [key: string]: boolean }>({})
  const [addingAll, setAddingAll] = useState(false)

  // Get session results from navigation state
  const sessionResults = location.state?.sessionResults as EndSessionResponse | null

  useEffect(() => {
    if (!sessionResults) {
      // If no results data, redirect to dashboard
      navigate('/dashboard')
    }
  }, [sessionResults, navigate])

  if (!sessionResults) {
    return null // Will redirect
  }

  // Transform end-session words to Word format for reuse
  const transformWords = (): Word[] => {
    if (!sessionResults.new_words?.new_words || !sessionResults.new_words?.usages) {
      return []
    }

    return sessionResults.new_words.new_words.map((wordStr, index) => {
      const usage = sessionResults.new_words!.usages![wordStr]
      return {
        id: `session-${sessionResults.session_id}-${index}`, // Generate ID
        word: wordStr,
        translation: usage?.en || '',
        example: usage?.fr || '',
        user_id: user?.uid || '',
        learned: false
      }
    })
  }

  const sessionWords = transformWords()

  const handleAddWord = async (word: Word) => {
    if (!user?.uid) return
    try {
      await api.createWord({ word: word.word, translation: word.translation, example: word.example }, user.uid)
      setAddedWords((prev) => ({ ...prev, [word.word]: true }))
    } catch (err) {
      console.error('Failed to add word:', err)
    }
  }

  const handleAddAllWords = async () => {
    if (!user?.uid || sessionWords.length === 0) return
    
    setAddingAll(true)
    try {
      for (const word of sessionWords) {
        if (!addedWords[word.word]) {
          await api.createWord({ word: word.word, translation: word.translation, example: word.example }, user.uid)
          setAddedWords((prev) => ({ ...prev, [word.word]: true }))
        }
      }
    } catch (err) {
      console.error('Failed to add some words:', err)
    } finally {
      setAddingAll(false)
    }
  }

  const allWordsAdded = sessionWords.length > 0 && sessionWords.every(word => addedWords[word.word])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                ← Back to Dashboard
              </Button>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Session Results</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Session Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>📊</span>
              <span>Session Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {sessionResults.session_summary?.total_exchanges || 0}
                </div>
                <div className="text-sm text-gray-600">Total Exchanges</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {sessionResults.session_summary?.vocabulary_used || 0}
                </div>
                <div className="text-sm text-gray-600">Vocabulary Used</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {sessionWords.length}
                </div>
                <div className="text-sm text-gray-600">New Words</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Feedback Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>💡</span>
                <span>Feedback</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Strengths */}
              {sessionResults.feedback?.strengths && sessionResults.feedback.strengths.length > 0 && (
                <div>
                  <h4 className="font-semibold text-green-700 mb-2">✅ What you did well:</h4>
                  <ul className="space-y-1">
                    {sessionResults.feedback.strengths.map((strength, index) => (
                      <li key={index} className="text-sm text-gray-700 bg-green-50 p-2 rounded">
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Mistakes */}
              {sessionResults.feedback?.mistakes && sessionResults.feedback.mistakes.length > 0 && (
                <div>
                  <h4 className="font-semibold text-orange-700 mb-2">🔧 Areas for improvement:</h4>
                  <div className="space-y-3">
                    {sessionResults.feedback.mistakes.map((mistake, index) => (
                      <div key={index} className="bg-orange-50 p-3 rounded-lg">
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">You said:</span>
                          <span className="text-gray-600 ml-1">"{mistake.what_you_said}"</span>
                        </div>
                        <div className="text-sm mt-1">
                          <span className="font-medium text-gray-700">Better:</span>
                          <span className="text-gray-600 ml-1">"{mistake.better_way}"</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {mistake.simple_explanation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Conversation Examples */}
              {sessionResults.feedback?.conversation_examples && sessionResults.feedback.conversation_examples.length > 0 && (
                <div>
                  <h4 className="font-semibold text-blue-700 mb-2">💬 Try these phrases:</h4>
                  <ul className="space-y-1">
                    {sessionResults.feedback.conversation_examples.map((example, index) => (
                      <li key={index} className="text-sm text-gray-700 bg-blue-50 p-2 rounded">
                        "{example}"
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(!sessionResults.feedback?.strengths?.length && 
                !sessionResults.feedback?.mistakes?.length && 
                !sessionResults.feedback?.conversation_examples?.length) && (
                <div className="text-center py-8 text-gray-500">
                  <p>No detailed feedback available for this session.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* New Words Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span>📚</span>
                  <span>New Words from This Session</span>
                </div>
                {sessionWords.length > 0 && !allWordsAdded && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddAllWords}
                    disabled={addingAll}
                  >
                    {addingAll ? 'Adding...' : 'Add All'}
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sessionWords.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">📝</div>
                  <p>No new words identified in this session.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessionWords.map((word) => (
                    <div key={word.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{word.word}</div>
                        <div className="text-sm text-gray-600">{word.translation}</div>
                        {word.example && (
                          <div className="text-xs text-gray-500 italic mt-1">"{word.example}"</div>
                        )}
                      </div>
                      <div className="ml-4">
                        {addedWords[word.word] ? (
                          <span className="text-green-600 text-2xl" title="Added">✔️</span>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleAddWord(word)}
                            disabled={!!addedWords[word.word]}
                            title="Add to Vocabulary"
                            style={{ fontSize: '2rem', lineHeight: 1, padding: 0 }}
                          >
                            👍
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate('/dialogue')}
            className="px-8"
          >
            Start New Dialogue
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/words')}
            className="px-8"
          >
            View Vocabulary
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/new-words')}
            className="px-8"
          >
            More New Words
          </Button>
        </div>
      </main>
    </div>
  )
}

export default SessionResultsPage
