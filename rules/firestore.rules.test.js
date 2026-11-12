import { readFileSync } from 'node:fs'
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { afterAll, beforeAll, describe, it } from 'vitest'

let env
const user = (uid, email, verified = true) =>
  env.authenticatedContext(uid, { email, email_verified: verified }).firestore()

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-finance-doctor',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
  })
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore()
    await setDoc(doc(db, 'config/access'), { emails: ['el@example.com', 'ella@example.com'] })
    await setDoc(doc(db, 'users/ella/expenses/x'), { name: 'Amazon', amount: 500 })
    await setDoc(doc(db, 'households/home/members/ella'), { income: 60000 })
  })
})
afterAll(() => env?.cleanup())

describe('personal space', () => {
  it('owner can read and write', async () => {
    const db = user('ella', 'ella@example.com')
    await assertSucceeds(getDoc(doc(db, 'users/ella/expenses/x')))
    await assertSucceeds(setDoc(doc(db, 'users/ella/commitments/y'), { monthly: 1 }))
  })
  it('partner cannot read or write it', async () => {
    const db = user('el', 'el@example.com')
    await assertFails(getDoc(doc(db, 'users/ella/expenses/x')))
    await assertFails(setDoc(doc(db, 'users/ella/expenses/z'), { amount: 1 }))
  })
})

describe('shared space', () => {
  it('both members read and write shared expenses', async () => {
    await assertSucceeds(setDoc(doc(user('el', 'el@example.com'), 'households/home/expenses/rent'), { amount: 20000 }))
    await assertSucceeds(getDoc(doc(user('ella', 'ella@example.com'), 'households/home/expenses/rent')))
  })
  it('partner reads but cannot edit the other income', async () => {
    const db = user('el', 'el@example.com')
    await assertSucceeds(getDoc(doc(db, 'households/home/members/ella')))
    await assertFails(setDoc(doc(db, 'households/home/members/ella'), { income: 1 }))
    await assertSucceeds(setDoc(doc(db, 'households/home/members/el'), { income: 50000 }))
  })
})

describe('outsiders', () => {
  it('unknown, unverified and anonymous users get nothing', async () => {
    await assertFails(getDoc(doc(user('x', 'x@example.com'), 'households/home/expenses/rent')))
    await assertFails(getDoc(doc(user('x', 'x@example.com'), 'users/x/expenses/a')))
    await assertFails(getDoc(doc(user('el', 'el@example.com', false), 'households/home/expenses/rent')))
    await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), 'households/home/expenses/rent')))
    await assertFails(setDoc(doc(user('el', 'el@example.com'), 'config/access'), { emails: ['x@example.com'] }))
  })
})
