import { dateLabel, daysBetween, formatMoney, relativeDay } from '../lib/finance.js'

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

export function Stat({ label, value, hint, strong, action }) {
  return (
    <div className="glass p-3">
      <div className="flex items-center justify-between gap-1 text-xs text-white/60">
        {label}
        {action}
      </div>
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

const MONTH_NAMES = Array.from({ length: 12 }, (_, i) => {
  const name = new Date(2026, i, 1).toLocaleDateString('es-MX', { month: 'long' })
  return name[0].toUpperCase() + name.slice(1)
})

export function MonthSelect({ value, onChange, className = '' }) {
  const [y, m] = value.split('-').map(Number)
  const now = new Date().getFullYear()
  const years = Array.from({ length: 11 }, (_, i) => now - 5 + i)
  if (!years.includes(y)) years.push(y)
  const set = (year, month) => onChange(`${year}-${String(month).padStart(2, '0')}`)
  return (
    <div className={`flex gap-2 ${className}`}>
      <div className="min-w-0 flex-1">
        <select className="field" value={m} onChange={(e) => set(y, Number(e.target.value))} aria-label="Mes">
          {MONTH_NAMES.map((name, i) => (
            <option key={name} value={i + 1}>{name}</option>
          ))}
        </select>
      </div>
      <div className="w-24 shrink-0">
        <select className="field" value={y} onChange={(e) => set(Number(e.target.value), m)} aria-label="Año">
          {years.sort().map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

export function DaySelect({ value, onChange, placeholder = 'Día de pago (opcional)', max = 31, className = '' }) {
  return (
    <select className={`field ${className}`} value={value} onChange={(e) => onChange(e.target.value)} aria-label="Día">
      {placeholder && <option value="">{placeholder}</option>}
      {Array.from({ length: max }, (_, i) => i + 1).map((d) => (
        <option key={d} value={d}>{placeholder ? `Día ${d}` : d}</option>
      ))}
    </select>
  )
}

export function DateSelect({ value, onChange, className = '' }) {
  const month = value.slice(0, 7)
  const day = Number(value.slice(8))
  const max = new Date(...month.split('-').map(Number), 0).getDate()
  const pad = (d) => String(d).padStart(2, '0')
  return (
    <div className={`flex gap-2 ${className}`}>
      <div className="w-20 shrink-0">
        <DaySelect placeholder="" max={max} value={day} onChange={(d) => onChange(`${month}-${pad(d)}`)} />
      </div>
      <MonthSelect
        className="min-w-0 flex-1"
        value={month}
        onChange={(m) => onChange(`${m}-${pad(Math.min(day, new Date(...m.split('-').map(Number), 0).getDate()))}`)}
      />
    </div>
  )
}

export function DueLabel({ date, today }) {
  if (!date) return null
  const inDays = daysBetween(today, date)
  if (inDays < 0) return <span className="text-white/40"> · venció {dateLabel(date)}</span>
  if (inDays <= 5) return <span className="font-medium text-amber-300"> · vence {relativeDay(inDays)}</span>
  return <span> · vence {dateLabel(date)}</span>
}
