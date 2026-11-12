import { signOut } from 'firebase/auth'
import { Home } from 'lucide-react'
import { useState } from 'react'
import { auth } from '../lib/firebase.js'
import { createHousehold } from '../lib/households.js'
import { themeCss } from '../lib/themes.js'

export default function Onboarding({ user }) {
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function create(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await createHousehold(user, name.trim())
    } catch {
      setError('No se pudo crear el hogar. Intenta de nuevo.')
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center p-6" style={{ background: themeCss('midnight') }}>
      <form onSubmit={create} className="glass w-full max-w-sm p-8 text-center">
        <Home className="mx-auto mb-3" size={36} />
        <h1 className="text-xl font-semibold">Aún no tienes un hogar</h1>
        <p className="mt-2 text-sm text-white/60">Crea uno ahora y después invita a tu pareja con una liga.</p>
        <input className="field mt-5" placeholder="Nombre del hogar (opcional)" value={name} onChange={(e) => setName(e.target.value)} />
        <button disabled={busy} className="mt-3 w-full rounded-xl bg-white py-3 font-semibold text-slate-900 disabled:opacity-60">
          Crear hogar
        </button>
        {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
        <p className="mt-5 text-xs text-white/50">¿Te invitaron? Abre la liga que te compartieron.</p>
        <button type="button" onClick={() => signOut(auth)} className="mt-2 text-xs text-white/50 underline">
          Usar otra cuenta
        </button>
      </form>
    </div>
  )
}
