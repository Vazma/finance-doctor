import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import CommitmentSection from '../components/CommitmentSection.jsx'
import ExpenseSection from '../components/ExpenseSection.jsx'
import Projection from '../components/Projection.jsx'
import { MoneyInput, Section, Stat } from '../components/ui.jsx'
import { incomeRatios, monthTotals, splitByIncome } from '../lib/finance.js'
import { db } from '../lib/firebase.js'
import { useCollection } from '../lib/hooks.js'

export default function PersonalPanel({ user, month, members, shared }) {
  const base = `users/${user.uid}`
  const expenses = useCollection(`${base}/expenses`)
  const commitments = useCollection(`${base}/commitments`)
  const me = members.find((m) => m.id === user.uid)
  const [income, setIncome] = useState('')
  useEffect(() => setIncome(me?.income ?? ''), [me?.income])

  const incomes = Object.fromEntries(members.map((m) => [m.id, m.income || 0]))
  const sharedTotal = monthTotals(shared, month).total
  const myShare = splitByIncome(sharedTotal, incomes)[user.uid] || 0
  const myRatio = incomeRatios(incomes)[user.uid] || 0
  const mine = monthTotals({ expenses, commitments }, month)
  const grossIncome = Number(me?.income) || 0
  const available = grossIncome - myShare - mine.total

  function saveIncome() {
    const value = Number(income) || 0
    if (value === (Number(me?.income) || 0)) return
    setDoc(doc(db, 'households/home/members', user.uid), { income: value, updatedAt: serverTimestamp() }, { merge: true })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Ingreso mensual" value={grossIncome} />
        <Stat label="Mi parte de lo compartido" value={myShare} hint={`${Math.round(myRatio * 100)}% de ${Math.round(sharedTotal).toLocaleString('es-MX')}`} />
        <Stat label="Mis gastos y meses" value={mine.total} />
        <Stat label="Me queda" value={available} strong />
      </div>

      <Section title="Mi ingreso">
        <div className="flex gap-2">
          <MoneyInput placeholder="Ingreso mensual bruto" value={income} onChange={setIncome} onBlur={saveIncome} />
          <button onClick={saveIncome} className="rounded-lg bg-white px-4 text-sm font-semibold text-slate-900">Guardar</button>
        </div>
        <p className="mt-2 text-xs text-white/50">Solo este número es visible para tu pareja: se usa para calcular el reparto de lo compartido.</p>
      </Section>

      <div className="grid gap-4 md:grid-cols-2">
        <CommitmentSection title="Mis créditos y meses" path={`${base}/commitments`} items={commitments} month={month} />
        <ExpenseSection title="Mis gastos" path={`${base}/expenses`} items={expenses} month={month} />
      </div>
      <Projection expenses={expenses} commitments={commitments} from={month} />
    </div>
  )
}
