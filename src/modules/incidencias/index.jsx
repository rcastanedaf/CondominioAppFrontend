import { useRef } from 'react'
import ModuleLayout       from '../../shared/components/ModuleLayout'
import IncidenciaDetalle  from './IncidenciaDetalle'

export default function IncidenciasModule({ mod, activeSubModule, setActiveSubModule }) {
  const taskHandlersRef = useRef({})

  const registerTaskHandler = (taskName, fn) => {
    taskHandlersRef.current[taskName] = fn
  }

    const CRUD_CARDS = [
    { id: 'incidencias',             label: 'Registro de Incidencias',        emoji: '🏦', desc: 'Gestión de Bancos',               color: '#0d6efd' },
    { id: 'seguimiento',       label: 'Seguimiento',  emoji: '📉', desc: 'Gestión de Concepto Descuento',   color: '#198754' },
    { id: 'categoria-incidencia',       label: 'Categoria Incidencias', emoji: '💰', desc: 'Gestión de Metodo de Pago',       color: '#fd7e14' },
  ]
  
    const SUB_MODULE_VIEWS = {
      'incidencias':              (moduleColor) => <IncidenciaDetalle moduleColor={moduleColor} />,
      'seguimiento': (color) => <IncidenciaDetalle moduleColor={color} />,
      'categoria-incidencia':        (color) => <IncidenciaDetalle moduleColor={color} />,
    }
    const renderSubModule = SUB_MODULE_VIEWS[activeSubModule]

  return (
    <ModuleLayout
      mod={mod}
      activeSubModule={activeSubModule}
      setActiveSubModule={setActiveSubModule}
      onNew={() => taskHandlersRef.current['Nueva incidencia']?.()}
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
