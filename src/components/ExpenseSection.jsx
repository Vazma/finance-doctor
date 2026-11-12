import { addDoc, collection, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { dateKey, dateLabel, dueDate, expenseAmount, formatMoney } from '../lib/finance.js'
import { db } from '../lib/firebase.js'
import { DateSelect, DaySelect, DueLabel, MoneyInput, Section } from './ui.jsx'

const KIND_LABEL = { fixed: 'Fijo mensual', variable: 'Variable' }

export default function ExpenseSection({ path, items, month, title }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [kind, setKind] = useState('fixed')
  const [day, setDay] = useState('')
  const [date, setDate] = useState('')
  const today = dateKey()
  const visible = items
    .filter((e) => expenseAmount(e, month) > 0)
    .map((e) => ({ ...e, due: dueDate(e, month) }))
    .sort((a, b) => (a.due || '9').localeCompare(b.due || '9'))

  function toggle() {
    if (!open) setDate(today.startsWith(month) ? today : `${month}-01`)
    setOpen(!open)
  }

  async function add(e) {
    e.preventDefault()
    if (!name.trim() || !(Number(amount) > 0)) return
    await addDoc(collection(db, path), {
      name: name.trim(),
      amount: Number(amount),
      kind,
      day: kind === 'fixed' ? Number(day) || null : null,
      date: kind === 'variable' ? date : null,
      month: kind === 'variable' ? date.slice(0, 7) : null,
      createdAt: serverTimestamp(),
    })
    setName('')
    setAmount('')
    setDay('')
    setOpen(false)
  }

  return (
    <Section
      title={title}
      action={
        <button className="rounded-full bg-white/15 p-1.5 hover:bg-white/25" onClick={toggle} aria-label="Agregar gasto">
          <Plus size={16} />
        </button>
      }
    >
      {open && (
        <form onSubmit={add} className="mb-3 grid grid-cols-2 gap-2">
          <input className="field col-span-2" placeholder="Concepto (renta, luz…)" value={name} onChange={(e) => setName(e.target.value)} />
          <MoneyInput placeholder="Monto" value={amount} onChange={setAmount} />
          <select className="field" value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="fixed">Fijo mensual</option>
            <option value="variable">Variable</option>
          </select>
          {kind === 'fixed' ? (
            <DaySelect className="col-span-2" value={day} onChange={setDay} />
          ) : (
            <DateSelect className="col-span-2" value={date} onChange={setDate} />
          )}
          <button className="col-span-2 rounded-lg bg-white py-2 text-sm font-semibold text-slate-900">Guardar</button>
        </form>
      )}
      {visible.length === 0 ? (
        <p className="text-sm text-white/50">Sin gastos este mes.</p>
      ) : (
        <ul className="divide-y divide-white/10">
          {visible.map((e) => (
            <li key={e.id} className={`flex items-center justify-between gap-2 py-2 text-sm ${e.due && e.due < today ? 'opacity-60' : ''}`}>
              <div>
                <div>{e.name}</div>
                <div className="text-xs text-white/50">
                  {KIND_LABEL[e.kind]}
                  {e.kind === 'variable' && e.date ? ` · ${dateLabel(e.date)}` : <DueLabel date={e.due} today={today} />}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{formatMoney(e.amount)}</span>
                <button className="p-1 text-white/40 hover:text-white" onClick={() => deleteDoc(doc(db, path, e.id))} aria-label="Eliminar">
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
