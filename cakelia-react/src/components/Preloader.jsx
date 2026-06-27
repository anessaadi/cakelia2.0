import { useState, useEffect } from 'react'

const FRAME_COUNT = 8
const FRAME_MS    = 200

export default function Preloader({ visible }) {
  const [frame, setFrame] = useState(0)
  const [dots,  setDots]  = useState(1)

  useEffect(() => {
    const id = setInterval(() => {
      setFrame(f => (f + 1) % FRAME_COUNT)
      setDots(d => (d % 3) + 1)
    }, FRAME_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <div className={`preloader${visible ? '' : ' preloader--out'}`} aria-label="Loading" aria-live="polite">
      <div className="preloader-inner">
        <div className="preloader-stage">
          {Array.from({ length: FRAME_COUNT }, (_, i) => (
            <img
              key={i}
              src={`/preloader/CAKELIA-0${i + 1}.png`}
              alt=""
              className="preloader-frame"
              style={{ opacity: i === frame ? 1 : 0 }}
            />
          ))}
        </div>
        <div className="preloader-text">
          <span className="preloader-word">Baking</span>
          <span className="preloader-dots">{'.' .repeat(dots)}</span>
        </div>
      </div>
    </div>
  )
}
