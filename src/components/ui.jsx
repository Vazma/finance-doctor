import { formatMoney } from '../lib/finance.js'

export function Section({ title, action, children }) {
  return (
    <section className="glass p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/70">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export function Stat({ label, value, hint, strong }) {
  return (
    <div className="glass p-3">
      <div className="text-xs text-white/60">{label}</div>
      <div className={`mt-1 font-semibold ${strong ? 'text-2xl' : 'text-lg'}`}>{formatMoney(value)}</div>
      {hint && <div className="mt-0.5 text-xs text-white/50">{hint}</div>}
    </div>
  )
}

export function MoneyInput({ value, onChange, ...props }) {
  return (
    <input
      type="number"
      inputMode="decimal"
      min="0"
      step="any"
      className="field"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  )
}
