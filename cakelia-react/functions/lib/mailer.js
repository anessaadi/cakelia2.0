'use strict'

const { Resend } = require('resend')

let _client = null
const getClient = () => {
  if (!_client) _client = new Resend(process.env.RESEND_API_KEY)
  return _client
}

const FROM = () => process.env.FROM_EMAIL || 'Cakelia <noreply@cakelia.com>'

const COPY = {
  dayOf: {
    subject: name => `🎂 Today is ${name}'s birthday!`,
    html:    name => `<p>Today is <strong>${name}</strong>'s birthday! Don't forget to wish them well 🎂</p>`,
  },
  oneDay: {
    subject: name => `🎂 ${name}'s birthday is tomorrow!`,
    html:    name => `<p><strong>${name}</strong>'s birthday is <strong>tomorrow</strong>! Time to prepare your wishes.</p>`,
  },
  threeDays: {
    subject: name => `🎂 ${name}'s birthday is in 3 days!`,
    html:    name => `<p><strong>${name}</strong>'s birthday is coming up in <strong>3 days</strong>!</p>`,
  },
}

const FOOTER = '<p style="color:#aaa;font-size:12px;margin-top:24px">— <a href="https://cakelia.com">Cakelia</a></p>'

/**
 * Sends a birthday reminder email via Resend.
 * @param {{ toEmail: string, friendName: string, kind: 'dayOf'|'oneDay'|'threeDays' }} opts
 */
async function sendReminderEmail({ toEmail, friendName, kind }) {
  const copy = COPY[kind]
  if (!copy) throw new Error(`Unknown reminder kind: ${kind}`)

  await getClient().emails.send({
    from:    FROM(),
    to:      toEmail,
    subject: copy.subject(friendName),
    html:    copy.html(friendName) + FOOTER,
  })
}

/**
 * Sends a contact-form notification email via Resend.
 * @param {{ name: string, email: string, message: string }} data
 */
async function sendContactEmail({ name, email, message }) {
  const to = process.env.CONTACT_TO
  if (!to) throw new Error('CONTACT_TO env var is not set')

  // Escape HTML entities to prevent XSS in the email body
  const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  const msgHtml = esc(message).replace(/\n/g, '<br>')

  await getClient().emails.send({
    from:     FROM(),
    to,
    replyTo:  email,
    subject:  `[Cakelia] New message from ${name}`,
    html: `
      <p><strong>Name:</strong> ${esc(name)}</p>
      <p><strong>Email:</strong> ${esc(email)}</p>
      <hr>
      <p>${msgHtml}</p>
      ${FOOTER}
    `,
  })
}

module.exports = { sendReminderEmail, sendContactEmail }
