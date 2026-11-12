import CommitmentSection from '../components/CommitmentSection.jsx'
import ExpenseSection from '../components/ExpenseSection.jsx'
import Projection from '../components/Projection.jsx'
import { Section, Stat } from '../components/ui.jsx'
import { formatMoney, incomeRatios, monthTotals, splitByIncome } from '../lib/finance.js'

export default function SharedPanel({ month, members, shared }) {
  const totals = monthTotals(shared, month)
  const incomes = Object.fromEntries(members.map((m) => [m.id, m.income || 0]))
  const shares = splitByIncome(totals.total, incomes)
  const ratios = incomeRatios(incomes)
  const base = 'households/home'

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Fijos" value={totals.fixed} />
        <Stat label="Variables" value={totals.variable} />
        <Stat label="A meses" value={totals.committed} />
        <Stat label="Total del mes" value={totals.total} strong />
      </div>

      <Section title="Reparto según ingreso">
        {members.length < 2 && <p className="mb-2 text-xs text-white/50">Cuando tu pareja entre por primera vez aparecerá aquí.</p>}
        <ul className="space-y-3">
          {members.map((m) => (
            <li key={m.id}>
              <div className="flex justify-between text-sm">
                <span>{m.displayName || m.email}</span>
                <span className="font-semibold">{formatMoney(shares[m.id])}</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-black/20">
                <div className="h-full rounded-full bg-white/80" style={{ width: `${(ratios[m.id] || 0) * 100}%` }} />
              </div>
              <div className="mt-0.5 text-xs text-white/50">
                {Math.round((ratios[m.id] || 0) * 100)}% · ingreso {formatMoney(m.income)}
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <div className="grid gap-4 md:grid-cols-2">
        <ExpenseSection title="Gastos de la casa" path={`${base}/expenses`} items={shared.expenses} month={month} />
        <CommitmentSection title="Compras a meses de los dos" path={`${base}/commitments`} items={shared.commitments} month={month} />
      </div>
      <Projection expenses={shared.expenses} commitments={shared.commitments} from={month} />
    </div>
  )
}
