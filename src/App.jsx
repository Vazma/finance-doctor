import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { ChevronLeft, ChevronRight, LogOut, Palette } from 'lucide-react'
import { useEffect, useState } from 'react'
import ThemePicker from './components/ThemePicker.jsx'
import { addMonths, monthKey, monthLabel } from './lib/finance.js'
import { auth, db } from './lib/firebase.js'
import { acceptInvite, clearPendingInvite, takeInviteFromUrl } from './lib/households.js'
import { useCollection, useDocument } from './lib/hooks.js'
import { themeCss } from './lib/themes.js'
import Login from './pages/Login.jsx'
import Onboarding from './pages/Onboarding.jsx'
import InviteResult from './pages/InviteResult.jsx'
import PersonalPanel from './pages/PersonalPanel.jsx'
import SharedPanel from './pages/SharedPanel.jsx'

export default function App() {
  const [user, setUser] = useState(undefined)
  const [pendingInvite, setPendingInvite] = useState(() => takeInviteFromUrl())
  const [inviteStatus, setInviteStatus] = useState(null)
  const profile = useDocument(user ? `users/${user.uid}` : null)

  useEffect(() => onAuthStateChanged(auth, setUser), [])

  useEffect(() => {
    if (!user || !pendingInvite || profile === undefined) return
    let cancelled = false
    acceptInvite(pendingInvite, user, profile?.householdId).then((status) => {
      if (cancelled) return
      clearPendingInvite()
      setPendingInvite(null)
      if (status === 'invalid' || status === 'has-partner') setInviteStatus(status)
    })
    return () => {
      cancelled = true
    }
  }, [user, pendingInvite, profile])

  if (user === undefined) return null
  if (!user) return <Login invited={Boolean(pendingInvite)} />
  if (inviteStatus) return <InviteResult status={inviteStatus} onContinue={() => setInviteStatus(null)} />
  if (profile === undefined || pendingInvite) return null
  if (!profile?.householdId) return <Onboarding user={user} />
  return <Dashboard user={user} profile={profile} householdId={profile.householdId} />
}

function Dashboard({ user, profile, householdId }) {
  const [tab, setTab] = useState('personal')
  const [month, setMonth] = useState(monthKey())
  const [picking, setPicking] = useState(false)
  const householdPath = `households/${householdId}`
  const household = useDocument(householdPath)
  const members = useCollection(`${householdPath}/members`, { ordered: false })
  const shared = {
    expenses: useCollection(`${householdPath}/expenses`),
    commitments: useCollection(`${householdPath}/commitments`),
  }

  const themeId = tab === 'personal' ? profile?.theme : household?.theme
  function setTheme(id) {
    setDoc(doc(db, tab === 'personal' ? `users/${user.uid}` : householdPath), { theme: id }, { merge: true })
  }

  return (
    <div className="relative min-h-dvh pb-10">
      <div className="fixed inset-0 -z-10 transition-[background] duration-500" style={{ background: themeCss(themeId) }} />
      <header className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-4 pt-5">
        <div className="text-sm text-white/70">Hola, {(user.displayName || user.email).split(' ')[0]}</div>
        <div className="flex gap-1">
          <button className="rounded-full p-2 hover:bg-white/10" onClick={() => setPicking(true)} aria-label="Carátula">
            <Palette size={18} />
          </button>
          <button className="rounded-full p-2 hover:bg-white/10" onClick={() => signOut(auth)} aria-label="Cerrar sesión">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <nav className="mx-auto mt-4 flex max-w-4xl gap-1 px-4">
        <div className="glass flex w-full gap-1 p-1">
          {[
            ['personal', 'Mis finanzas'],
            ['shared', 'Nuestras finanzas'],
          ].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`flex-1 rounded-xl py-2 text-sm font-medium ${tab === id ? 'bg-white text-slate-900' : 'text-white/70'}`}>
              {label}
            </button>
          ))}
        </div>
      </nav>

      <div className="mx-auto mt-4 flex max-w-4xl items-center justify-between px-4">
        <button className="rounded-full p-2 hover:bg-white/10" onClick={() => setMonth(addMonths(month, -1))} aria-label="Mes anterior">
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <div className="text-lg font-semibold">{capitalize(monthLabel(month))}</div>
          {month !== monthKey() && (
            <button className="text-xs text-white/60 underline" onClick={() => setMonth(monthKey())}>
              Ir a este mes
            </button>
          )}
        </div>
        <button className="rounded-full p-2 hover:bg-white/10" onClick={() => setMonth(addMonths(month, 1))} aria-label="Mes siguiente">
          <ChevronRight size={20} />
        </button>
      </div>

      <main className="mx-auto mt-4 max-w-4xl px-4">
        {tab === 'personal' ? (
          <PersonalPanel user={user} month={month} members={members} shared={shared} householdPath={householdPath} />
        ) : (
          <SharedPanel user={user} month={month} members={members} shared={shared} householdPath={householdPath} householdId={householdId} />
        )}
      </main>

      {picking && <ThemePicker value={themeId || 'midnight'} onChange={setTheme} onClose={() => setPicking(false)} />}
    </div>
  )
}

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1)
