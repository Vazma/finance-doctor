import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase.js'

export default function NoAccess({ email }) {
  return (
    <div className="grid min-h-dvh place-items-center p-6">
      <div className="glass max-w-sm p-8 text-center">
        <h1 className="text-xl font-semibold">Sin acceso</h1>
        <p className="mt-2 text-sm text-white/60">{email} no está autorizado para esta app.</p>
        <button onClick={() => signOut(auth)} className="mt-6 rounded-xl bg-white px-5 py-2 font-semibold text-slate-900">
          Usar otra cuenta
        </button>
      </div>
    </div>
  )
}
