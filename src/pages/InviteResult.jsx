import { themeCss } from '../lib/themes.js'

const MESSAGES = {
  invalid: ['Esta liga ya no es válida', 'Ya se usó o caducó. Solicita una nueva liga a quien te invitó.'],
  'has-partner': ['Ya tienes un hogar compartido', 'Tu cuenta ya comparte un hogar con otra persona, así que no puede unirse a otro.'],
}

export default function InviteResult({ status, onContinue }) {
  const [title, body] = MESSAGES[status] || MESSAGES.invalid
  return (
    <div className="grid min-h-dvh place-items-center p-6" style={{ background: themeCss('midnight') }}>
      <div className="glass w-full max-w-sm p-8 text-center">
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-white/60">{body}</p>
        <button onClick={onContinue} className="mt-6 w-full rounded-xl bg-white py-3 font-semibold text-slate-900">
          Continuar
        </button>
      </div>
    </div>
  )
}
