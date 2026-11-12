import { readFileSync } from 'node:fs'
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { Timestamp, arrayUnion, doc, getDoc, setDoc, updateDoc, writeBatch } from 'firebase/firestore'
import { afterAll, beforeAll, describe, it } from 'vitest'

let env
const as = (uid) => env.authenticatedContext(uid, { email: `${uid}@example.com` }).firestore()
const inDays = (d) => Timestamp.fromMillis(Date.now() + d * 86400000)

function joinBatch(db, uid, code, hid = 'h1') {
  const batch = writeBatch(db)
  batch.update(doc(db, 'households', hid), { members: arrayUnion(uid), joinedWith: code })
  batch.update(doc(db, 'invites', code), { usedBy: uid, usedAt: Timestamp.now() })
  batch.set(doc(db, `households/${hid}/members/${uid}`), { income: 0 })
  return batch.commit()
}

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-finance-doctor',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
  })
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore()
    await setDoc(doc(db, 'users/ella/expenses/x'), { name: 'Amazon', amount: 500 })
    await setDoc(doc(db, 'households/h1'), { members: ['el'], createdBy: 'el' })
    await setDoc(doc(db, 'households/h1/members/el'), { income: 50000 })
    await setDoc(doc(db, 'invites/expired'), { householdId: 'h1', createdBy: 'el', usedBy: null, expiresAt: inDays(-1) })
  })
})
afterAll(() => env?.cleanup())

describe('households', () => {
  it('anyone signed in can create a household only with themselves', async () => {
    await assertSucceeds(setDoc(doc(as('ella'), 'households/h2'), { members: ['ella'], createdBy: 'ella' }))
    await assertFails(setDoc(doc(as('x'), 'households/h3'), { members: ['x', 'el'], createdBy: 'x' }))
  })
  it('non-members cannot read or write', async () => {
    await assertFails(getDoc(doc(as('x'), 'households/h1')))
    await assertFails(getDoc(doc(as('x'), 'households/h1/members/el')))
    await assertFails(setDoc(doc(as('x'), 'households/h1/expenses/a'), { amount: 1 }))
    await assertFails(updateDoc(doc(as('x'), 'households/h1'), { members: arrayUnion('x') }))
    await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), 'households/h1')))
  })
})

describe('invites', () => {
  it('only members create invites', async () => {
    await assertSucceeds(setDoc(doc(as('el'), 'invites/good'), { householdId: 'h1', createdBy: 'el', usedBy: null, expiresAt: inDays(7) }))
    await assertFails(setDoc(doc(as('x'), 'invites/bad'), { householdId: 'h1', createdBy: 'x', usedBy: null, expiresAt: inDays(7) }))
    await assertFails(setDoc(doc(as('el'), 'invites/long'), { householdId: 'h1', createdBy: 'el', usedBy: null, expiresAt: inDays(30) }))
  })
  it('expired invite cannot be used', async () => {
    await assertFails(joinBatch(as('ella'), 'ella', 'expired'))
  })
  it('joining without consuming the invite fails', async () => {
    await assertFails(updateDoc(doc(as('ella'), 'households/h1'), { members: arrayUnion('ella'), joinedWith: 'good' }))
  })
  it('valid invite joins once', async () => {
    await assertSucceeds(joinBatch(as('ella'), 'ella', 'good'))
    await assertSucceeds(getDoc(doc(as('ella'), 'households/h1')))
    await assertFails(joinBatch(as('x'), 'x', 'good'))
  })
})

describe('after joining', () => {
  it('both members share expenses', async () => {
    await assertSucceeds(setDoc(doc(as('el'), 'households/h1/expenses/rent'), { amount: 20000 }))
    await assertSucceeds(getDoc(doc(as('ella'), 'households/h1/expenses/rent')))
  })
  it('each member edits only their own income', async () => {
    await assertSucceeds(getDoc(doc(as('el'), 'households/h1/members/ella')))
    await assertFails(setDoc(doc(as('el'), 'households/h1/members/ella'), { income: 1 }))
    await assertSucceeds(setDoc(doc(as('ella'), 'households/h1/members/ella'), { income: 60000 }))
  })
  it('members cannot add or remove people directly', async () => {
    await assertFails(updateDoc(doc(as('el'), 'households/h1'), { members: ['el'] }))
    await assertSucceeds(updateDoc(doc(as('el'), 'households/h1'), { theme: 'aurora' }))
  })
  it('personal space stays private', async () => {
    await assertSucceeds(getDoc(doc(as('ella'), 'users/ella/expenses/x')))
    await assertFails(getDoc(doc(as('el'), 'users/ella/expenses/x')))
    await assertFails(setDoc(doc(as('el'), 'users/ella/expenses/z'), { amount: 1 }))
  })
})
