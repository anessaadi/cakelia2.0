import { useEffect, useState, useRef } from 'react'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { updateProfile } from 'firebase/auth'
import Header from '../components/Header'
import FriendForm from '../components/FriendForm'
import { useAuth } from '../lib/AuthContext'
import { useNoIndex } from '../lib/useNoIndex'
import { getUserDoc, updateUserTimezone } from '../lib/userDoc'
import { subscribeToFriends, addFriend, updateFriend, deleteFriend } from '../lib/friends'
import { db, storage, auth } from '../lib/firebase'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

const TIMEZONES = (() => {
  try { return Intl.supportedValuesOf('timeZone') }
  catch { return ['UTC'] }
})()

const LOCAL_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone

function formatDate(ts) {
  if (!ts) return '—'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function Dashboard() {
  useNoIndex()
  const { user, avatarUrl, setAvatarUrl } = useAuth()
  const fileInputRef                      = useRef(null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoError,     setPhotoError]     = useState('')
  const [profile,   setProfile]   = useState(null)
  const [friends,   setFriends]   = useState([])
  const [messages,  setMessages]  = useState([])
  const [showAdd,   setShowAdd]   = useState(false)
  const [editId,    setEditId]    = useState(null)
  const [deleteId,  setDeleteId]  = useState(null)
  const [tzValue,   setTzValue]   = useState(LOCAL_TZ)
  const [tzSaving,  setTzSaving]  = useState(false)
  const [tzSaved,   setTzSaved]   = useState(false)
  const [error,     setError]     = useState('')
  const [activeTab, setActiveTab] = useState('birthdays')

  useEffect(() => {
    if (user) getUserDoc(user.uid).then(setProfile).catch(console.error)
  }, [user])

  useEffect(() => {
    if (profile?.timezone) setTzValue(profile.timezone)
  }, [profile?.timezone])

  useEffect(() => {
    if (!user) return
    return subscribeToFriends(user.uid, setFriends)
  }, [user])

  useEffect(() => {
    if (!profile?.isAdmin) return
    const q = query(collection(db, 'contact_messages'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap =>
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )
  }, [profile?.isAdmin])

  async function handleAdd(data) {
    setError('')
    try { await addFriend(user.uid, data); setShowAdd(false) }
    catch (e) { setError(e.message) }
  }

  async function handleEdit(data) {
    setError('')
    try { await updateFriend(user.uid, editId, data); setEditId(null) }
    catch (e) { setError(e.message) }
  }

  async function handleDelete(fid) {
    setError('')
    try { await deleteFriend(user.uid, fid); setDeleteId(null) }
    catch (e) { setError(e.message) }
  }

  async function handleTzChange(e) {
    const tz = e.target.value
    setTzValue(tz)
    setTzSaving(true)
    setTzSaved(false)
    try {
      await updateUserTimezone(user.uid, tz)
      setProfile(p => ({ ...p, timezone: tz }))
      setTzSaved(true)
      setTimeout(() => setTzSaved(false), 2000)
    } catch (err) { setError(err.message) }
    setTzSaving(false)
  }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return setPhotoError('Please select an image file.')
    if (file.size > 2 * 1024 * 1024)    return setPhotoError('Image must be under 2 MB.')
    setPhotoUploading(true)
    setPhotoError('')
    try {
      const storageRef = ref(storage, `profile-photos/${user.uid}`)
      const task       = uploadBytesResumable(storageRef, file)
      await new Promise((resolve, reject) => { task.on('state_changed', null, reject, resolve) })
      const url = await getDownloadURL(storageRef)
      await updateProfile(auth.currentUser, { photoURL: url })
      setAvatarUrl(url)
    } catch (e) {
      setPhotoError('Upload failed. Please try again.')
      console.error(e)
    }
    setPhotoUploading(false)
    e.target.value = ''
  }

  return (
    <>
      <Header />
      <main className="dashboard">

        {/* ── Profile card ── */}
        <div className="dash-profile-card">
          <div className="dash-profile-avatar-col">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoChange}
            />
            <button
              className="profile-avatar"
              onClick={() => fileInputRef.current?.click()}
              disabled={photoUploading}
              aria-label="Change profile photo"
            >
              {avatarUrl
                ? <img src={avatarUrl} alt="Profile" />
                : <span className="profile-avatar-initials">{(user?.email || '?')[0].toUpperCase()}</span>
              }
              <span className="profile-avatar-overlay">
                {photoUploading ? '…' : 'Change'}
              </span>
            </button>
            {photoError && <p className="photo-error-msg">{photoError}</p>}
          </div>

          <div className="dash-profile-info">
            <p className="dash-profile-label">My Account</p>
            {user?.displayName && <p className="dash-profile-name">{user.displayName}</p>}
            <p className="dash-profile-email">{user?.email}</p>
            <div className="dash-profile-tz">
              <span className="tz-label-text">Timezone</span>
              <select
                className="tz-select"
                value={tzValue}
                onChange={handleTzChange}
                disabled={tzSaving}
              >
                {TIMEZONES.map(tz => (
                  <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
                ))}
              </select>
              {tzSaving && <span className="tz-status">Saving…</span>}
              {tzSaved  && <span className="tz-status tz-status--saved">Saved</span>}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="dash-tabs">
          <button
            className={`dash-tab${activeTab === 'birthdays' ? ' dash-tab--active' : ''}`}
            onClick={() => setActiveTab('birthdays')}
          >
            Birthday Reminders
          </button>
          {profile?.isAdmin && (
            <button
              className={`dash-tab${activeTab === 'messages' ? ' dash-tab--active' : ''}`}
              onClick={() => setActiveTab('messages')}
            >
              Messages {messages.length > 0 && <span className="dash-badge">{messages.length}</span>}
            </button>
          )}
        </div>

        {error && <p className="auth-error" style={{ marginBottom: '1em' }}>{error}</p>}

        {/* ── Birthday reminders tab ── */}
        {activeTab === 'birthdays' && (
          <>
            {!showAdd && !editId && (
              <button
                className="btn-contact add-friend-btn"
                onClick={() => { setShowAdd(true); setEditId(null) }}
              >
                + Add birthday
              </button>
            )}

            {showAdd && (
              <div className="friend-card friend-card--form">
                <h3 className="friend-form-title">New birthday</h3>
                <FriendForm onSave={handleAdd} onCancel={() => setShowAdd(false)} />
              </div>
            )}

            {friends.length === 0 && !showAdd && (
              <div className="dash-empty-state">
                <p className="dash-empty-title">No birthdays saved yet</p>
                <p className="dash-empty-sub">Add your first one to start getting email reminders</p>
              </div>
            )}

            <ul className="friend-list">
              {friends.map(f => (
                <li key={f.id} className="friend-card">
                  {editId === f.id ? (
                    <>
                      <h3 className="friend-form-title">Edit birthday</h3>
                      <FriendForm initial={f} onSave={handleEdit} onCancel={() => setEditId(null)} />
                    </>
                  ) : deleteId === f.id ? (
                    <div className="friend-delete-confirm">
                      <p>Delete <strong>{f.name}</strong>'s birthday?</p>
                      <div className="friend-form-actions">
                        <button className="btn-contact btn-danger" onClick={() => handleDelete(f.id)}>Delete</button>
                        <button className="btn-contact btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="friend-row">
                      <div className="friend-info">
                        <span className="friend-name">{f.name}</span>
                        <span className="friend-bday">
                          {MONTHS[f.birthMonth - 1]} {f.birthDay}
                          {f.birthYear ? ` · ${f.birthYear}` : ''}
                        </span>
                        <span className="friend-email">{f.notifyEmail}</span>
                        <span className="friend-remind">
                          {[
                            f.remind?.threeDays && '3 days before',
                            f.remind?.oneDay    && '1 day before',
                            f.remind?.dayOf     && 'day of',
                          ].filter(Boolean).join(' · ') || 'No reminders set'}
                        </span>
                      </div>
                      <div className="friend-actions">
                        <button className="tz-btn" onClick={() => { setEditId(f.id); setShowAdd(false); setDeleteId(null) }}>Edit</button>
                        <button className="tz-btn btn-danger-text" onClick={() => { setDeleteId(f.id); setEditId(null) }}>Delete</button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}

        {/* ── Messages tab (admin only) ── */}
        {activeTab === 'messages' && profile?.isAdmin && (
          <>
            {messages.length === 0 ? (
              <div className="dash-empty-state">
                <p className="dash-empty-title">No contact messages yet</p>
              </div>
            ) : (
              <div className="msg-table-wrap">
                <table className="msg-table">
                  <thead>
                    <tr>
                      <th>Date</th><th>Name</th><th>Email</th><th>Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map(m => (
                      <tr key={m.id}>
                        <td className="msg-date">{formatDate(m.createdAt)}</td>
                        <td className="msg-name">{m.name}</td>
                        <td className="msg-email"><a href={`mailto:${m.email}`}>{m.email}</a></td>
                        <td className="msg-body">{m.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

      </main>
    </>
  )
}
