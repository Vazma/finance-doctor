import { committedRatio, formatMoney, freedSchedule, healthLevel, monthLabel } from '../lib/finance.js'
import { firstName } from './SplitTable.jsx'
import { Section } from './ui.jsx'

const LEVEL = {
  good: ['bg-emerald-400', 'text-emerald-300', 'Sano'],
  warn: ['bg-amber-400', 'text-amber-300', 'Ajustado'],
  bad: ['bg-rose-400', 'text-rose-300', 'En riesgo'],
}

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1)

function FreedList({ commitments, month }) {
  const freed = freedSchedule(commitments, month)
  return (
    <div>
      <div className="text-xs text-white/60">Calendario de liberación</div>
      {freed.length === 0 ? (
        <p className="mt-1 text-sm text-white/50">Ningún pago a meses termina en los próximos 12 meses.</p>
      ) : (
        <ul className="mt-1 space-y-1 text-sm">
          {freed.map((f) => (
            <li key={f.month} className="flex justify-between gap-2">
              <span>
                {capitalize(monthLabel(f.month, { month: 'short', year: 'numeric' }))}
                <span className="text-xs text-white/50"> · {f.names.join(', ')}</span>
              </span>
              <span className="font-medium text-emerald-300">+{formatMoney(f.amount)}/mes</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function PersonalHealth({ income, committed, commitments, month }) {
  const ratio = committedRatio(income, committed)
  const level = healthLevel(ratio)
  return (
    <Section title="Salud financiera">
      <div className="space-y-4">
        <div>
          <div className="flex items-baseline justify-between text-xs text-white/60">
            Ingreso comprometido
            {level && <span className={`font-semibold ${LEVEL[level][1]}`}>{LEVEL[level][2]}</span>}
          </div>
          {ratio == null ? (
            <p className="mt-1 text-sm text-white/50">Captura tu ingreso para calcularlo.</p>
          ) : (
            <>
              <div className="mt-1 text-2xl font-semibold">{Math.round(ratio * 100)}%</div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
                <div className={`h-full rounded-full ${LEVEL[level][0]}`} style={{ width: `${Math.min(100, ratio * 100)}%` }} />
              </div>
              <p className="mt-1 text-xs text-white/50">
                De cada $100 que ganas, ${Math.round(ratio * 100)} ya están apartados en fijos, meses y tu parte del hogar antes de empezar el mes. Lo sano es menos de 50%.
              </p>
            </>
          )}
        </div>
        <FreedList commitments={commitments} month={month} />
      </div>
    </Section>
  )
}

export function SharedHealth({ members, sharedTotal, commitments, month }) {
  const missing = members.filter((m) => m.personalTotals?.[month] == null)
  const need = sharedTotal + members.reduce((s, m) => s + (m.personalTotals?.[month] || 0), 0)
  return (
    <Section title="Salud del hogar">
      <div className="space-y-4">
        <div>
          <div className="text-xs text-white/60">¿Alcanza con un solo sueldo?</div>
          <p className="mt-1 text-sm text-white/70">
            Entre los dos gastan {formatMoney(need)} este mes (hogar + lo personal de cada quien, solo totales).
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {members.map((m) => {
              const diff = (Number(m.income) || 0) - need
              return (
                <li key={m.id} className="flex justify-between gap-2">
                  <span>Solo con el sueldo de {firstName(m)}</span>
                  <span className={`font-medium ${diff >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {diff >= 0 ? 'sobran' : 'faltan'} {formatMoney(Math.abs(diff))}
                  </span>
                </li>
              )
            })}
          </ul>
          {missing.length > 0 && (
            <p className="mt-1 text-xs text-white/50">
              Falta lo personal de {missing.map(firstName).join(' y ')}: se suma cuando abra su panel.
            </p>
          )}
        </div>
        <FreedList commitments={commitments} month={month} />
      </div>
    </Section>
  )
}
