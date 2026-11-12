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
