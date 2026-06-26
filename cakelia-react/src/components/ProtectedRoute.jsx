import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8em', color: '#290132' }}>
      Loading…
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  return children
}
