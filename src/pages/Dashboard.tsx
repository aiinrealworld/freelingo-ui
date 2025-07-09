import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { useEffect, useState } from 'react'
import { api, type UserProgress, type Word } from '../lib/api'

function Dashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [progressLoading, setProgressLoading] = useState(true)
  const [progressError, setProgressError] = useState<string | null>(null)
  
  // New state for enhanced dashboard
  const [recentWords, setRecentWords] = useState<Word[]>([])
  const [allWords, setAllWords] = useState<Word[]>([])
  const [wordsLoading, setWordsLoading] = useState(true)
  const [wordsError, setWordsError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.uid) return
      
      setProgressLoading(true)
      setWordsLoading(true)
      setProgressError(null)
      setWordsError(null)
      
      try {
        // Fetch all data in parallel
        const [progressData, userWords] = await Promise.all([
          api.getUserProgress(user.uid),
          api.getUserWords(user.uid)
        ])
        
        setProgress(progressData)
        setAllWords(userWords)
        setRecentWords(userWords.slice(0, 5)) // Get 5 most recent words
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
        setProgressError('Failed to load progress.')
        setWordsError('Failed to load words.')
      } finally {
        setProgressLoading(false)
        setWordsLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [user?.uid])



  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const handleAddWord = async (word: string, translation: string, example?: string) => {
    if (!user?.uid) return
    
    try {
      await api.createWord({ word, translation, example }, user.uid)
      // Refresh the words list
      const updatedWords = await api.getUserWords(user.uid)
      setAllWords(updatedWords)
      setRecentWords(updatedWords.slice(0, 5))
    } catch (error) {
      console.error('Failed to add word:', error)
      // You could add a toast notification here
    }
  }

  const navigationCards = [
    {
      title: 'New Words',
      description: 'Learn new vocabulary with interactive cards',
      path: '/new-words',
      icon: '📚',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Dialogue',
      description: 'Practice conversation with AI tutor',
      path: '/dialogue',
      icon: '💬',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Vocabulary',
      description: 'Manage your vocabulary list',
      path: '/words',
      icon: '✏️',
      color: 'from-purple-500 to-purple-600'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">FreeLingo</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img 
                  src={user?.photoURL || 'https://via.placeholder.com/32'} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium text-gray-700">{user?.displayName}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.displayName?.split(' ')[0]}! 👋
          </h2>
          <p className="text-lg text-gray-600">
            Ready to continue your language learning journey?
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {navigationCards.map((card) => (
            <Card 
              key={card.path}
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={() => navigate(card.path)}
            >
              <CardHeader>
                <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-lg flex items-center justify-center text-2xl mb-4`}>
                  {card.icon}
                </div>
                <CardTitle className="text-xl">{card.title}</CardTitle>
                <CardDescription className="text-base">
                  {card.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Vocabulary</p>
                  {wordsLoading ? (
                    <span className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin inline-block"></span>
                  ) : wordsError ? (
                    <span className="text-red-500 text-sm">--</span>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{allWords.length}</p>
                  )}
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-xl">🎯</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Dialogue Sessions</p>
                  {progressLoading ? (
                    <span className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin inline-block"></span>
                  ) : progressError ? (
                    <span className="text-red-500 text-sm">--</span>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{progress?.dialogue_sessions ?? 0}</p>
                  )}
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 text-xl">💬</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Words */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>📝</span>
                <span>Recent Words</span>
              </CardTitle>
              <CardDescription>
                Your recently added vocabulary
              </CardDescription>
            </CardHeader>
            <CardContent>
              {wordsLoading ? (
                <div className="flex justify-center py-8">
                  <span className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                </div>
              ) : wordsError ? (
                <div className="text-center py-8 text-red-500">
                  Failed to load recent words
                </div>
              ) : recentWords.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-2">No words added yet</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/new-words')}
                  >
                    Start Learning
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                                     {recentWords.map((word) => (
                     <div key={word.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                       <div>
                         <p className="font-medium text-gray-900">{word.word}</p>
                         <p className="text-sm text-gray-600">{word.translation}</p>
                         {word.example && (
                           <p className="text-xs text-gray-500 italic mt-1">"{word.example}"</p>
                         )}
                       </div>
                       <div className="flex items-center space-x-2">
                         {word.learned && (
                           <span className="text-green-600 text-sm">✅ Learned</span>
                         )}
                         <Button 
                           variant="ghost" 
                           size="sm"
                           onClick={() => navigate(`/words?edit=${word.id}`)}
                         >
                           Edit
                         </Button>
                       </div>
                     </div>
                   ))}
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate('/words')}
                    >
                      View All Words
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Learning Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>📊</span>
                <span>Learning Progress</span>
              </CardTitle>
              <CardDescription>
                Your learning statistics and achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {progressLoading ? (
                <div className="flex justify-center py-8">
                  <span className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                </div>
              ) : progressError ? (
                <div className="text-center py-8 text-red-500">
                  Failed to load progress
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Progress Bars */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Learning Progress</span>
                      <span>{progress?.learned_words ?? 0} / {progress?.total_words ?? 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${progress?.total_words ? (progress.learned_words / progress.total_words) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Streak */}
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Current Streak</p>
                      <p className="text-sm text-gray-600">Keep it going!</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{progress?.streak_days ?? 0}</p>
                      <p className="text-xs text-gray-500">days</p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-2">
                    <Button 
                      className="w-full" 
                      onClick={() => navigate('/dialogue')}
                    >
                      Start Dialogue Session
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate('/new-words')}
                    >
                      Learn New Words
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default Dashboard 