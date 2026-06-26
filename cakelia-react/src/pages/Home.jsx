import { useState } from 'react'
import Header from '../components/Header'

const ROWS = [
  { icon: '/img/pic1.svg', ids: ['11', '12', '13', '14', '15', '16'] },
  { icon: '/img/pic2.svg', ids: ['21', '22', '23', '24', '25', '26'] },
  { icon: '/img/pic3.svg', ids: ['31', '32', '33', '34', '35', '36'] },
]

const SparkleIcon = ({ size = 24 }) => (
  <svg height={size} width={size} fill="#FFFFFF" viewBox="0 0 24 24" className="sparkle">
    <path d="M10,21.236,6.755,14.745.264,11.5,6.755,8.255,10,1.764l3.245,6.491L19.736,11.5l-6.491,3.245ZM18,21l1.5,3L21,21l3-1.5L21,18l-1.5-3L18,18l-3,1.5ZM19.333,4.667,20.5,7l1.167-2.333L24,3.5,21.667,2.333,20.5,0,19.333,2.333,17,3.5Z" />
  </svg>
)

export default function Home() {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  // Each sel corresponds to the checkbox row (row1, row2, row3)
  const [sel1, setSel1] = useState('14')
  const [sel2, setSel2] = useState('24')
  const [sel3, setSel3] = useState('33')
  const [modal, setModal] = useState(null)
  const [copied, setCopied] = useState(false)

  const selections = [sel1, sel2, sel3]
  const setters = [setSel1, setSel2, setSel3]

  function handleGenerate() {
    if (!name.trim() || !age.toString().trim()) {
      alert('Please fill in all required fields.')
      return
    }
    const base = import.meta.env.VITE_BASE_URL
    const link = `${base}/cakepreview?a=${name}_${age}_${sel1}_${sel2}_${sel3}_`
    setModal(link)
    setCopied(false)
  }

  function copyLink() {
    navigator.clipboard.writeText(modal).catch(() => {
      const el = document.createElement('textarea')
      el.value = modal
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    })
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const CheckboxRows = ({ mobile }) => (
    <>
      {ROWS.map((row, rowIdx) => (
        <div className={mobile ? 'linemob' : 'line'} key={rowIdx}>
          <div className={mobile ? 'lineleftmob' : 'lineleft'}>
            <img className="pic123" width={mobile ? '25px' : '37px'} src={row.icon} alt="" />
          </div>
          {mobile && <>&nbsp; &nbsp;</>}
          <div className={mobile ? 'linerightmob' : 'lineright'}>
            <div className={`checkbox-wrapper-53 checkbox-set-${rowIdx + 1}`}>
              {row.ids.map(id => (
                <label className="container2" key={id}>
                  <input
                    type="checkbox"
                    checked={selections[rowIdx] === id}
                    onChange={() => setters[rowIdx](id)}
                  />
                  <div className="checkmark" id={`ch${id}`} />
                </label>
              ))}
            </div>
          </div>
        </div>
      ))}
    </>
  )

  return (
    <>
      <Header />

      {/* ── Desktop layout ─────────────────────────────── */}
      <section className="content">
        <div className="form">
          <div className="first-form">
            <h1 className="titlebox">Person</h1>
            <div className="name">
              <br /><br />
              <h4 className="name1">Name</h4>
              <input
                className="input"
                type="text"
                placeholder="Enter the name"
                value={name}
                onChange={e => setName(e.target.value.slice(0, 30))}
              /><br /><br />
            </div>
            <br /><br /><br /><br />
            <div className="age">
              <h4 className="age1">Age</h4>&nbsp;&nbsp;
              <input
                className="input input2"
                type="number"
                min="1"
                placeholder="Enter the age"
                value={age}
                onChange={e => setAge(e.target.value)}
              />
            </div>
          </div>

          <div className="second-form">
            <h1 className="titlebox">Cake</h1>
            <br /><br />
            <CheckboxRows mobile={false} />
          </div>

          <button className="btn" role="button" onClick={handleGenerate}>
            <SparkleIcon size={24} />
            <span className="text">Generate</span>
          </button>
        </div>

        <div className="pic">
          <div className="image-wrapper">
            {/* Layer order must match original HTML exactly */}
            <img className="base-image" src="/img/emptyCake001.png" alt="Base Image" />
            <img
              className="base-image floating-image1"
              src={`/${sel1}.png`}
              alt=""
              draggable="false"
              onContextMenu={e => e.preventDefault()}
            />
            <img
              className="base-image floating-image3"
              src={`/${sel3}.png`}
              alt=""
              draggable="false"
              onContextMenu={e => e.preventDefault()}
            />
            <img
              className="base-image floating-image2"
              src={`/${sel2}.png`}
              alt=""
              draggable="false"
              onContextMenu={e => e.preventDefault()}
            />
          </div>
        </div>
      </section>

      {/* ── Mobile layout ──────────────────────────────── */}
      <div className="containermob">
        <div className="sectionmob">
          <div className="input-group1">
            <h1 className="titlebox1">Person</h1>
            <div className="name1">
              <h4 className="name1">Name</h4>
              <input
                className="input1"
                type="text"
                placeholder="Enter the name"
                value={name}
                onChange={e => setName(e.target.value.slice(0, 30))}
              />
            </div>
            <br />
            <div className="age1">
              <h4 className="age1">Age</h4>&nbsp;&nbsp;
              <input
                className="input1 input2"
                type="number"
                min="1"
                placeholder="Enter the age"
                value={age}
                onChange={e => setAge(e.target.value)}
              />
            </div>
          </div>
        </div>
        <br />

        <div className="sectionmob">
          <h1 className="titlebox1">Cake</h1>
          <CheckboxRows mobile={true} />
        </div>

        <div className="cake-preview">
          <img src="/img/emptyCake002.png" alt="Cake Preview" />
          {/* Layer order must match original HTML exactly */}
          <img
            className="base-imagemob floating1"
            src={`/${sel1}.png`}
            draggable="false"
            onContextMenu={e => e.preventDefault()}
            alt=""
          />
          <img
            className="base-imagemob floating3"
            src={`/${sel3}.png`}
            draggable="false"
            onContextMenu={e => e.preventDefault()}
            alt=""
          />
          <img
            className="base-imagemob floating2"
            src={`/${sel2}.png`}
            draggable="false"
            onContextMenu={e => e.preventDefault()}
            alt=""
          />
        </div>

        <button className="generate-btn" role="button" onClick={handleGenerate}>
          <SparkleIcon size={15} />
          &nbsp;
          <span className="text">Generate</span>
        </button>
      </div>

      {/* ── Modal ─────────────────────────────────────── */}
      {modal && (
        <div className="modal" onClick={e => { if (e.target.className === 'modal') setModal(null) }}>
          <div className="modal-content">
            <span className="close" onClick={() => setModal(null)}>&times;</span>
            <p className="txtmodal">
              Link: <input type="text" id="generatedLink" value={modal} readOnly />
            </p>
            <button className="buttonmodal" onClick={copyLink}>Copy Link</button>
            <div
              className="copy-message"
              style={{ display: copied ? 'inline-block' : 'none' }}
            >
              Copied! Share it &lt;3
            </div>
          </div>
        </div>
      )}
    </>
  )
}
