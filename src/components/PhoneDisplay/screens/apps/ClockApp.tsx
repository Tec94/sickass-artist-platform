import { useMemo, useState } from 'react'
import AppScaffold from './AppScaffold'
import { usePhoneOverlay } from '../../PhoneOverlayProvider'

type Alarm = { id: string; time: string; label: string; enabled: boolean }

export default function ClockApp() {
  const { locale, setModal } = usePhoneOverlay()
  const [alarms, setAlarms] = useState<Alarm[]>([
    { id: 'a1', time: '06:00', label: 'Studio prep', enabled: false },
    { id: 'a2', time: '09:35', label: 'Team check-in', enabled: true },
    { id: 'a3', time: '11:10', label: 'Content review', enabled: true },
    { id: 'a4', time: '19:00', label: 'Drop post', enabled: false },
    { id: 'a5', time: '23:00', label: 'Night mix pass', enabled: true },
  ])

  const nextAlarm = useMemo(() => alarms.find((alarm) => alarm.enabled), [alarms])

  return (
    <AppScaffold
      title={locale === 'es' ? 'Reloj' : 'Clock'}
      subtitle={nextAlarm ? `${locale === 'es' ? 'Proxima' : 'Next'} ${nextAlarm.time}` : locale === 'es' ? 'Sin alarmas activas' : 'No active alarms'}
      toolbar={
        <button
          type="button"
          className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-white"
          onClick={() =>
            setModal({
              id: 'clock-add-alarm',
              title: locale === 'es' ? 'Agregar alarma (V1)' : 'Add alarm (V1)',
              body: locale === 'es' ? 'Edicion simplificada. Se agregara editor completo despues.' : 'Simplified editor. Full editor can be added later.',
            })
          }
        >
          <iconify-icon icon="solar:add-circle-linear" width="14" height="14" />
        </button>
      }
    >
      <div className="space-y-2">
        {alarms.map((alarm) => (
          <div key={alarm.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0e131a]/70 p-3">
            <div>
              <div className="text-lg font-light text-white">{alarm.time}</div>
              <div className="text-[11px] text-zinc-400">{alarm.label}</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={alarm.enabled}
              className={`relative h-7 w-12 rounded-full border transition-colors ${alarm.enabled ? 'border-green-700/70 bg-green-500/80' : 'border-white/10 bg-zinc-700'}`}
              onClick={() => setAlarms((current) => current.map((item) => (item.id === alarm.id ? { ...item, enabled: !item.enabled } : item)))}
            >
              <span className={`absolute top-0.5 h-5.5 w-5.5 rounded-full bg-white transition-transform ${alarm.enabled ? 'translate-x-[24px]' : 'translate-x-0.5'}`} />
            </button>
          </div>
        ))}
      </div>
    </AppScaffold>
  )
}

