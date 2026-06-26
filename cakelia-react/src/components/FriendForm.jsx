import { useState } from 'react'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)

const EMPTY = {
  name: '',
  birthMonth: 1,
  birthDay: 1,
  birthYear: '',
  notifyEmail: '',
  remind: { threeDays: true, oneDay: true, dayOf: true },
}

export default function FriendForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(
    initial
      ? { ...initial, birthYear: initial.birthYear ?? '', remind: { ...initial.remind } }
      : { ...EMPTY, remind: { ...EMPTY.remind } }
  )
  const [saving, setSaving] = useState(false)
  const [err, setErr]       = useState('')

  const set       = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setRemind = (k, v) => setForm(f => ({ ...f, remind: { ...f.remind, [k]: v } }))

  async function submit(e) {
    e.preventDefault()
    if (!form.name.trim())        return setErr('Name is required.')
    if (!form.notifyEmail.trim()) return setErr('Notification email is required.')
    setSaving(true)
    setErr('')
    try {
      await onSave({
        name:         form.name.trim(),
        birthMonth:   Number(form.birthMonth),
        birthDay:     Number(form.birthDay),
        birthYear:    form.birthYear !== '' ? Number(form.birthYear) : null,
        notifyEmail:  form.notifyEmail.trim(),
        remind: {
          threeDays: Boolean(form.remind.threeDays),
          oneDay:    Boolean(form.remind.oneDay),
          dayOf:     Boolean(form.remind.dayOf),
        },
      })
    } catch (e) {
      setErr(e.message)
      setSaving(false)
    }
  }

  return (
    <form className="friend-form" onSubmit={submit}>
      {err && <p className="auth-error">{err}</p>}

      <div className="friend-form-row">
        <label className="friend-form-label">Name</label>
        <input
          className="input-contact"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder="Friend's name"
        />
      </div>

      <div className="friend-form-row">
        <label className="friend-form-label">Birthday</label>
        <div className="friend-form-bday">
          <select
            className="input-contact"
            value={form.birthMonth}
            onChange={e => set('birthMonth', e.target.value)}
          >
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <select
            className="input-contact"
            value={form.birthDay}
            onChange={e => set('birthDay', e.target.value)}
          >
            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <input
            className="input-contact"
            type="number"
            min="1900"
            max={new Date().getFullYear()}
            value={form.birthYear}
            onChange={e => set('birthYear', e.target.value)}
            placeholder="Year (optional)"
          />
        </div>
      </div>

      <div className="friend-form-row">
        <label className="friend-form-label">Notify email</label>
        <input
          className="input-contact"
          type="email"
          value={form.notifyEmail}
          onChange={e => set('notifyEmail', e.target.value)}
          placeholder="email@example.com"
        />
      </div>

      <div className="friend-form-row">
        <label className="friend-form-label">Reminders</label>
        <div className="friend-form-checks">
          {[
            ['threeDays', '3 days before'],
            ['oneDay',    '1 day before'],
            ['dayOf',     'Day of'],
          ].map(([key, label]) => (
            <label key={key} className="friend-check-label">
              <input
                type="checkbox"
                checked={form.remind[key]}
                onChange={e => setRemind(key, e.target.checked)}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="friend-form-actions">
        <button type="submit" className="btn-contact" disabled={saving}>
          {saving ? 'Saving…' : initial ? 'Save changes' : 'Add birthday'}
        </button>
        <button type="button" className="btn-contact btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
