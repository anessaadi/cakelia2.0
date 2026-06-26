import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export default function Header() {
  const [open, setOpen] = useState(false)
  const { user, logOut } = useAuth()
  const navigate = useNavigate()

  function toggle() { setOpen(prev => !prev) }
  function close()  { setOpen(false) }

  async function handleLogout() {
    close()
    await logOut()
    navigate('/')
  }

  return (
    <header>
      <Link to="/" className="logo" onClick={close}>
        <img src="/img/ka3ka.png" alt="Cakelia" />
      </Link>

      <ul className={`navlist${open ? ' open' : ''}`}>
        <li><Link to="/"        onClick={close}>Home</Link></li>
        <li><Link to="/blogs"   onClick={close}>Blog</Link></li>
        <li><Link to="/contact" onClick={close}>Contact</Link></li>
        <li><Link to="/about"   onClick={close}>About</Link></li>
        {user ? (
          <>
            <li><Link to="/dashboard" onClick={close} className="nav-user-link">{user.email}</Link></li>
            <li><button className="nav-logout-btn" onClick={handleLogout}>Logout</button></li>
          </>
        ) : (
          <li><Link to="/login" onClick={close}>Login</Link></li>
        )}
      </ul>

      <div
        className={`bx ${open ? 'bx-x' : 'bx-menu'}`}
        id="menu-icon"
        onClick={toggle}
      />
    </header>
  )
}
