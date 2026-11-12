import { useState } from 'react'
import { addMonths, formatMoney, monthLabel, shareRows } from '../lib/finance.js'
import { Section } from './ui.jsx'

const GROUPS = [
  ['fixed', 'Fijos'],
  ['variable', 'Variables'],
  ['committed', 'A meses'],
]

export const firstName = (m) => (m.displayName || m.email || '').split(/[ @]/)[0]
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1)

export default function SplitTable({ members, shared, month, incomes, ratios }) {
  const [offset, setOffset] = useState(0)
  const target = addMonths(month, offset)
  const rows = shareRows(shared, target, incomes)
  const sum = (list, id) => list.reduce((s, r) => s + (id ? r.shares[id] || 0 : r.amount), 0)

  return (
    <Section
      title="¿Cuánto le toca a cada quien?"
      action={
        <div className="flex gap-1 rounded-lg bg-black/20 p-1 text-xs">
          {[0, 1].map((o) => (
            <button key={o} onClick={() => setOffset(o)} className={`rounded-md px-2 py-1 ${offset === o ? 'bg-white text-slate-900' : 'text-white/70'}`}>
              {capitalize(monthLabel(addMonths(month, o), { month: 'long' }))}
            </button>
          ))}
        </div>
      }
    >
      <div className={`mb-4 grid gap-3 ${members.length > 1 ? 'grid-cols-2' : ''}`}>
        {members.map((m) => (
          <div key={m.id} className="rounded-xl bg-black/20 p-3">
            <div className="text-xs text-white/60">
              A {firstName(m)} le toca · {Math.round((ratios[m.id] || 0) * 100)}%
            </div>
            <div className="mt-1 text-xl font-semibold">{formatMoney(sum(rows, m.id))}</div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-white/80" style={{ width: `${(ratios[m.id] || 0) * 100}%` }} />
            </div>
            <div className="mt-1 text-xs text-white/50">ingreso {formatMoney(m.income)}</div>
          </div>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-white/50">Sin gastos compartidos en {monthLabel(target, { month: 'long' })}.</p>
      ) : (
        <div className="-mx-1 overflow-x-auto">
          <table className="w-full min-w-[22rem] text-sm">
            <thead>
              <tr className="text-xs text-white/50">
                <th className="px-1 pb-2 text-left font-normal">Concepto</th>
                <th className="px-1 pb-2 text-right font-normal">Total</th>
                {members.map((m) => (
                  <th key={m.id} className="px-1 pb-2 text-right font-normal">{firstName(m)}</th>
                ))}
              </tr>
            </thead>
            {GROUPS.map(([group, label]) => {
              const list = rows.filter((r) => r.group === group)
              if (!list.length) return null
              return (
                <tbody key={group} className="border-t border-white/10">
                  <tr>
                    <td colSpan={2 + members.length} className="px-1 pt-2 text-xs font-semibold uppercase tracking-wide text-white/50">{label}</td>
                  </tr>
                  {list.map((r) => (
                    <tr key={r.id}>
                      <td className="px-1 py-1">{r.name}</td>
                      <td className="px-1 py-1 text-right text-white/60">{formatMoney(r.amount)}</td>
                      {members.map((m) => (
                        <td key={m.id} className="px-1 py-1 text-right">{formatMoney(r.shares[m.id])}</td>
                      ))}
                    </tr>
                  ))}
                  <tr className="text-white/60">
                    <td className="px-1 pb-2 text-xs">Subtotal</td>
                    <td className="px-1 pb-2 text-right text-xs">{formatMoney(sum(list))}</td>
                    {members.map((m) => (
                      <td key={m.id} className="px-1 pb-2 text-right text-xs">{formatMoney(sum(list, m.id))}</td>
                    ))}
                  </tr>
                </tbody>
              )
            })}
            <tfoot className="border-t border-white/20 font-semibold">
              <tr>
                <td className="px-1 pt-2">Total</td>
                <td className="px-1 pt-2 text-right">{formatMoney(sum(rows))}</td>
                {members.map((m) => (
                  <td key={m.id} className="px-1 pt-2 text-right">{formatMoney(sum(rows, m.id))}</td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </Section>
  )
}
