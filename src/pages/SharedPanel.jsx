import CommitmentSection from '../components/CommitmentSection.jsx'
import ExpenseSection from '../components/ExpenseSection.jsx'
import Projection from '../components/Projection.jsx'
import UpcomingPayments from '../components/UpcomingPayments.jsx'
import InviteCard from '../components/InviteCard.jsx'
import { SharedHealth } from '../components/Health.jsx'
import SplitTable from '../components/SplitTable.jsx'
import { Stat } from '../components/ui.jsx'
import { incomeRatios, monthTotals } from '../lib/finance.js'

export default function SharedPanel({ user, month, members, shared, householdPath, householdId }) {
  const totals = monthTotals(shared, month)
  const incomes = Object.fromEntries(members.map((m) => [m.id, m.income || 0]))
  const ratios = incomeRatios(incomes)
  const base = householdPath

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Fijos" value={totals.fixed} />
        <Stat label="Variables" value={totals.variable} />
        <Stat label="A meses" value={totals.committed} />
        <Stat label="Total del mes" value={totals.total} strong />
      </div>

      <UpcomingPayments expenses={shared.expenses} commitments={shared.commitments} />

      {members.length < 2 && <InviteCard householdId={householdId} user={user} />}

      <SplitTable members={members} shared={shared} month={month} incomes={incomes} ratios={ratios} />

      <div className="grid gap-4 md:grid-cols-2">
        <ExpenseSection title="Gastos de la casa" path={`${base}/expenses`} items={shared.expenses} month={month} />
        <CommitmentSection title="Compras a meses de los dos" path={`${base}/commitments`} items={shared.commitments} month={month} />
      </div>
      <SharedHealth members={members} sharedTotal={totals.total} commitments={shared.commitments} month={month} />
      <Projection expenses={shared.expenses} commitments={shared.commitments} from={month} />
    </div>
  )
}
