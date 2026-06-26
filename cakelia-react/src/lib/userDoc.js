import {
  doc, getDoc, setDoc, updateDoc,
  collection, getDocs, deleteDoc, serverTimestamp,
} from 'firebase/firestore'
import { deleteUser } from 'firebase/auth'
import { db } from './firebase'

export async function ensureUserDoc(user) {
  const ref  = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  if (snap.exists()) return

  await setDoc(ref, {
    email:       user.email       ?? '',
    displayName: user.displayName ?? '',
    timezone:    Intl.DateTimeFormat().resolvedOptions().timeZone,
    createdAt:   serverTimestamp(),
  })
}

export async function getUserDoc(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function updateUserTimezone(uid, timezone) {
  await updateDoc(doc(db, 'users', uid), { timezone })
}

/**
 * Deletes all of a user's Firestore data then their Auth account.
 * Throws auth/requires-recent-login if the session is too old.
 */
export async function deleteUserAccount(user) {
  // 1. Delete friends subcollection
  const friendsSnap = await getDocs(collection(db, 'users', user.uid, 'friends'))
  await Promise.all(friendsSnap.docs.map(d => deleteDoc(d.ref)))

  // 2. Delete user profile doc
  await deleteDoc(doc(db, 'users', user.uid))

  // 3. Delete Firebase Auth account (requires recent login)
  await deleteUser(user)
}
