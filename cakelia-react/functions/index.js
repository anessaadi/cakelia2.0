'use strict'

const { initializeApp }        = require('firebase-admin/app')
const { getFirestore }         = require('firebase-admin/firestore')
const { onSchedule }           = require('firebase-functions/v2/scheduler')
const { onRequest }            = require('firebase-functions/v2/https')
const { computeDueReminders }  = require('./lib/computeDueReminders.js')
const { sendReminderEmail }    = require('./lib/mailer.js')

initializeApp()
const db = getFirestore()

// Returns today's month/day/sendDate string in an IANA timezone.
function todayIn(timezone) {
  const now   = new Date()
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric', month: 'numeric', day: 'numeric',
  }).formatToParts(now)
  const get = type => parseInt(parts.find(p => p.type === type).value)
  const month = get('month'), day = get('day'), year = get('year')
  return {
    month,
    day,
    sendDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
  }
}

// Processes all due reminders for a single user.
async function processUser(uid, userData) {
  const timezone = userData.timezone || 'UTC'
  const { month, day, sendDate } = todayIn(timezone)

  const friendsSnap = await db.collection('users').doc(uid).collection('friends').get()
  const friends     = friendsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  const due         = computeDueReminders(friends, month, day)

  await Promise.allSettled(
    due.map(async ({ friendId, kind }) => {
      // Composite doc ID acts as the dedup key — one email per user/friend/kind/day.
      const logId  = `${uid}_${friendId}_${kind}_${sendDate}`
      const logRef = db.collection('mail_log').doc(logId)

      if ((await logRef.get()).exists) return  // already sent today

      const friend = friends.find(f => f.id === friendId)
      if (!friend) return

      await sendReminderEmail({ toEmail: friend.notifyEmail, friendName: friend.name, kind })
      await logRef.set({ uid, friendId, kind, sendDate, sentAt: new Date() })
    })
  )
}

// ── Scheduled: every day at 08:00 UTC ────────────────────────────────────
exports.sendBirthdayReminders = onSchedule('every day 08:00', async () => {
  const snap = await db.collection('users').get()
  await Promise.allSettled(snap.docs.map(doc => processUser(doc.id, doc.data())))
})

// ── HTTP test trigger ─────────────────────────────────────────────────────
// Emulator: POST http://localhost:5001/<project-id>/us-central1/triggerReminders
// Production: same URL on functions host, requires x-trigger-secret header.
exports.triggerReminders = onRequest({ cors: false }, async (req, res) => {
  if (process.env.FUNCTIONS_EMULATOR !== 'true') {
    const secret = process.env.TRIGGER_SECRET
    if (!secret || req.headers['x-trigger-secret'] !== secret) {
      return res.status(403).send('Forbidden')
    }
  }
  const snap = await db.collection('users').get()
  await Promise.allSettled(snap.docs.map(doc => processUser(doc.id, doc.data())))
  res.send(`Processed ${snap.size} user(s).`)
})

// Contact trigger — Phase 5
