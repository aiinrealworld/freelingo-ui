import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDialogueSession, DialogueSession } from '../lib/api';
import { Button } from '../components/ui/button';

function DialogueSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<DialogueSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getDialogueSession(sessionId);
        setSession(data);
      } catch (err) {
        setError('Failed to load session.');
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  return (
    <div className="min-h-screen flex flex-col bg-blue-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </Button>
          <h1 className="ml-4 text-xl font-bold text-gray-900">Dialogue Session</h1>
        </div>
      </header>
      <main className="flex-1 max-w-4xl mx-auto w-full p-4">
        {loading ? (
          <div className="text-center text-gray-600 mt-8">Loading session...</div>
        ) : error ? (
          <div className="text-center text-red-500 mt-8">{error}</div>
        ) : session ? (
          <>
            <div className="mb-4 text-gray-700 text-sm">
              <span className="font-medium">Session ID:</span> {session.session_id}<br />
              <span className="font-medium">Started:</span> {new Date(session.started_at).toLocaleString()}<br />
              <span className="font-medium">Ended:</span> {new Date(session.ended_at).toLocaleString()}<br />
              <span className="font-medium">Messages:</span> {session.messages.length}
            </div>
            <div className="bg-white rounded-lg shadow p-4 space-y-4">
              {session.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-xs mt-1 ${
                      msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}

export default DialogueSessionPage; 