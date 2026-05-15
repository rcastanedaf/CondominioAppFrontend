import ModuleLayout     from '../../shared/components/ModuleLayout'
import EmpleadoTable    from './EmpleadoTable'
import CargoTable       from './CargoTable'
import ProveedorTable   from './ProveedorTable'
import AsistenciaView   from './AsistenciaView'
import HorarioTurnoTable from './HorarioTurnoTable'


const CRUD_CARDS = [
  { id: 'empleados',   label: 'Empleados',          emoji: '👷', desc: 'Gestión de personal del condominio', color: '#20c997' },
  { id: 'cargos',      label: 'Cargos',              emoji: '🏷️', desc: 'Catálogo de cargos y salarios',     color: '#0d6efd' },
  { id: 'asistencia',  label: 'Asistencia',          emoji: '📋', desc: 'Control de entrada y salida',        color: '#fd7e14' },
  { id: 'proveedores', label: 'Proveedores Externos', emoji: '🚛', desc: 'Proveedores y contratistas',        color: '#6f42c1' },
  { id: 'horarios', label: 'Horarios y Turnos', emoji: '🕛', desc: 'Gestión de turnos del personal', color: '#0d6efd' },
]

const SUB_VIEWS = {
  'empleados':   (color) => <EmpleadoTable   moduleColor={color} />,
  'cargos':      (color) => <CargoTable      moduleColor={color} />,
  'asistencia':  (color) => <AsistenciaView  moduleColor={color} />,
  'proveedores': (color) => <ProveedorTable  moduleColor={color} />,
  'horarios': (color) => <HorarioTurnoTable moduleColor={color} />,
}

export default function PersonalModule({ mod, activeSubModule, setActiveSubModule }) {
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