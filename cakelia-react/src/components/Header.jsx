import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Header() {
  const [open, setOpen] = useState(false)

  function toggle() {
    setOpen(prev => !prev)
  }

  function close() {
    setOpen(false)
  }

  return (
    <header>
      <Link to="/" className="logo" onClick={close}>
        <img src="/img/ka3ka.png" alt="Cakelia" />
      </Link>
      <ul className={`navlist${open ? ' open' : ''}`}>
        <li><Link to="/" onClick={close}>Home</Link></li>
        <li><Link to="/blogs" onClick={close}>Blog</Link></li>
        <li><Link to="/contact" onClick={close}>Contact</Link></li>
        <li><Link to="/about" onClick={close}>About</Link></li>
      </ul>
      <div
        className={`bx ${open ? 'bx-x' : 'bx-menu'}`}
        id="menu-icon"
        onClick={toggle}
      />
    </header>
  )
}
