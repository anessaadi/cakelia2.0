import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { deleteUserAccount } from '../lib/userDoc'
import { auth } from '../lib/firebase'

function Avatar({ url, email, size = 36 }) {
  if (url) {
    return (
      <img
        src={url}
        alt="Profile"
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
      />
    )
  }
  return (
    <span
      className="nav-avatar-initials"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {(email || '?')[0].toUpperCase()}
    </span>
  )
}

export default function Header() {
  const [menuOpen,      setMenuOpen]      = useState(false)
  const [dropdownOpen,  setDropdownOpen]  = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting,      setDeleting]      = useState(false)
  const [deleteError,   setDeleteError]   = useState('')
  const { user, avatarUrl, logOut }       = useAuth()
  const navigate                          = useNavigate()
  const avatarRef                         = useRef(null)

  useEffect(() => {
    if (!dropdownOpen) return
    function onClickOutside(e) {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setDropdownOpen(false)
        setDeleteConfirm(false)
        setDeleteError('')
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [dropdownOpen])

  function closeMenu() { setMenuOpen(false) }

  function openDropdown() {
    setDropdownOpen(o => !o)
    setDeleteConfirm(false)
    setDeleteError('')
  }

  async function handleLogout() {
    setDropdownOpen(false)
    closeMenu()
    await logOut()
    navigate('/')
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    setDeleteError('')
    try {
      await deleteUserAccount(user)
      navigate('/')
    } catch (e) {
      setDeleteError(
        e.code === 'auth/requires-recent-login'
          ? 'Please log out and log back in first.'
          : e.message
      )
      setDeleting(false)
    }
  }

  return (
    <header>
      <Link to="/" className="logo" onClick={closeMenu}>
        <img src="/img/ka3ka.png" alt="Cakelia" />
      </Link>

      <ul className={`navlist${menuOpen ? ' open' : ''}`}>
        <li><Link to="/"        onClick={closeMenu}>Home</Link></li>
        <li><Link to="/blogs"   onClick={closeMenu}>Blog</Link></li>
        <li><Link to="/contact" onClick={closeMenu}>Contact</Link></li>
        <li><Link to="/about"   onClick={closeMenu}>About</Link></li>
        <li>
          <Link
            to={user ? '/dashboard' : '/signup'}
            className="nav-cta"
            onClick={closeMenu}
          >
            Birthday Reminders
          </Link>
        </li>

        {user ? (
          <>
            <li className="nav-mobile-only">
              <Link to="/dashboard" onClick={closeMenu}>Dashboard</Link>
            </li>
            <li className="nav-mobile-only">
              <button className="nav-logout-btn" onClick={handleLogout}>Logout</button>
            </li>
          </>
        ) : (
          <li className="nav-mobile-only">
            <Link to="/login" onClick={closeMenu}>Login</Link>
          </li>
        )}
      </ul>

      <div className="nav-auth-desktop">
        {user ? (
          <div className="nav-avatar-wrap" ref={avatarRef}>
            <button
              className="nav-avatar-btn"
              onClick={openDropdown}
              aria-label="Account menu"
              aria-expanded={dropdownOpen}
            >
              <Avatar url={avatarUrl} email={user.email} size={36} />
            </button>

            {dropdownOpen && (
              <div className="nav-dropdown">
                {deleteConfirm ? (
                  <div className="nav-dropdown-confirm">
                    <p className="nav-dropdown-confirm-msg">
                      This permanently deletes your account and all birthday data.
                    </p>
                    {deleteError && <p className="nav-dropdown-confirm-error">{deleteError}</p>}
                    <button
                      className="nav-dropdown-danger-btn"
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                    >
                      {deleting ? 'Deleting…' : 'Yes, delete everything'}
                    </button>
                    <button
                      className="nav-dropdown-item"
                      onClick={() => { setDeleteConfirm(false); setDeleteError('') }}
                      disabled={deleting}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="nav-dropdown-email">{user.email}</div>
                    <hr className="nav-dropdown-divider" />
                    <Link
                      to="/dashboard"
                      className="nav-dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button className="nav-dropdown-item" onClick={handleLogout}>
                      Logout
                    </button>
                    <hr className="nav-dropdown-divider" />
                    <button
                      className="nav-dropdown-item nav-dropdown-item--danger"
                      onClick={() => setDeleteConfirm(true)}
                    >
                      Delete account
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="nav-login-desktop">Login</Link>
        )}
      </div>

      <div
        className={`bx ${menuOpen ? 'bx-x' : 'bx-menu'}`}
        id="menu-icon"
        onClick={() => setMenuOpen(o => !o)}
      />
    </header>
  )
}
