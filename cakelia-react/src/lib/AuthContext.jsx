import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from './firebase'
import { ensureUserDoc } from './userDoc'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [avatarUrl, setAvatarUrl] = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      if (u) {
        ensureUserDoc(u).catch(err => console.error('ensureUserDoc:', err))
        setAvatarUrl(u.photoURL || null)
      } else {
        setAvatarUrl(null)
      }
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  const signUp           = (email, pw) => createUserWithEmailAndPassword(auth, email, pw)
  const signIn           = (email, pw) => signInWithEmailAndPassword(auth, email, pw)
  const signInWithGoogle = ()          => signInWithPopup(auth, new GoogleAuthProvider())
  const logOut           = ()          => signOut(auth)

  return (
    <AuthContext.Provider value={{
      user, loading, avatarUrl, setAvatarUrl,
      signUp, signIn, signInWithGoogle, logOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
