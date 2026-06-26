import { Link } from 'react-router-dom'
import Header from '../components/Header'

export default function Privacy() {
  return (
    <>
      <Header />
      <div className="main privacy-page">
        <div className="breadcrumb1">
          <Link to="/">Home</Link> &gt; <span>Privacy Policy</span>
        </div>

        <h1 className="privacy-title">Privacy Policy</h1>
        <p className="privacy-meta">Effective date: June 2026</p>

        <section className="privacy-section">
          <h2>1. What we collect</h2>
          <p>When you create an account, we store:</p>
          <ul>
            <li>Your email address and display name (from Google or email sign-up)</li>
            <li>Your IANA timezone (detected automatically, changeable in your dashboard)</li>
            <li>Birthday information you voluntarily add for your friends (name, birth date, notification email)</li>
          </ul>
          <p>When you use the contact form, we store the name, email address, and message you submit.</p>
        </section>

        <section className="privacy-section">
          <h2>2. How we use your data</h2>
          <ul>
            <li>To send birthday reminder emails to the notification address you specify</li>
            <li>To respond to contact form enquiries</li>
            <li>We do not sell your data or share it with third parties for marketing</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>3. Third-party services</h2>
          <p>We use the following services which may process your data:</p>
          <ul>
            <li><strong>Firebase (Google)</strong> — authentication and database hosting. Google's privacy policy applies: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">policies.google.com/privacy</a></li>
            <li><strong>Resend</strong> — transactional email delivery. Resend's privacy policy: <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">resend.com/legal/privacy-policy</a></li>
            <li><strong>Google Analytics</strong> — anonymous usage statistics (pages visited, session duration). No personally identifiable information is shared. You can opt out with the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Google Analytics opt-out browser add-on</a>.</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>4. Cookies</h2>
          <p>We use cookies for:</p>
          <ul>
            <li>Keeping you logged in (Firebase authentication session)</li>
            <li>Anonymous analytics via Google Analytics</li>
          </ul>
          <p>You can decline analytics cookies via the banner shown on your first visit.</p>
        </section>

        <section className="privacy-section">
          <h2>5. Your rights</h2>
          <p>You can:</p>
          <ul>
            <li>Access your data at any time from your <Link to="/dashboard">dashboard</Link></li>
            <li>Delete your account and all associated data from your dashboard settings</li>
            <li>Contact us to request a copy or correction of your data</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>6. Data retention</h2>
          <p>Your data is retained until you delete your account. Deleted data is removed immediately from our active database. Firebase backups are cycled within 7 days.</p>
        </section>

        <section className="privacy-section">
          <h2>7. Contact</h2>
          <p>Questions about this policy? <Link to="/contact">Contact us</Link>.</p>
        </section>
      </div>
    </>
  )
}
