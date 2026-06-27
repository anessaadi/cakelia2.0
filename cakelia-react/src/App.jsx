import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuth } from './lib/AuthContext'
import Preloader from './components/Preloader'
import Home from './pages/Home'
import CakePreview from './pages/CakePreview'
import Blogs from './pages/Blogs'
import Blog1 from './pages/Blog1'
import Blog2 from './pages/Blog2'
import Blog3 from './pages/Blog3'
import Blog4 from './pages/Blog4'
import Contact from './pages/Contact'
import About from './pages/About'
import Privacy from './pages/Privacy'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import CookieNotice from './components/CookieNotice'
import Footer from './components/Footer'

export default function App() {
  const { loading }                       = useAuth()
  const [showPreloader, setShowPreloader] = useState(true)
  const [preloaderOn,   setPreloaderOn]   = useState(true)

  useEffect(() => {
    if (!loading) {
      setPreloaderOn(false)
      const id = setTimeout(() => setShowPreloader(false), 500)
      return () => clearTimeout(id)
    }
  }, [loading])

  return (
    <>
      {showPreloader && <Preloader visible={preloaderOn} />}
      <Routes>
        {/* ── Public ─────────────────────────────────────── */}
        <Route path="/"            element={<Home />} />
        <Route path="/cakepreview" element={<CakePreview />} />
        <Route path="/blogs"       element={<Blogs />} />
        <Route path="/blog/1"      element={<Blog1 />} />
        <Route path="/blog/2"      element={<Blog2 />} />
        <Route path="/blog/3"      element={<Blog3 />} />
        <Route path="/blog/4"      element={<Blog4 />} />
        <Route path="/contact"     element={<Contact />} />
        <Route path="/about"       element={<About />} />
        <Route path="/privacy"     element={<Privacy />} />

        {/* ── Auth ───────────────────────────────────────── */}
        <Route path="/login"  element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ── Protected ──────────────────────────────────── */}
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
      </Routes>

      <Footer />
      <CookieNotice />
    </>
  )
}
