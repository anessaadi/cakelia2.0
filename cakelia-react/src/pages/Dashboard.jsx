import { useEffect, useState } from 'react'
import Header from '../components/Header'
import { useAuth } from '../lib/AuthContext'
import { getUserDoc } from '../lib/userDoc'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { user, logOut } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    if (user) {
      getUserDoc(user.uid).then(setProfile).catch(console.error)
    }
  }, [user])

  async function handleLogout() {
    await logOut()
    navigate('/')
  }

  return (
    <>
      <Header />
      <div className="auth-form" style={{ textAlign: 'center' }}>
        <h1>Dashboard</h1>
        <p style={{ color: '#290132', marginBottom: '1em', wordBreak: 'break-all' }}>
          Welcome, <strong>{user?.email}</strong>
        </p>
        {profile && (
          <p style={{ color: '#555', marginBottom: '2em', fontSize: '0.9rem' }}>
            Timezone: {profile.timezone}
          </p>
        )}
        {/* Phase 3 will add the birthday reminders table here */}
        <button className="btn-contact" onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </>
  )
}
