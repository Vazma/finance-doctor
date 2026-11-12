import { describe, expect, it } from 'vitest'
import {
  addMonths,
  dueDate,
  upcomingPayments,
  commitmentEnd,
  commitmentPayment,
  monthTotals,
  monthsBetween,
  remainingBalance,
  splitByIncome,
} from './finance.js'

describe('months', () => {
  it('adds across years', () => {
    expect(addMonths('2026-11', 3)).toBe('2027-02')
    expect(addMonths('2026-01', -1)).toBe('2025-12')
    expect(monthsBetween('2026-11', '2027-02')).toBe(3)
  })
})

describe('splitByIncome', () => {
  it('splits rent proportionally to gross income', () => {
    expect(splitByIncome(20000, { ella: 60000, el: 50000 })).toEqual({ ella: 10909.09, el: 9090.91 })
  })
  it('splits equally without incomes', () => {
    expect(splitByIncome(100, { a: 0, b: 0 })).toEqual({ a: 50, b: 50 })
  })
})

describe('commitments', () => {
  const car = { monthly: 11000, months: 48, startMonth: '2026-01' }
  it('charges only while active', () => {
    expect(commitmentPayment(car, '2025-12')).toBe(0)
    expect(commitmentPayment(car, '2026-01')).toBe(11000)
    expect(commitmentPayment(car, '2029-12')).toBe(11000)
    expect(commitmentPayment(car, '2030-01')).toBe(0)
    expect(commitmentEnd(car)).toBe('2029-12')
  })
  it('computes remaining balance', () => {
    expect(remainingBalance(car, '2026-01')).toBe(48 * 11000)
    expect(remainingBalance(car, '2026-03')).toBe(46 * 11000)
  })
})

describe('monthTotals', () => {
  it('adds fixed, month variable and active commitments', () => {
    const t = monthTotals(
      {
        expenses: [
          { kind: 'fixed', amount: 20000 },
          { kind: 'variable', amount: 3000, month: '2026-12' },
          { kind: 'variable', amount: 999, month: '2026-11' },
        ],
        commitments: [{ monthly: 1500, months: 6, startMonth: '2026-10' }],
      },
      '2026-12',
    )
    expect(t).toEqual({ fixed: 20000, variable: 3000, committed: 1500, total: 24500 })
  })
})

describe('due dates', () => {
  it('clamps the payment day to the month length', () => {
    expect(dueDate({ kind: 'fixed', day: 31 }, '2027-02')).toBe('2027-02-28')
    expect(dueDate({ kind: 'fixed' }, '2027-02')).toBe(null)
  })

  it('skips commitments outside their active months', () => {
    const c = { startMonth: '2026-11', months: 2, monthly: 500, day: 15 }
    expect(dueDate(c, '2026-12')).toBe('2026-12-15')
    expect(dueDate(c, '2027-01')).toBe(null)
  })

  it('lists payments due in the next 7 days across the month boundary', () => {
    const items = [
      { kind: 'fixed', name: 'Renta', amount: 20000, day: 1 },
      { kind: 'fixed', name: 'Luz', amount: 800, day: 15 },
      { kind: 'variable', name: 'Súper', amount: 1200, month: '2026-11', date: '2026-11-28' },
      { name: 'Pantalla', startMonth: '2026-10', months: 6, monthly: 1000, day: 30 },
    ]
    const up = upcomingPayments(items, '2026-11-27')
    expect(up.map((u) => [u.item.name, u.date, u.inDays, u.amount])).toEqual([
      ['Súper', '2026-11-28', 1, 1200],
      ['Pantalla', '2026-11-30', 3, 1000],
      ['Renta', '2026-12-01', 4, 20000],
    ])
  })
})
