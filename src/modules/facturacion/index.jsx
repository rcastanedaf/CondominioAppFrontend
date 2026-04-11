import { useRef }       from 'react'
import ModuleLayout     from '../../shared/components/ModuleLayout'
import DataTable        from '../../shared/components/DataTable'
import FacturaDetalle   from './FacturaDetalle'
import { facturacionRows } from './data'
import TipoServicioTable     from './TipoServicioTable'
import CicloFacturacionTable from './CicloFacturacionTable'

export default function FacturacionModule({ mod, activeSubModule, setActiveSubModule }) {
  // Permite que FacturaDetalle registre handlers para el TaskPanel
  
  const taskHandlersRef = useRef({})
  const registerTaskHandler = (taskName, fn) => {
    taskHandlersRef.current[taskName] = fn
  }

  const handleTask = (taskName) => {
    taskHandlersRef.current[taskName]?.()
  }

  const CRUD_CARDS = [
  { id: 'factura',             label: 'Factura',        emoji: '🏦', desc: 'Gestión de Bancos',               color: '#0d6efd' },
  { id: 'ciclo-factura',       label: 'Ciclo Factura',  emoji: '📉', desc: 'Gestión de Concepto Descuento',   color: '#198754' },
  { id: 'tipo-servicio',       label: 'Tipo de servicio', emoji: '💰', desc: 'Gestión de Metodo de Pago',       color: '#fd7e14' },
]

  const SUB_MODULE_VIEWS = {
    'factura':              (moduleColor) => <FacturaDetalle moduleColor={moduleColor} />,
    'ciclo-factura': (color) => <CicloFacturacionTable moduleColor={color} />,
    'tipo-servicio':        (color) => <TipoServicioTable moduleColor={color} />,
  }
  const renderSubModule = SUB_MODULE_VIEWS[activeSubModule]


  return (
    <ModuleLayout
      mod={mod}
      activeSubModule={activeSubModule}
      setActiveSubModule={setActiveSubModule}
      onNew={() => handleTask('Nueva factura')}
    >
      {/* Pestaña General → tarjetas */}
      {!activeSubModule && (
        <div className="row g-3 mt-1">
          {CRUD_CARDS.map(card => (
            <div key={card.id} className="col-12 col-sm-6 col-lg-4">
              <div
                className="card h-100 border-0 shadow-sm"
                style={{ cursor: 'pointer' }}
                onClick={() => setActiveSubModule(card.id)}
              >
                <div className="card-body d-flex align-items-start gap-3">
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 46, height: 46, background: card.color + '18' }}
                  >
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

      {/* Sub-módulo activo → vista correspondiente */}
      {activeSubModule && (
        renderSubModule
          ? renderSubModule(mod?.color)
          : (
            <div className="text-center py-5 text-muted">
              <span style={{ fontSize: 32 }}>🚧</span>
              <p className="mt-2">Este módulo aún no está conectado al backend.</p>
            </div>
          )
      )}
    </ModuleLayout>
  )
}