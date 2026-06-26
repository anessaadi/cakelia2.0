import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, serverTimestamp, query, orderBy,
} from 'firebase/firestore'
import { db } from './firebase'

const col = uid => collection(db, 'users', uid, 'friends')

export function subscribeToFriends(uid, cb) {
  const q = query(col(uid), orderBy('createdAt', 'asc'))
  return onSnapshot(q, snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

export const addFriend = (uid, data) =>
  addDoc(col(uid), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })

export const updateFriend = (uid, fid, data) =>
  updateDoc(doc(db, 'users', uid, 'friends', fid), { ...data, updatedAt: serverTimestamp() })

export const deleteFriend = (uid, fid) =>
  deleteDoc(doc(db, 'users', uid, 'friends', fid))
