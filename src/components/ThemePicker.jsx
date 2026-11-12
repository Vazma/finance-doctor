import { Check } from 'lucide-react'
import { THEMES } from '../lib/themes.js'

export default function ThemePicker({ value, onChange, onClose }) {
  return (
    <div className="fixed inset-0 z-20 flex items-end bg-black/50 sm:items-center sm:justify-center" onClick={onClose}>
      <div className="w-full rounded-t-3xl bg-slate-900 p-5 sm:max-w-md sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 font-semibold">Elige una carátula</h2>
        <div className="grid grid-cols-5 gap-3">
          {THEMES.map((t) => (
            <button key={t.id} onClick={() => onChange(t.id)} className="flex flex-col items-center gap-1 text-[11px] text-white/70">
              <span className="relative grid aspect-[3/4] w-full place-items-center rounded-xl ring-white" style={{ background: t.css, boxShadow: value === t.id ? '0 0 0 2px white' : undefined }}>
                {value === t.id && <Check size={16} />}
              </span>
              {t.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
