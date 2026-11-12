import { signInWithPopup } from 'firebase/auth'
import { useState } from 'react'
import { auth, googleProvider } from '../lib/firebase.js'
import { themeCss } from '../lib/themes.js'

export default function Login() {
  const [error, setError] = useState('')
  async function signIn() {
    setError('')
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (e) {
      if (e.code !== 'auth/popup-closed-by-user') setError('No se pudo iniciar sesión. Intenta de nuevo.')
    }
  }
  return (
    <div className="grid min-h-dvh place-items-center p-6" style={{ background: themeCss('midnight') }}>
      <div className="glass w-full max-w-sm p-8 text-center">
        <img src="/favicon.svg" alt="" className="mx-auto mb-4 size-14" />
        <h1 className="text-2xl font-semibold">Nuestras finanzas</h1>
        <p className="mt-2 text-sm text-white/60">Lo tuyo, lo mío y lo nuestro, en un solo lugar.</p>
        <button onClick={signIn} className="mt-6 w-full rounded-xl bg-white py-3 font-semibold text-slate-900">
          Entrar con Google
        </button>
        {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
      </div>
    </div>
  )
}
