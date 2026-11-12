// Months are "YYYY-MM" keys so they sort and compare as strings.
export function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function addMonths(key, n) {
  const [y, m] = key.split('-').map(Number)
  const total = y * 12 + (m - 1) + n
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`
}

export function monthsBetween(from, to) {
  const [y1, m1] = from.split('-').map(Number)
  const [y2, m2] = to.split('-').map(Number)
  return (y2 - y1) * 12 + (m2 - m1)
}

export function monthLabel(key, opts = { month: 'long', year: 'numeric' }) {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('es-MX', opts)
}

// Commitment = credit (car, loan) or MSI purchase: a fixed monthly payment for `months` months
// starting at `startMonth`. `months` empty/0 means open-ended.
export function paymentNumber(c, month) {
  const idx = monthsBetween(c.startMonth, month)
  if (idx < 0) return 0
  if (c.months && idx >= c.months) return 0
  return idx + 1
}

export function commitmentPayment(c, month) {
  return paymentNumber(c, month) ? Number(c.monthly) || 0 : 0
}

export function commitmentEnd(c) {
  return c.months ? addMonths(c.startMonth, c.months - 1) : null
}

export function remainingBalance(c, month) {
  if (!c.months) return null
  const paid = Math.max(0, Math.min(c.months, monthsBetween(c.startMonth, month)))
  return (c.months - paid) * (Number(c.monthly) || 0)
}

export function expenseAmount(e, month) {
  if (e.kind === 'fixed') return Number(e.amount) || 0
  return e.month === month ? Number(e.amount) || 0 : 0
}

export function monthTotals({ expenses = [], commitments = [] }, month) {
  let fixed = 0
  let variable = 0
  for (const e of expenses) {
    if (e.kind === 'fixed') fixed += expenseAmount(e, month)
    else variable += expenseAmount(e, month)
  }
  const committed = commitments.reduce((s, c) => s + commitmentPayment(c, month), 0)
  return { fixed, variable, committed, total: fixed + variable + committed }
}

// Split proportional to gross income (option A). Equal split when nobody has income set.
export function splitByIncome(total, incomes) {
  const ids = Object.keys(incomes)
  if (!ids.length) return {}
  const sum = ids.reduce((s, id) => s + Math.max(0, Number(incomes[id]) || 0), 0)
  const shares = {}
  let assigned = 0
  ids.forEach((id, i) => {
    if (i === ids.length - 1) {
      shares[id] = round2(total - assigned)
      return
    }
    const ratio = sum > 0 ? Math.max(0, Number(incomes[id]) || 0) / sum : 1 / ids.length
    shares[id] = round2(total * ratio)
    assigned += shares[id]
  })
  return shares
}

export function incomeRatios(incomes) {
  const sum = Object.values(incomes).reduce((s, v) => s + Math.max(0, Number(v) || 0), 0)
  const ids = Object.keys(incomes)
  return Object.fromEntries(ids.map((id) => [id, sum > 0 ? Math.max(0, Number(incomes[id]) || 0) / sum : 1 / ids.length]))
}

export function projection(data, from, count = 12) {
  return Array.from({ length: count }, (_, i) => {
    const month = addMonths(from, i)
    return { month, ...monthTotals(data, month) }
  })
}

function round2(n) {
  return Math.round(n * 100) / 100
}

const mxn = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })
export const formatMoney = (n) => mxn.format(Number(n) || 0)

// Dates are "YYYY-MM-DD" keys. Fixed expenses and commitments may carry a `day` of the month;
// variable expenses carry an exact `date`.
export function dateKey(date = new Date()) {
  return `${monthKey(date)}-${String(date.getDate()).padStart(2, '0')}`
}

export function daysInMonth(key) {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}

export function onDay(month, day) {
  return `${month}-${String(Math.min(Number(day), daysInMonth(month))).padStart(2, '0')}`
}

export function daysBetween(from, to) {
  const utc = (k) => {
    const [y, m, d] = k.split('-').map(Number)
    return Date.UTC(y, m - 1, d)
  }
  return Math.round((utc(to) - utc(from)) / 86400000)
}

export function dateLabel(key, opts = { day: 'numeric', month: 'short' }) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-MX', opts)
}

export function dueDate(item, month) {
  if (item.kind === 'variable') return item.month === month && item.date ? item.date : null
  if (!item.day) return null
  if (item.startMonth && !paymentNumber(item, month)) return null
  return onDay(month, item.day)
}

export function itemAmount(item, month) {
  return item.startMonth ? commitmentPayment(item, month) : expenseAmount(item, month)
}

export function upcomingPayments(items, today, days = 7) {
  const months = [today.slice(0, 7), addMonths(today.slice(0, 7), 1)]
  const out = []
  for (const item of items) {
    for (const month of months) {
      const date = dueDate(item, month)
      if (!date) continue
      const inDays = daysBetween(today, date)
      if (inDays >= 0 && inDays <= days) out.push({ item, date, inDays, amount: itemAmount(item, month) })
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date))
}

export function relativeDay(inDays) {
  if (inDays === 0) return 'hoy'
  if (inDays === 1) return 'mañana'
  return `en ${inDays} días`
}

// Per-item split of the shared month, grouped as fixed / variable / committed.
export function shareRows({ expenses = [], commitments = [] }, month, incomes) {
  const rows = []
  for (const e of expenses) {
    const amount = expenseAmount(e, month)
    if (amount > 0) rows.push({ id: e.id, name: e.name, group: e.kind === 'fixed' ? 'fixed' : 'variable', amount, due: dueDate(e, month) })
  }
  for (const c of commitments) {
    const amount = commitmentPayment(c, month)
    if (amount > 0) rows.push({ id: c.id, name: c.name, group: 'committed', amount, due: dueDate(c, month) })
  }
  return rows.map((r) => ({ ...r, shares: splitByIncome(r.amount, incomes) }))
}

// Months (within the window) where finished commitments stop charging, with the amount freed.
export function freedSchedule(commitments, from, count = 12) {
  const byMonth = {}
  for (const c of commitments) {
    const end = commitmentEnd(c)
    if (!end) continue
    const freed = addMonths(end, 1)
    const offset = monthsBetween(from, freed)
    if (offset < 1 || offset > count) continue
    byMonth[freed] ??= { month: freed, amount: 0, names: [] }
    byMonth[freed].amount += Number(c.monthly) || 0
    byMonth[freed].names.push(c.name)
  }
  return Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month))
}

// Share of gross income already spoken for before the month starts (fixed + installments + shared part).
export function committedRatio(income, committed) {
  return income > 0 ? committed / income : null
}

export function healthLevel(ratio) {
  if (ratio == null) return null
  if (ratio < 0.5) return 'good'
  if (ratio < 0.7) return 'warn'
  return 'bad'
}
