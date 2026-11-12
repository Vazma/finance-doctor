import { Check, Copy, Link2, Share2 } from 'lucide-react'
import { useState } from 'react'
import { INVITE_DAYS, createInvite } from '../lib/households.js'
import { Section } from './ui.jsx'

export default function InviteCard({ householdId, user }) {
  const [link, setLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)

  async function generate() {
    setBusy(true)
    try {
      setLink(await createInvite(householdId, user))
      setCopied(false)
    } finally {
      setBusy(false)
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(link)
    setCopied(true)
  }

  return (
    <Section title="Invita a tu pareja">
      {!link ? (
        <>
          <p className="mb-3 text-sm text-white/70">Genera una liga y compártela por WhatsApp. Podrá crear su cuenta con el correo que quiera y quedará unida a este hogar.</p>
          <button onClick={generate} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-semibold text-slate-900 disabled:opacity-60">
            <Link2 size={16} /> Generar liga de invitación
          </button>
        </>
      ) : (
        <>
          <div className="field mb-2 truncate select-all">{link}</div>
          <div className="flex gap-2">
            <button onClick={copy} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-semibold text-slate-900">
              {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copiada' : 'Copiar liga'}
            </button>
            {navigator.share && (
              <button onClick={() => navigator.share({ title: 'Nuestras finanzas', url: link })} className="rounded-xl bg-white/15 px-4" aria-label="Compartir">
                <Share2 size={16} />
              </button>
            )}
          </div>
          <p className="mt-2 text-xs text-white/50">Sirve una sola vez y caduca en {INVITE_DAYS} días.</p>
        </>
      )}
    </Section>
  )
}
