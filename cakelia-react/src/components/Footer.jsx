import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <nav className="footer-links">
        <Link to="/">Home</Link>
        <Link to="/blogs">Blog</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/about">About</Link>
        <Link to="/privacy">Privacy Policy</Link>
      </nav>
      <p className="footer-copy">&copy; {new Date().getFullYear()} Cakelia. All rights reserved.</p>
    </footer>
  )
}
