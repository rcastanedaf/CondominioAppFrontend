import ModuleLayout        from '../../shared/components/ModuleLayout'
import UsuarioTable        from './UsuarioTable'
import LogAuditoriaTable   from './LogAuditoriaTable'

const CRUD_CARDS = [
  { id: 'usuarios',  label: 'Usuarios del Sistema', emoji: '👤', desc: 'Gestión de cuentas de acceso', color: '#6610f2' },
  { id: 'auditoria', label: 'Log de Auditoría',      emoji: '🔍', desc: 'Bitácora de acciones del sistema', color: '#0d6efd' },
]

const SUB_VIEWS = {
  'usuarios':  (color) => <UsuarioTable      moduleColor={color} />,
  'auditoria': (color) => <LogAuditoriaTable moduleColor={color} />,
}

export default function SistemaModule({ mod, activeSubModule, setActiveSubModule }) {
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