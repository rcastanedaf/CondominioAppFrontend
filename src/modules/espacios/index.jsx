import ModuleLayout       from '../../shared/components/ModuleLayout'
import EspacioComunTable  from './EspacioComunTable'
import ReservaTable       from './ReservaTable'
import CobroReservaTable from './CobroReservaTable'

const CRUD_CARDS = [
  { id: 'catalogo-espacios', label: 'Catálogo de Espacios', emoji: '🏊', desc: 'Piscina, salón, gimnasio, etc.', color: '#fd7e14' },
  { id: 'reservas',          label: 'Reservas',             emoji: '📅', desc: 'Gestión de reservas activas',    color: '#0d6efd' },
  { id: 'cobro-reservas', label: 'Cobro de Reservas', emoji: '💳', desc: 'Gestión de cobros por uso de espacios', color: '#20c997' },
]

const SUB_VIEWS = {
  'catalogo-espacios': (color) => <EspacioComunTable moduleColor={color} />,
  'reservas':          (color) => <ReservaTable       moduleColor={color} />,
  'cobro-reservas': (color) => <CobroReservaTable moduleColor={color} />,
}

export default function EspaciosModule({ mod, activeSubModule, setActiveSubModule }) {
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