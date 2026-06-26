'use strict'

const { test }              = require('node:test')
const assert                = require('node:assert/strict')
const { computeDueReminders } = require('./computeDueReminders.js')

function f(overrides) {
  return {
    id:          'f1',
    birthMonth:  6,
    birthDay:    15,
    remind:      { threeDays: true, oneDay: true, dayOf: true },
    notifyEmail: 'test@example.com',
    ...overrides,
  }
}

test('dayOf — birthday matches today', () => {
  const r = computeDueReminders([f({ birthMonth: 6, birthDay: 15 })], 6, 15)
  assert.deepEqual(r, [{ friendId: 'f1', kind: 'dayOf' }])
})

test('oneDay — birthday is tomorrow', () => {
  const r = computeDueReminders([f({ birthMonth: 6, birthDay: 16 })], 6, 15)
  assert.deepEqual(r, [{ friendId: 'f1', kind: 'oneDay' }])
})

test('threeDays — birthday is in 3 days', () => {
  const r = computeDueReminders([f({ birthMonth: 6, birthDay: 18 })], 6, 15)
  assert.deepEqual(r, [{ friendId: 'f1', kind: 'threeDays' }])
})

test('multiple friends — multiple kinds', () => {
  const friends = [
    f({ id: 'a', birthMonth: 6, birthDay: 15 }),  // dayOf
    f({ id: 'b', birthMonth: 6, birthDay: 16 }),  // oneDay
    f({ id: 'c', birthMonth: 6, birthDay: 18 }),  // threeDays
  ]
  const r = computeDueReminders(friends, 6, 15)
  assert.deepEqual(r, [
    { friendId: 'a', kind: 'dayOf' },
    { friendId: 'b', kind: 'oneDay' },
    { friendId: 'c', kind: 'threeDays' },
  ])
})

test('no match — unrelated birthday', () => {
  const r = computeDueReminders([f({ birthMonth: 12, birthDay: 25 })], 6, 15)
  assert.deepEqual(r, [])
})

test('remind flags off — nothing triggered', () => {
  const r = computeDueReminders(
    [f({ birthMonth: 6, birthDay: 15, remind: { dayOf: false, oneDay: false, threeDays: false } })],
    6, 15
  )
  assert.deepEqual(r, [])
})

test('month rollover — Dec 31 + 3 days wraps to Jan 3', () => {
  const r = computeDueReminders([f({ birthMonth: 1, birthDay: 3 })], 12, 31)
  assert.deepEqual(r, [{ friendId: 'f1', kind: 'threeDays' }])
})

test('month rollover — Dec 30 + 1 day = Dec 31', () => {
  const r = computeDueReminders([f({ birthMonth: 12, birthDay: 31 })], 12, 30)
  assert.deepEqual(r, [{ friendId: 'f1', kind: 'oneDay' }])
})

test('empty friends list returns empty array', () => {
  const r = computeDueReminders([], 6, 15)
  assert.deepEqual(r, [])
})

test('friend has only dayOf enabled', () => {
  const r = computeDueReminders(
    [f({ birthMonth: 6, birthDay: 15, remind: { dayOf: true, oneDay: false, threeDays: false } })],
    6, 15
  )
  assert.deepEqual(r, [{ friendId: 'f1', kind: 'dayOf' }])
})

test('friend with no remind object is skipped safely', () => {
  const r = computeDueReminders(
    [{ id: 'f1', birthMonth: 6, birthDay: 15, notifyEmail: 'x@x.com' }],
    6, 15
  )
  assert.deepEqual(r, [])
})
