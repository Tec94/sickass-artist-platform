import { useState } from 'react'
import AppScaffold from './AppScaffold'
import { usePhoneOverlay } from '../../PhoneOverlayProvider'

type CalcState = {
  display: string
  operand: number | null
  operator: '+' | '-' | 'x' | '/' | null
  waitingForNext: boolean
}

const initialCalc: CalcState = { display: '0', operand: null, operator: null, waitingForNext: false }

const applyOp = (a: number, b: number, op: CalcState['operator']) => {
  if (op === '+') return a + b
  if (op === '-') return a - b
  if (op === 'x') return a * b
  if (op === '/') return b === 0 ? null : a / b
  return b
}

export default function CalculatorApp() {
  const { locale } = usePhoneOverlay()
  const [state, setState] = useState<CalcState>(initialCalc)

  const pressDigit = (digit: string) => {
    setState((current) => {
      if (current.waitingForNext) return { ...current, display: digit, waitingForNext: false }
      return { ...current, display: current.display === '0' ? digit : `${current.display}${digit}` }
    })
  }

  const pressDot = () => setState((current) => (current.display.includes('.') ? current : { ...current, display: `${current.display}.` }))

  const pressOp = (operator: CalcState['operator']) => {
    setState((current) => {
      const input = Number(current.display)
      if (!Number.isFinite(input)) return initialCalc
      if (current.operand === null) {
        return { ...current, operand: input, operator, waitingForNext: true }
      }
      const next = applyOp(current.operand, input, current.operator)
      if (next === null) return { ...initialCalc, display: 'Error' }
      return { display: String(Number(next.toFixed(8))), operand: next, operator, waitingForNext: true }
    })
  }

  const pressEquals = () => {
    setState((current) => {
      if (current.operator === null || current.operand === null) return current
      const next = applyOp(current.operand, Number(current.display), current.operator)
      if (next === null) return { ...initialCalc, display: 'Error' }
      return { display: String(Number(next.toFixed(8))), operand: null, operator: null, waitingForNext: true }
    })
  }

  const pressUtility = (key: 'AC' | '+/-' | '%') => {
    setState((current) => {
      if (key === 'AC') return initialCalc
      const value = Number(current.display)
      if (!Number.isFinite(value)) return initialCalc
      if (key === '+/-') return { ...current, display: String(value * -1) }
      return { ...current, display: String(value / 100) }
    })
  }

  const rows = [
    ['AC', '+/-', '%', '/'],
    ['7', '8', '9', 'x'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '='],
  ]

  return (
    <AppScaffold title={locale === 'es' ? 'Calculadora' : 'Calculator'} subtitle={locale === 'es' ? 'Utilidad' : 'Utility'}>
      <div className="flex h-full flex-col">
        <div className="mb-3 rounded-2xl border border-white/10 bg-black/30 px-3 py-5 text-right">
          <div className="min-h-[42px] text-3xl font-light tracking-tight text-white">{state.display}</div>
        </div>
        <div className="grid flex-1 grid-cols-4 gap-2">
          {rows.flat().map((key) => {
            const isOperator = ['/', 'x', '-', '+', '='].includes(key)
            const isUtility = ['AC', '+/-', '%'].includes(key)
            const span = key === '0' ? 'col-span-2' : ''
            return (
              <button
                key={key}
                type="button"
                className={`${span} rounded-2xl py-3 text-sm font-medium ${
                  isOperator
                    ? 'border border-orange-700/60 bg-orange-500/90 text-white'
                    : isUtility
                      ? 'border border-zinc-600/70 bg-zinc-400 text-black'
                      : 'border border-white/10 bg-zinc-800 text-white'
                }`}
                onClick={() => {
                  if (isUtility) pressUtility(key as 'AC' | '+/-' | '%')
                  else if (isOperator && key !== '=') pressOp(key as '/' | 'x' | '-' | '+')
                  else if (key === '=') pressEquals()
                  else if (key === '.') pressDot()
                  else pressDigit(key)
                }}
              >
                {key}
              </button>
            )
          })}
        </div>
      </div>
    </AppScaffold>
  )
}

