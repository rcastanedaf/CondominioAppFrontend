import ModuleLayout           from '../../shared/components/ModuleLayout'
import RegistroAccesoTable    from './RegistroAccesoTable'
import VisitaAutorizadaTable  from './VisitaAutorizadaTable'
import VehiculoTable          from './VehiculoTable'
import ListaNegraTable        from './ListaNegraTable'

const CRUD_CARDS = [
  { id: 'registro-ingresos', label: 'Registro de Accesos',   emoji: '🚪', desc: 'Ingresos y egresos del día',          color: '#6f42c1' },
  { id: 'visitas',           label: 'Visitas Autorizadas',   emoji: '👤', desc: 'Pre-autorización de visitas',          color: '#0d6efd' },
  { id: 'vehiculos',         label: 'Vehículos',             emoji: '🚗', desc: 'Registro de vehículos de residentes',  color: '#198754' },
  { id: 'lista-negra',       label: 'Lista Negra',           emoji: '🚫', desc: 'Personas o vehículos bloqueados',      color: '#dc3545' },
]

const SUB_VIEWS = {
  'registro-ingresos': (color) => <RegistroAccesoTable   moduleColor={color} />,
  'visitas':           (color) => <VisitaAutorizadaTable  moduleColor={color} />,
  'vehiculos':         (color) => <VehiculoTable          moduleColor={color} />,
  'lista-negra':       (color) => <ListaNegraTable        moduleColor={color} />,
}

export default function AccesoModule({ mod, activeSubModule, setActiveSubModule }) {
  const renderSub = SUB_VIEWS[activeSubModule]
  return (
    <ModuleLayout mod={mod} activeSubModule={activeSubModule} setActiveSubModule={setActiveSubModule} onNew={() => {}}>
      {!activeSubModule && (
        <div className="row g-3 mt-1">
          {CRUD_CARDS.map(card => (
            <div key={card.id} className="col-12 col-sm-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm" style={{ cursor: 'pointer' }} onClick={() => setActiveSubModule(card.id)}>
                <div className="card-body d-flex align-items-start gap-3">
                  <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 46, height: 46, background: card.color + '18' }}>
                    <span style={{ fontSize: 22 }}>{card.emoji}</span>
                  </div>
                  <div>
                    <h6 className="mb-1 fw-semibold">{card.label}</h6>
                    <p className="mb-2 text-muted" style={{ fontSize: 12 }}>{card.desc}</p>
                    <span className="badge" style={{ background: card.color + '18', color: card.color, fontSize: 11 }}>Ver registros →</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {activeSubModule && (renderSub ? renderSub(mod?.color) : (
        <div className="text-center py-5 text-muted"><span style={{ fontSize: 32 }}>🚧</span><p className="mt-2">Módulo en construcción.</p></div>
      ))}
    </ModuleLayout>
  )
}