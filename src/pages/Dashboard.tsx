import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { useEffect, useState } from 'react'
import { api, type Word, getDialogueSessions, getDialogueSession, type SessionSummary } from '../lib/api'
import { Link } from 'react-router-dom'

function Dashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  
  // New state for enhanced dashboard
  const [recentWords, setRecentWords] = useState<Word[]>([])
  const [allWords, setAllWords] = useState<Word[]>([])
  const [wordsLoading, setWordsLoading] = useState(true)
  const [wordsError, setWordsError] = useState<string | null>(null)
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [messageCounts, setMessageCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.uid) return
      setWordsLoading(true)
      setWordsError(null)
      try {
        // Only fetch user words
        const userWords = await api.getUserWords(user.uid)
        setAllWords(userWords)
        setRecentWords(userWords.slice(0, 5)) // Get 5 most recent words
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
        setWordsError('Failed to load words.')
      } finally {
        setWordsLoading(false)
      }
    }
    fetchDashboardData()
  }, [user?.uid])

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user?.uid) return;
      setSessionsLoading(true);
      setSessionsError(null);
      try {
        const data = await getDialogueSessions(user.uid);
        setSessions(data);
        
        // Fetch accurate message counts for each session
        const counts: Record<string, number> = {};
        for (const session of data) {
          try {
            const fullSession = await getDialogueSession(session.session_id);
            if (fullSession.messages?.transcript) {
              counts[session.session_id] = fullSession.messages.transcript.length * 2; // Each entry has AI + user message
            } else {
              counts[session.session_id] = session.message_count; // Fallback to backend count
            }
          } catch (err) {
            console.error(`Failed to fetch session ${session.session_id}:`, err);
            counts[session.session_id] = session.message_count; // Fallback to backend count
          }
        }
        setMessageCounts(counts);
      } catch (err) {
        setSessionsError('Failed to load dialogue sessions.');
      } finally {
        setSessionsLoading(false);
      }
    };
    fetchSessions();
  }, [user?.uid]);


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

        {/* Vocabulary and Dialogue Sessions Count */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
            <div>
              <div className="text-gray-500 text-sm mb-1">Vocabulary</div>
              <div className="text-3xl font-bold">{allWords.length}</div>
            </div>
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
              <span className="text-pink-600 text-2xl">🎯</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
            <div>
              <div className="text-gray-500 text-sm mb-1">Dialogue Sessions</div>
              <div className="text-3xl font-bold">{sessions.length}</div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-2xl">💬</span>
            </div>
          </div>
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

          {/* Recent Dialogue Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>💬</span>
                <span>Recent Dialogue Sessions</span>
              </CardTitle>
              <CardDescription>
                Your recent AI dialogue sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessionsLoading ? (
                <div className="text-gray-600">Loading...</div>
              ) : sessionsError ? (
                <div className="text-red-500">{sessionsError}</div>
              ) : sessions.length === 0 ? (
                <div className="text-gray-600">No dialogue sessions found.</div>
              ) : (
                <ul className="divide-y divide-gray-200 bg-white rounded-lg shadow">
                  {sessions.slice(0, 5).map(session => (
                    <li key={session.session_id} className="p-4 hover:bg-blue-50 transition">
                      <Link to={`/dialogue-session/${session.session_id}`} className="block">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-blue-700">Session {session.session_id.slice(-6)}</span>
                          <span className="text-sm text-gray-500">{new Date(session.started_at).toLocaleString()}</span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {messageCounts[session.session_id] || session.message_count} messages
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Removed Learning Progress section */}
        </div>
      </main>
    </div>
  )
}

export default Dashboard 