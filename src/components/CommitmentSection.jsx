import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { commitmentEnd, dateKey, dueDate, formatMoney, monthLabel, paymentNumber, remainingBalance } from '../lib/finance.js'
import { db } from '../lib/firebase.js'
import { DaySelect, DueLabel, MonthSelect, MoneyInput, Section } from './ui.jsx'

const TYPE_LABEL = { credit: 'Crédito', msi: 'Meses' }

export default function CommitmentSection({ path, items, month, title }) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState('msi')
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [months, setMonths] = useState('')
  const [startMonth, setStartMonth] = useState(month)
  const [day, setDay] = useState('')
  const [editing, setEditing] = useState(null)
  const today = dateKey()
  const active = items
    .filter((c) => paymentNumber(c, month) > 0)
    .map((c) => ({ ...c, due: dueDate(c, month) }))
    .sort((a, b) => (a.due || '9').localeCompare(b.due || '9'))

  function toggle() {
    if (!open || editing) {
      setEditing(null)
      setType('msi')
      setName('')
      setAmount('')
      setMonths('')
      setStartMonth(month)
      setDay('')
      setOpen(true)
    } else setOpen(false)
  }

  function startEdit(c) {
    setEditing(c.id)
    setType(c.type)
    setName(c.name)
    setAmount(String(c.type === 'msi' && c.months ? Math.round(c.monthly * c.months * 100) / 100 : c.monthly))
    setMonths(c.months ? String(c.months) : '')
    setStartMonth(c.startMonth)
    setDay(c.day ? String(c.day) : '')
    setOpen(true)
  }

  async function save(e) {
    e.preventDefault()
    const n = Number(months) || 0
    const value = Number(amount)
    if (!name.trim() || !(value > 0) || (type === 'msi' && !n)) return
    const monthly = type === 'msi' ? Math.round((value / n) * 100) / 100 : value
    const data = {
      name: name.trim(),
      type,
      monthly,
      months: n || null,
      startMonth,
      day: Number(day) || null,
    }
    if (editing) await updateDoc(doc(db, path, editing), { ...data, updatedAt: serverTimestamp() })
    else await addDoc(collection(db, path), { ...data, createdAt: serverTimestamp() })
    setEditing(null)
    setName('')
    setAmount('')
    setMonths('')
    setDay('')
    setOpen(false)
  }

  return (
    <Section
      title={title}
      action={
        <button className="rounded-full bg-white/15 p-1.5 hover:bg-white/25" onClick={toggle} aria-label="Agregar compromiso">
          <Plus size={16} />
        </button>
      }
    >
      {open && (
        <form onSubmit={save} className="mb-3 grid grid-cols-2 gap-2">
          <div className="col-span-2 flex gap-1 rounded-lg bg-black/20 p-1 text-sm">
            {Object.entries({ msi: 'Compra a meses', credit: 'Crédito / préstamo' }).map(([k, label]) => (
              <button type="button" key={k} onClick={() => setType(k)} className={`flex-1 rounded-md py-1.5 ${type === k ? 'bg-white text-slate-900' : 'text-white/70'}`}>
                {label}
              </button>
            ))}
          </div>
          <input className="field col-span-2" placeholder={type === 'msi' ? 'Qué compraste (Amazon, pantalla…)' : 'Crédito (carro…)'} value={name} onChange={(e) => setName(e.target.value)} />
          <MoneyInput placeholder={type === 'msi' ? 'Precio total' : 'Mensualidad'} value={amount} onChange={setAmount} />
          <input type="number" min="1" className="field" placeholder={type === 'msi' ? 'Meses' : 'Meses (opcional)'} value={months} onChange={(e) => setMonths(e.target.value)} />
          <div className="col-span-2 space-y-1">
            <div className="text-xs text-white/60">Primer pago</div>
            <MonthSelect value={startMonth} onChange={setStartMonth} />
          </div>
          <DaySelect className="col-span-2" value={day} onChange={setDay} />
          <button className="col-span-2 rounded-lg bg-white py-2 text-sm font-semibold text-slate-900">{editing ? 'Guardar cambios' : 'Guardar'}</button>
        </form>
      )}
      {active.length === 0 ? (
        <p className="text-sm text-white/50">Sin pagos a meses este mes.</p>
      ) : (
        <ul className="divide-y divide-white/10">
          {active.map((c) => {
            const end = commitmentEnd(c)
            const left = remainingBalance(c, month)
            return (
              <li key={c.id} className={`flex items-center justify-between gap-2 py-2 text-sm ${c.due && c.due < today ? 'opacity-60' : ''}`}>
                <div>
                  <div>
                    {c.name} <span className="text-xs text-white/50">· {TYPE_LABEL[c.type]}</span>
                  </div>
                  <div className="text-xs text-white/50">
                    {c.months ? `Pago ${paymentNumber(c, month)} de ${c.months} · termina ${monthLabel(end, { month: 'short', year: 'numeric' })}` : 'Sin fecha de término'}
                    <DueLabel date={c.due} today={today} />
                    {left != null && ` · restan ${formatMoney(left)}`}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{formatMoney(c.monthly)}</span>
                  <button className="p-1 text-white/40 hover:text-white" onClick={() => startEdit(c)} aria-label="Editar">
                    <Pencil size={14} />
                  </button>
                  <button className="p-1 text-white/40 hover:text-white" onClick={() => deleteDoc(doc(db, path, c.id))} aria-label="Eliminar">
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Section>
  )
}
