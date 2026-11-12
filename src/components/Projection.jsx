import { formatMoney, monthLabel, projection } from '../lib/finance.js'
import { Section } from './ui.jsx'

// Next 12 months of committed money, so you can see when each MSI / credit frees cash.
export default function Projection({ expenses, commitments, from }) {
  const rows = projection({ expenses, commitments }, from, 12)
  const max = Math.max(1, ...rows.map((r) => r.total))
  return (
    <Section title="Próximos 12 meses">
      <div className="flex h-32 items-end gap-1">
        {rows.map((r) => (
          <div key={r.month} className="flex h-full flex-1 flex-col items-center justify-end gap-1" title={`${monthLabel(r.month)}: ${formatMoney(r.total)}`}>
            <div className="flex w-full flex-col overflow-hidden rounded-t" style={{ height: `calc(${(r.total / max) * 100}% - 16px)` }}>
              <div className="bg-white/80" style={{ flexGrow: r.committed }} />
              <div className="bg-white/40" style={{ flexGrow: r.fixed + r.variable }} />
            </div>
            <span className="text-[10px] text-white/50">{monthLabel(r.month, { month: 'narrow' })}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-4 text-xs text-white/60">
        <span className="flex items-center gap-1"><i className="inline-block size-2 rounded-sm bg-white/80" /> A meses</span>
        <span className="flex items-center gap-1"><i className="inline-block size-2 rounded-sm bg-white/40" /> Fijos y variables</span>
      </div>
    </Section>
  )
}
