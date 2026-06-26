import { useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import Header from '../components/Header'
import { db } from '../lib/firebase'

const EMPTY = { name: '', email: '', message: '' }

export default function Contact() {
  const [form,   setForm]   = useState(EMPTY)
  const [honey,  setHoney]  = useState('')   // honeypot — bots fill this, humans don't
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [errMsg, setErrMsg] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (honey) return          // silent drop — bot detected
    if (status === 'sending') return

    setStatus('sending')
    setErrMsg('')

    try {
      await addDoc(collection(db, 'contact_messages'), {
        name:      form.name.trim(),
        email:     form.email.trim(),
        message:   form.message.trim(),
        createdAt: serverTimestamp(),
      })
      setStatus('success')
      setForm(EMPTY)
    } catch (err) {
      setErrMsg('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  return (
    <>
      <Header />
      <div className="breadcrumb">
        <Link to="/">Home</Link> &gt; <span>Contact</span>
      </div>
      <div className="contact-form">
        <h1>Contact</h1>

        {status === 'success' ? (
          <div className="contact-success">
            <p>Message sent! We'll get back to you soon.</p>
            <button className="btn-contact" onClick={() => setStatus('idle')}>
              Send another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Honeypot — hidden from real users, filled by bots */}
            <input
              type="text"
              name="website"
              value={honey}
              onChange={e => setHoney(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0 }}
            />

            <div className="form-group">
              <input
                type="text"
                placeholder="Enter your name"
                required
                className="input-contact"
                value={form.name}
                onChange={e => set('name', e.target.value)}
              />
              <input
                type="email"
                placeholder="Enter your email address"
                required
                className="input-contact"
                value={form.email}
                onChange={e => set('email', e.target.value)}
              />
            </div>

            <textarea
              rows="8"
              placeholder="Message"
              required
              className="input-contact"
              value={form.message}
              onChange={e => set('message', e.target.value)}
            />

            {errMsg && <p className="auth-error" style={{ marginTop: '10px' }}>{errMsg}</p>}

            <div className="captcha">
              <button type="submit" className="btn-contact" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Send'}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  )
}
