import { Link } from 'react-router-dom'
import Header from '../components/Header'

export default function About() {
  return (
    <>
      <Header />
      <div className="breadcrumb">
        <Link to="/">Home</Link> &gt; <span>About</span>
      </div>
      <div className="container-about">
        <div className="text-section-about">
          <h1 className="h1-about">About us</h1>
          <div className="image-section-about2">
            <img src="/img/cakelia1111.png" alt="Celebration Illustration" />
          </div>
          <p className="p-about">
            At Cakelia, we make celebrations fun and virtual! Create personalized digital cakes
            with names, ages, and colors, then send a link for your loved ones to "blow out"
            the candles virtually. No mess, just pure joy!
          </p>
          <Link to="/" className="button-about">Try Now &rarr;</Link>
        </div>
        <div className="image-section-about">
          <img src="/img/cakelia1111.png" alt="Celebration Illustration" />
        </div>
      </div>
    </>
  )
}
