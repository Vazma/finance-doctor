import { dateKey, dateLabel, formatMoney, relativeDay, upcomingPayments } from '../lib/finance.js'
import { Section } from './ui.jsx'

export default function UpcomingPayments({ expenses = [], commitments = [] }) {
  const upcoming = upcomingPayments([...expenses, ...commitments], dateKey())
  const total = upcoming.reduce((s, u) => s + u.amount, 0)

  return (
    <Section title="Próximos pagos" action={upcoming.length > 0 && <span className="text-sm font-semibold">{formatMoney(total)}</span>}>
      {upcoming.length === 0 ? (
        <p className="text-sm text-white/50">Nada vence en los próximos 7 días.</p>
      ) : (
        <ul className="divide-y divide-white/10">
          {upcoming.map((u) => (
            <li key={`${u.item.id}-${u.date}`} className="flex items-center justify-between gap-2 py-2 text-sm">
              <div>
                <div>{u.item.name}</div>
                <div className={`text-xs ${u.inDays <= 2 ? 'font-medium text-amber-300' : 'text-white/50'}`}>
                  {dateLabel(u.date, { weekday: 'short', day: 'numeric', month: 'short' })} · {relativeDay(u.inDays)}
                </div>
              </div>
              <span className="font-medium">{formatMoney(u.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
