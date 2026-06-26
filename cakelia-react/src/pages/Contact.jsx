import { Link } from 'react-router-dom'
import Header from '../components/Header'

export default function Contact() {
  return (
    <>
      <Header />
      <div className="breadcrumb">
        <Link to="/">Home</Link> &gt; <span>Contact</span>
      </div>
      <div className="contact-form">
        <h1>Contact</h1>
        <form action="/form-handler.php" method="post">
          <div className="form-group">
            <input type="text" name="name" placeholder="Enter your name" required className="input-contact" />
            <input type="email" name="email" placeholder="Enter your email address" required className="input-contact" />
          </div>
          <textarea name="message" rows="8" placeholder="Message" required className="input-contact" />
          <div className="captcha">
            <span>2 + 2 = </span>
            <input type="text" name="captcha" required className="input-contact" />
            <button type="submit" className="btn-contact">Send</button>
          </div>
        </form>
      </div>
    </>
  )
}
