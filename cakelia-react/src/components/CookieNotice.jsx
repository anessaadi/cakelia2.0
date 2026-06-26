import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const KEY = 'cakelia_cookie_consent'

export default function CookieNotice() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(KEY)) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem(KEY, 'accepted')
    setVisible(false)
  }

  function decline() {
    localStorage.setItem(KEY, 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="cookie-notice" role="dialog" aria-label="Cookie consent">
      <p className="cookie-text">
        We use cookies for login sessions and anonymous analytics (Google Analytics).{' '}
        <Link to="/privacy">Privacy policy</Link>
      </p>
      <div className="cookie-actions">
        <button className="btn-contact cookie-accept" onClick={accept}>Accept</button>
        <button className="cookie-decline" onClick={decline}>Decline</button>
      </div>
    </div>
  )
}
