import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, User } from 'firebase/auth'

// Validate environment variables
const requiredEnvVars = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
    .filter(([, value]) => !value)
    .map(([key]) => key)

if (missingVars.length > 0) {
    console.error('Missing Firebase environment variables:', missingVars)
    throw new Error(`Missing Firebase environment variables: ${missingVars.join(', ')}`)
}

// Debug: Log the configuration (remove in production)
console.log('Firebase config loaded:', {
    apiKey: requiredEnvVars.apiKey ? '✓' : '✗',
    authDomain: requiredEnvVars.authDomain ? '✓' : '✗',
    projectId: requiredEnvVars.projectId ? '✓' : '✗',
    storageBucket: requiredEnvVars.storageBucket ? '✓' : '✗',
    messagingSenderId: requiredEnvVars.messagingSenderId ? '✓' : '✗',
    appId: requiredEnvVars.appId ? '✓' : '✗',
    measurementId: requiredEnvVars.measurementId ? '✓' : '✗'
})

const firebaseConfig = {
    apiKey: requiredEnvVars.apiKey,
    authDomain: requiredEnvVars.authDomain,
    projectId: requiredEnvVars.projectId,
    storageBucket: requiredEnvVars.storageBucket,
    messagingSenderId: requiredEnvVars.messagingSenderId,
    appId: requiredEnvVars.appId,
    measurementId: requiredEnvVars.measurementId
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

// Export auth functions
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider)
export const signOut = () => firebaseSignOut(auth)
export const onAuthStateChange = (callback: (user: User | null) => void) => onAuthStateChanged(auth, callback)

export default app 