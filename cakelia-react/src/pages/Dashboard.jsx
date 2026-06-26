import { useEffect, useState } from 'react'
import Header from '../components/Header'
import FriendForm from '../components/FriendForm'
import { useAuth } from '../lib/AuthContext'
import { getUserDoc, updateUserTimezone } from '../lib/userDoc'
import { subscribeToFriends, addFriend, updateFriend, deleteFriend } from '../lib/friends'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

export default function Dashboard() {
  const { user }                    = useAuth()
  const [profile,  setProfile]      = useState(null)
  const [friends,  setFriends]      = useState([])
  const [showAdd,  setShowAdd]      = useState(false)
  const [editId,   setEditId]       = useState(null)
  const [deleteId, setDeleteId]     = useState(null)
  const [tzEdit,   setTzEdit]       = useState(false)
  const [tzValue,  setTzValue]      = useState('')
  const [tzSaving, setTzSaving]     = useState(false)
  const [error,    setError]        = useState('')

  useEffect(() => {
    if (user) getUserDoc(user.uid).then(setProfile).catch(console.error)
  }, [user])

  useEffect(() => {
    if (!user) return
    return subscribeToFriends(user.uid, setFriends)
  }, [user])

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

  return (
    <>
      <Header />
      <main className="dashboard">

        <div className="dashboard-header">
          <h1 className="dashboard-title">Birthday Reminders</h1>
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

        {error && <p className="auth-error" style={{ marginBottom: '1em' }}>{error}</p>}

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
                    <button
                      className="btn-contact btn-danger"
                      onClick={() => handleDelete(f.id)}
                    >
                      Delete
                    </button>
                    <button
                      className="btn-contact btn-secondary"
                      onClick={() => setDeleteId(null)}
                    >
                      Cancel
                    </button>
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
                    <button
                      className="tz-btn"
                      onClick={() => { setEditId(f.id); setShowAdd(false); setDeleteId(null) }}
                    >
                      Edit
                    </button>
                    <button
                      className="tz-btn btn-danger-text"
                      onClick={() => { setDeleteId(f.id); setEditId(null) }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </main>
    </>
  )
}
