import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

/**
 * Creates the users/{uid} document on first login.
 * Subsequent calls are no-ops (the document already exists).
 * Timezone is captured once from the browser and never overwritten
 * automatically — the user can change it from the dashboard.
 */
export async function ensureUserDoc(user) {
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  if (snap.exists()) return

  await setDoc(ref, {
    email: user.email ?? '',
    displayName: user.displayName ?? '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    createdAt: serverTimestamp(),
  })
}

/**
 * Fetches the users/{uid} doc. Returns null if it doesn't exist yet.
 */
export async function getUserDoc(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

/**
 * Overwrites only the timezone field. Used by the dashboard timezone picker.
 */
export async function updateUserTimezone(uid, timezone) {
  const { updateDoc } = await import('firebase/firestore')
  await updateDoc(doc(db, 'users', uid), { timezone })
}
