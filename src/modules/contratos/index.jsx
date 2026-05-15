import ModuleLayout          from '../../shared/components/ModuleLayout'
import ContratoTable         from './ContratoTable'
import RenovacionTable       from './RenovacionTable'
import ContratoFiltradoTable from './ContratoFiltradoTable'

const CRUD_CARDS = [
  { id: 'contratos', label: 'Todos los Contratos',     emoji: '📄', desc: 'Gestión completa de contratos',      color: '#fd7e14' },
  { id: 'vigentes',  label: 'Contratos Vigentes',      emoji: '✅', desc: 'Contratos activos y en curso',        color: '#198754' },
  { id: 'vencidos',  label: 'Contratos Vencidos',      emoji: '⛔', desc: 'Contratos expirados o rescindidos',  color: '#dc3545' },
  { id: 'renovacion',label: 'Renovación de Contratos', emoji: '🔄', desc: 'Historial de renovaciones',          color: '#0d6efd' },
]

const SUB_VIEWS = {
  contratos:  (color) => <ContratoTable         moduleColor={color} />,
  vigentes:   (color) => <ContratoFiltradoTable moduleColor={color} tipo="VIGENTE" />,
  vencidos:   (color) => <ContratoFiltradoTable moduleColor={color} tipo="VENCIDO" />,
  renovacion: (color) => <RenovacionTable       moduleColor={color} />,
}

export default function ContratosModule({ mod, activeSubModule, setActiveSubModule }) {
  const renderSub = SUB_VIEWS[activeSubModule]
  return (
    <ModuleLayout mod={mod} activeSubModule={activeSubModule} setActiveSubModule={setActiveSubModule} onNew={() => {}}>
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
      {activeSubModule && (renderSub ? renderSub(mod?.color) : (
        <div className="text-center py-5 text-muted">
          <span style={{ fontSize: 32 }}>🚧</span><p className="mt-2">Módulo en construcción.</p>
        </div>
      ))}
    </ModuleLayout>
  )
}