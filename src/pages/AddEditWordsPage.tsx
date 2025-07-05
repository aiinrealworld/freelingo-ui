import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api, type Word, type WordCreate } from '../lib/api'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

function AddEditWordsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<WordCreate>({
    word: '',
    translation: '',
    example: ''
  })
  
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

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

  const handleInputChange = (field: keyof WordCreate, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.word.trim() || !formData.translation.trim() || !user?.uid) return

    setSubmitting(true)
    setError(null)

    try {
      if (editingId) {
        // Edit existing word
        const updatedWord = await api.updateWord(editingId, formData)
        setWords(prev => prev.map(word => 
          word.id === editingId ? updatedWord : word
        ))
        setEditingId(null)
      } else {
        // Add new word
        const newWord = await api.createWord(formData, user.uid)
        setWords(prev => [...prev, newWord])
      }

      // Reset form
      setFormData({ word: '', translation: '', example: '' })
    } catch (err) {
      console.error('Failed to save word:', err)
      setError('Failed to save word. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (word: Word) => {
    setFormData({
      word: word.word,
      translation: word.translation,
      example: word.example || ''
    })
    setEditingId(word.id)
  }

  const handleDelete = async (wordId: string) => {
    try {
      await api.deleteWord(wordId)
      setWords(prev => prev.filter(word => word.id !== wordId))
      if (editingId === wordId) {
        setEditingId(null)
        setFormData({ word: '', translation: '', example: '' })
      }
    } catch (err) {
      console.error('Failed to delete word:', err)
      setError('Failed to delete word. Please try again.')
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({ word: '', translation: '', example: '' })
  }

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
            <h1 className="text-xl font-bold text-gray-900">Add/Edit Words</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add/Edit Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingId ? 'Edit Word' : 'Add New Word'}
                </CardTitle>
                <CardDescription>
                  {editingId 
                    ? 'Update the word information below.' 
                    : 'Add a new word to your vocabulary list.'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Word (French)
                    </label>
                    <Input
                      value={formData.word}
                      onChange={(e) => handleInputChange('word', e.target.value)}
                      placeholder="e.g., Bonjour"
                      required
                      disabled={submitting}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Translation (English)
                    </label>
                    <Input
                      value={formData.translation}
                      onChange={(e) => handleInputChange('translation', e.target.value)}
                      placeholder="e.g., Hello"
                      required
                      disabled={submitting}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Example Sentence (Optional)
                    </label>
                    <Input
                      value={formData.example}
                      onChange={(e) => handleInputChange('example', e.target.value)}
                      placeholder="e.g., Bonjour, comment allez-vous?"
                      disabled={submitting}
                    />
                  </div>
                  
                  <div className="flex space-x-2 pt-4">
                    <Button type="submit" className="flex-1" disabled={submitting}>
                      {submitting ? 'Saving...' : (editingId ? 'Update Word' : 'Add Word')}
                    </Button>
                    {editingId && (
                      <Button type="button" variant="outline" onClick={handleCancel} disabled={submitting}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Words List */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Your Vocabulary ({words.length} words)</CardTitle>
                <CardDescription>
                  Manage your personal word collection
                </CardDescription>
              </CardHeader>
              <CardContent>
                {words.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-4">📚</div>
                    <p>No words added yet.</p>
                    <p className="text-sm">Add your first word using the form!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {words.map((word) => (
                      <div
                        key={word.id}
                        className={`p-4 border rounded-lg ${
                          editingId === word.id 
                            ? 'border-blue-300 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{word.word}</h3>
                              <span className="text-gray-400">→</span>
                              <span className="text-blue-600 font-medium">{word.translation}</span>
                              {word.learned && (
                                <span className="text-green-600 text-sm">✓ Learned</span>
                              )}
                            </div>
                            {word.example && (
                              <p className="text-sm text-gray-600 italic">"{word.example}"</p>
                            )}
                          </div>
                          <div className="flex space-x-1 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(word)}
                              disabled={editingId === word.id || submitting}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(word.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              disabled={submitting}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AddEditWordsPage 