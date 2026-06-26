import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import '../css/cakepreview.css'
import Header from '../components/Header'

function getAgeSuffix(age) {
  const last2 = age % 100
  const last1 = age % 10
  if (last2 >= 11 && last2 <= 13) return 'th'
  if (last1 === 1) return 'st'
  if (last1 === 2) return 'nd'
  if (last1 === 3) return 'rd'
  return 'th'
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
}

function getRandomStyles() {
  const r = Math.floor(Math.random() * 255)
  const g = Math.floor(Math.random() * 255)
  const b = Math.floor(Math.random() * 255)
  const mt = Math.floor(Math.random() * 200)
  const ml = Math.floor(Math.random() * 50)
  const dur = Math.floor(Math.random() * 5) + 5
  return {
    backgroundColor: `rgba(${r},${g},${b},0.7)`,
    color: `rgba(${r},${g},${b},0.7)`,
    boxShadow: `inset -7px -3px 10px rgba(${r - 10},${g - 10},${b - 10},0.7)`,
    margin: `${mt}px 0 0 ${ml}px`,
    animation: `float ${dur}s ease-in infinite`,
  }
}

export default function CakePreview() {
  const [searchParams] = useSearchParams()
  const [flameState, setFlameState] = useState('initial') // 'initial' | 'medium' | 'blown' | 'next'
  const [balloons, setBalloons] = useState([])
  const [showResetBtn, setShowResetBtn] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [showBalloons, setShowBalloons] = useState(true)
  const isBlownRef = useRef(false)
  const isOutRef = useRef(false)
  const intervalRef = useRef(null)

  // Parse URL params: ?a=name_age_c1_c2_c3_
  const fullParam = searchParams.get('a') || ''
  const parts = fullParam.split('_')
  const name = capitalize(parts[0] || '')
  const age = parts[1] || ''
  const sel1 = parts[2] || '14'
  const sel2 = parts[3] || '24'
  const sel3 = parts[4] || '33'

  const ageSuffix = age ? getAgeSuffix(parseInt(age)) : ''
  const hbText = name && age
    ? `Happy ${age}${ageSuffix} Birthday ${name}!`
    : 'Happy Birthday ...!'

  // Apply dark page body style, remove on leave
  useEffect(() => {
    document.body.classList.add('cakepreview-body')
    return () => document.body.classList.remove('cakepreview-body')
  }, [])

  // Detect social media webview
  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || window.opera
    const webviewKw = ['Instagram','Messenger','FBAN','FBAV','WhatsApp','Telegram',
      'Twitter','TikTok','LinkedIn','Snapchat','MicroMessenger','Line','Viber',
      'KAKAOTALK','Pinterest','Reddit']
    if (webviewKw.some(kw => ua.includes(kw))) {
      setShowNotification(true)
    }
  }, [])

  // Microphone + volume analysis
  useEffect(() => {
    let audioCtx
    let streamRef

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        streamRef = stream
        audioCtx = new (window.AudioContext || window.webkitAudioContext)()
        const mic = audioCtx.createMediaStreamSource(stream)
        const analyser = audioCtx.createAnalyser()
        mic.connect(analyser)
        analyser.fftSize = 2048
        const bufferLength = analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)

        intervalRef.current = setInterval(() => {
          analyser.getByteFrequencyData(dataArray)
          const avg = dataArray.reduce((s, v) => s + v, 0) / bufferLength

          if (!isBlownRef.current) {
            if (avg < 30) {
              setFlameState('initial')
            } else if (avg < 40) {
              setFlameState('medium')
            } else {
              setFlameState('blown')
              isBlownRef.current = true
              // create balloons
              setBalloons(Array.from({ length: 30 }, (_, i) => ({ id: i, style: getRandomStyles() })))
              setShowResetBtn(true)

              setTimeout(() => {
                isOutRef.current = true
                setFlameState('next')
              }, 21000)
            }
          }
        }, 100)
      })
      .catch(() => {})

    return () => {
      clearInterval(intervalRef.current)
      if (streamRef) streamRef.getTracks().forEach(t => t.stop())
      if (audioCtx) audioCtx.close()
    }
  }, [])

  // Click anywhere removes balloons
  function handleClick() {
    setBalloons([])
    setShowBalloons(false)
    setTimeout(() => setShowBalloons(true), 600)
  }

  function resetFlame() {
    isBlownRef.current = false
    isOutRef.current = false
    setFlameState('initial')
    setBalloons([])
    setShowResetBtn(false)
  }

  return (
    <div onClick={handleClick}>
      <Header />

      <div className="container">
        <h1 className="hb">{hbText}</h1>
        <p>Allow the mic, wish for something and blow out the candle</p>

        <div className="cake-wrapper">
          {/* Layer order matches original cakepreview.html exactly */}
          <img src="/img/empty001purple.png" alt="Birthday Cake" className="cake-image" />
          <img src={`/${sel1}.png`} alt="Birthday Cake" className="cake-image floating-image1" draggable="false" onContextMenu={e => e.preventDefault()} />
          <img src={`/${sel2}.png`} alt="Birthday Cake" className="cake-image floating-image2" draggable="false" onContextMenu={e => e.preventDefault()} />
          <img src={`/${sel3}.png`} alt="Birthday Cake" className="cake-image floating-image3" draggable="false" onContextMenu={e => e.preventDefault()} />

          <video id="initial-flame" className="flame-video" autoPlay loop muted playsInline
            style={{ display: flameState === 'initial' ? 'block' : 'none' }}>
            <source src="/3011.mp4" type="video/mp4" />
          </video>
          <video id="medium-flame" className="flame-video" autoPlay loop muted playsInline
            style={{ display: flameState === 'medium' ? 'block' : 'none' }}>
            <source src="/3022.mp4" type="video/mp4" />
          </video>
          <video id="blown-out-flame" className="flame-video" autoPlay loop muted playsInline
            style={{ display: flameState === 'blown' ? 'block' : 'none' }}>
            <source src="/3033.mp4" type="video/mp4" />
          </video>
          <video id="next-flame" className="flame-video" loop muted playsInline
            style={{ display: flameState === 'next' ? 'block' : 'none' }}
            autoPlay={flameState === 'next'}>
            <source src="/3044.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Webview notification */}
        {showNotification && (
          <div className="notifications">
            <div className="notification" style={{ display: 'block' }}>
              <p>
                <strong>Open in your browser!</strong><br />
                For the best experience, tap the three dots ⫶ or … and select <strong>'Open in browser'</strong>.
              </p>
              <button className="close-btn" onClick={e => { e.stopPropagation(); setShowNotification(false) }}>X</button>
            </div>
          </div>
        )}

        {/* Reset / refresh button shown after blow */}
        {showResetBtn && (
          <img
            className="flamebtn1"
            src="/pic5.svg"
            alt="Reset"
            style={{ display: 'block' }}
            onClick={e => { e.stopPropagation(); resetFlame() }}
          />
        )}

        {/* Balloons */}
        <div
          id="balloon-container"
          style={{ opacity: showBalloons ? 1 : 0, transition: 'opacity 500ms' }}
        >
          {balloons.map(b => (
            <div key={b.id} className="balloon" style={b.style} />
          ))}
        </div>
      </div>
    </div>
  )
}
