import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User as FirebaseUser } from 'firebase/auth'
import { signInWithGoogle, signOut, onAuthStateChange } from '../lib/firebase'

interface User {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Convert Firebase user to our User interface
  const convertFirebaseUser = (firebaseUser: FirebaseUser | null): User | null => {
    if (!firebaseUser) return null
    
    const user = {
      uid: firebaseUser.uid,
      displayName: firebaseUser.displayName,
      email: firebaseUser.email,
      photoURL: firebaseUser.photoURL
    }
    
    // Log user_id (Firebase UID) to console
    console.log('User ID (Firebase UID):', user.uid)
    console.log('User details:', user)
    
    return user
  }

  // Handle Google sign in
  const handleSignInWithGoogle = async () => {
    try {
      setLoading(true)
      await signInWithGoogle()
      // User will be set via onAuthStateChanged
    } catch (error) {
      console.error('Sign in error:', error)
      setLoading(false)
      throw error
    }
  }

  // Handle sign out
  const handleSignOut = async () => {
    try {
      setLoading(true)
      await signOut()
      // User will be cleared via onAuthStateChanged
    } catch (error) {
      console.error('Sign out error:', error)
      setLoading(false)
      throw error
    }
  }

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChange((firebaseUser) => {
      const user = convertFirebaseUser(firebaseUser)
      setUser(user)
      setLoading(false)
    })

    // Cleanup subscription
    return () => unsubscribe()
  }, [])

  const value = {
    user,
    loading,
    signInWithGoogle: handleSignInWithGoogle,
    signOut: handleSignOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 