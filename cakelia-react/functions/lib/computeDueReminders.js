'use strict'

/**
 * Pure function — no I/O, no side effects.
 * Returns all reminders due for a user's friends given today's local date.
 *
 * @param {Array}  friends    - Friend docs from Firestore ({ id, birthMonth, birthDay, remind })
 * @param {number} todayMonth - 1-based month in the user's local timezone
 * @param {number} todayDay   - 1-based day in the user's local timezone
 * @returns {Array<{friendId: string, kind: 'dayOf'|'oneDay'|'threeDays'}>}
 */
function computeDueReminders(friends, todayMonth, todayDay) {
  const in1  = addCalendarDays(todayMonth, todayDay, 1)
  const in3  = addCalendarDays(todayMonth, todayDay, 3)
  const due  = []

  for (const f of friends) {
    const bm = f.birthMonth
    const bd = f.birthDay

    if (f.remind?.dayOf     && bm === todayMonth && bd === todayDay) {
      due.push({ friendId: f.id, kind: 'dayOf' })
    }
    if (f.remind?.oneDay    && bm === in1.month  && bd === in1.day) {
      due.push({ friendId: f.id, kind: 'oneDay' })
    }
    if (f.remind?.threeDays && bm === in3.month  && bd === in3.day) {
      due.push({ friendId: f.id, kind: 'threeDays' })
    }
  }

  return due
}

// Uses year 2000 (a leap year) so Feb-29 birthdays survive the arithmetic.
function addCalendarDays(month, day, n) {
  const d = new Date(2000, month - 1, day + n)
  return { month: d.getMonth() + 1, day: d.getDate() }
}

module.exports = { computeDueReminders, addCalendarDays }
