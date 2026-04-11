import { useRef }               from 'react'
import ModuleLayout             from '../../shared/components/ModuleLayout'
import PagosResidente           from './PagosResidente'        // ← nuevo
import CuentaCobrarResidente    from './CuentaCobrarResidente' // ← nuevo
import CobroMoraTable           from './CobroMoraTable'
import MultaTable               from './MultaTable'

const CRUD_CARDS = [
  { id: 'pagos',          label: 'Pagos por Residente',  emoji: '💳', desc: 'Historial de pagos por residente',       color: '#0dcaf0' },
  { id: 'cuentas-cobrar', label: 'Cuentas por Cobrar',   emoji: '📋', desc: 'Estado de cuenta y saldo por residente', color: '#fd7e14' },
  { id: 'cobros-mora',    label: 'Cobros de Mora',       emoji: '⚠️', desc: 'Cálculo y gestión de mora',              color: '#dc3545' },
  { id: 'multa',         label: ' Gestion de Multas',               emoji: '🚫', desc: 'Infracciones y multas',                  color: '#6f42c1' },
  { id: 'acuerdos-pago',  label: 'Acuerdos de Pago',    emoji: '🤝', desc: 'Acuerdos y convenios',                   color: '#198754' },
  { id: 'mora',           label: 'Gestión Mora',         emoji: '📊', desc: 'Reportes de mora',                       color: '#fd7e14' },
]

const SUB_VIEWS = {
  'pagos':          (color, ref) => (
    <PagosResidente
      modColor={color}
      onRegisterTaskHandler={(name, fn) => { ref.current[name] = fn }}
    />
  ),
  'cuentas-cobrar': (color) => <CuentaCobrarResidente modColor={color} />,
  'cobros-mora':    (color) => <CobroMoraTable moduleColor={color} />,
  'multa':         (color) => <MultaTable moduleColor={color} />,
}

export default function PagosModule({ mod, activeSubModule, setActiveSubModule }) {
  const taskHandlersRef = useRef({})
  const renderSub = SUB_VIEWS[activeSubModule]

  return (
    <ModuleLayout
      mod={mod}
      activeSubModule={activeSubModule}
      setActiveSubModule={setActiveSubModule}
      onNew={() => taskHandlersRef.current['Registrar pago']?.()}
    >
      {!activeSubModule && (
        <div className="row g-3 mt-1">
          {CRUD_CARDS.map(card => (
            <div key={card.id} className="col-12 col-sm-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm" style={{ cursor: 'pointer' }}
                onClick={() => setActiveSubModule(card.id)}>
                <div className="card-body d-flex align-items-start gap-3">
                  <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 46, height: 46, background: card.color + '18' }}>
                    <span style={{ fontSize: 22 }}>{card.emoji}</span>
                  </div>
                  <div>
                    <h6 className="mb-1 fw-semibold">{card.label}</h6>
                    <p className="mb-2 text-muted" style={{ fontSize: 12 }}>{card.desc}</p>
                    <span className="badge" style={{ background: card.color + '18', color: card.color, fontSize: 11 }}>
                      Ver registros →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSubModule && (
        renderSub
          ? renderSub(mod?.color, taskHandlersRef)
          : (
            <div className="text-center py-5 text-muted">
              <span style={{ fontSize: 32 }}>🚧</span>
              <p className="mt-2">Módulo en construcción.</p>
            </div>
          )
      )}
    </ModuleLayout>
  )
}