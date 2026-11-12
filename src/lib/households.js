import { Timestamp, arrayUnion, doc, getDoc, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore'
import { db } from './firebase.js'

export const INVITE_DAYS = 7

function memberProfile(user) {
  const email = (user.email || '').toLowerCase()
  return { email, displayName: user.displayName || email }
}

export async function createHousehold(user, name) {
  const ref = doc(db, 'households', crypto.randomUUID())
  await setDoc(ref, { name: name || 'Nuestro hogar', members: [user.uid], createdBy: user.uid, createdAt: serverTimestamp() })
  await setDoc(doc(db, ref.path, 'members', user.uid), { ...memberProfile(user), createdAt: serverTimestamp() })
  await setDoc(doc(db, 'users', user.uid), { householdId: ref.id }, { merge: true })
  return ref.id
}

export async function createInvite(householdId, user) {
  const bytes = crypto.getRandomValues(new Uint8Array(18))
  const code = btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  await setDoc(doc(db, 'invites', code), {
    householdId,
    createdBy: user.uid,
    createdAt: serverTimestamp(),
    expiresAt: Timestamp.fromMillis(Date.now() + INVITE_DAYS * 86400000),
    usedBy: null,
  })
  return `${location.origin}/?invite=${code}`
}

// Returns 'joined' | 'already-member' | 'invalid' | 'has-partner'.
export async function acceptInvite(code, user, currentHouseholdId) {
  const inviteRef = doc(db, 'invites', code)
  let invite
  try {
    const snap = await getDoc(inviteRef)
    if (!snap.exists()) return 'invalid'
    invite = snap.data()
  } catch {
    return 'invalid'
  }
  if (invite.householdId === currentHouseholdId) return 'already-member'
  if (invite.usedBy || invite.expiresAt.toMillis() < Date.now()) return 'invalid'

  if (currentHouseholdId) {
    const current = await getDoc(doc(db, 'households', currentHouseholdId)).catch(() => null)
    if (current?.exists() && current.data().members.length > 1) return 'has-partner'
  }

  const householdRef = doc(db, 'households', invite.householdId)
  const batch = writeBatch(db)
  batch.update(householdRef, { members: arrayUnion(user.uid), joinedWith: code })
  batch.update(inviteRef, { usedBy: user.uid, usedAt: serverTimestamp() })
  batch.set(doc(db, householdRef.path, 'members', user.uid), { ...memberProfile(user), createdAt: serverTimestamp() }, { merge: true })
  batch.set(doc(db, 'users', user.uid), { householdId: invite.householdId }, { merge: true })
  try {
    await batch.commit()
    return 'joined'
  } catch {
    return 'invalid'
  }
}

const PENDING_KEY = 'pendingInvite'

export function takeInviteFromUrl() {
  const params = new URLSearchParams(location.search)
  const code = params.get('invite')
  if (code) {
    sessionStorage.setItem(PENDING_KEY, code)
    history.replaceState(null, '', location.pathname)
  }
  return sessionStorage.getItem(PENDING_KEY)
}

export function clearPendingInvite() {
  sessionStorage.removeItem(PENDING_KEY)
}
