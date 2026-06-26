import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import Header from '../components/Header'
import FriendForm from '../components/FriendForm'
import { useAuth } from '../lib/AuthContext'
import { useNoIndex } from '../lib/useNoIndex'
import { getUserDoc, updateUserTimezone, deleteUserAccount } from '../lib/userDoc'
import { subscribeToFriends, addFriend, updateFriend, deleteFriend } from '../lib/friends'
import { db } from '../lib/firebase'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

function formatDate(ts) {
  if (!ts) return '—'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function Dashboard() {
  useNoIndex()
  const { user }                    = useAuth()
  const navigate                    = useNavigate()
  const [profile,   setProfile]     = useState(null)
  const [friends,   setFriends]     = useState([])
  const [messages,  setMessages]    = useState([])
  const [showAdd,   setShowAdd]     = useState(false)
  const [editId,    setEditId]      = useState(null)
  const [deleteId,  setDeleteId]    = useState(null)
  const [tzEdit,    setTzEdit]      = useState(false)
  const [tzValue,   setTzValue]     = useState('')
  const [tzSaving,  setTzSaving]    = useState(false)
  const [error,     setError]       = useState('')
  const [activeTab,    setActiveTab]    = useState('birthdays')
  const [deleteAcct,   setDeleteAcct]   = useState(false)
  const [deletingAcct, setDeletingAcct] = useState(false)

  useEffect(() => {
    if (user) getUserDoc(user.uid).then(setProfile).catch(console.error)
  }, [user])

  useEffect(() => {
    if (!user) return
    return subscribeToFriends(user.uid, setFriends)
  }, [user])

  // Only subscribe to contact messages if the user is admin
  useEffect(() => {
    if (!profile?.isAdmin) return
    const q = query(collection(db, 'contact_messages'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap =>
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )
  }, [profile?.isAdmin])

  async function handleAdd(data) {
    setError('')
    try {
      await addFriend(user.uid, data)
      setShowAdd(false)
    } catch (e) { setError(e.message) }
  }

  async function handleEdit(data) {
    setError('')
    try {
      await updateFriend(user.uid, editId, data)
      setEditId(null)
    } catch (e) { setError(e.message) }
  }

  async function handleDelete(fid) {
    setError('')
    try {
      await deleteFriend(user.uid, fid)
      setDeleteId(null)
    } catch (e) { setError(e.message) }
  }

  function startTzEdit() {
    setTzValue(profile?.timezone ?? '')
    setTzEdit(true)
  }

  async function saveTz() {
    if (!tzValue.trim()) return
    setTzSaving(true)
    try {
      await updateUserTimezone(user.uid, tzValue.trim())
      setProfile(p => ({ ...p, timezone: tzValue.trim() }))
      setTzEdit(false)
    } catch (e) { setError(e.message) }
    setTzSaving(false)
  }

  async function handleDeleteAccount() {
    setDeletingAcct(true)
    setError('')
    try {
      await deleteUserAccount(user)
      navigate('/')
    } catch (e) {
      if (e.code === 'auth/requires-recent-login') {
        setError('For security, please log out and log back in before deleting your account.')
      } else {
        setError(e.message)
      }
      setDeletingAcct(false)
      setDeleteAcct(false)
    }
  }

  return (
    <>
      <Header />
      <main className="dashboard">

        <div className="dashboard-header">
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-email">{user?.email}</p>
          <div className="dashboard-tz">
            <span>Timezone: </span>
            {tzEdit ? (
              <>
                <input
                  className="input-contact tz-input"
                  value={tzValue}
                  onChange={e => setTzValue(e.target.value)}
                  placeholder="e.g. Europe/Paris"
                />
                <button className="tz-btn" onClick={saveTz} disabled={tzSaving}>
                  {tzSaving ? '…' : 'Save'}
                </button>
                <button className="tz-btn" onClick={() => setTzEdit(false)}>Cancel</button>
              </>
            ) : (
              <>
                <strong>{profile?.timezone ?? '—'}</strong>
                <button className="tz-btn" onClick={startTzEdit}>change</button>
              </>
            )}
          </div>
        </div>

        {/* Tabs — Messages tab only visible to admins */}
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
              <p className="dashboard-empty">No birthdays saved yet — add your first one!</p>
            )}

            <ul className="friend-list">
              {friends.map(f => (
                <li key={f.id} className="friend-card">
                  {editId === f.id ? (
                    <>
                      <h3 className="friend-form-title">Edit birthday</h3>
                      <FriendForm
                        initial={f}
                        onSave={handleEdit}
                        onCancel={() => setEditId(null)}
                      />
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
              <p className="dashboard-empty">No contact messages yet.</p>
            ) : (
              <div className="msg-table-wrap">
                <table className="msg-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map(m => (
                      <tr key={m.id}>
                        <td className="msg-date">{formatDate(m.createdAt)}</td>
                        <td className="msg-name">{m.name}</td>
                        <td className="msg-email">
                          <a href={`mailto:${m.email}`}>{m.email}</a>
                        </td>
                        <td className="msg-body">{m.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── Danger zone ── */}
        <div className="danger-zone">
          <h3 className="danger-zone-title">Danger zone</h3>
          {deleteAcct ? (
            <div className="danger-confirm">
              <p>This will permanently delete your account, all your birthday reminders, and cannot be undone.</p>
              <div className="friend-form-actions">
                <button
                  className="btn-contact btn-danger"
                  onClick={handleDeleteAccount}
                  disabled={deletingAcct}
                >
                  {deletingAcct ? 'Deleting…' : 'Yes, delete everything'}
                </button>
                <button
                  className="btn-contact btn-secondary"
                  onClick={() => setDeleteAcct(false)}
                  disabled={deletingAcct}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              className="btn-contact btn-danger"
              onClick={() => setDeleteAcct(true)}
            >
              Delete my account
            </button>
          )}
        </div>

      </main>
    </>
  )
}
