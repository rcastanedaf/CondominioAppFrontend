import { MODULES } from '../data/modules'

export default function Topbar({ activeModule, activeSubModule, onToggleSidebar, user, onLogout }) {
  const mod = MODULES.find(m => m.id === activeModule)
  const sub = mod?.submodules.find(s => s.id === activeSubModule)

  return (
    <div>
    <nav className="cms-topbar navbar navbar-expand px-3 d-flex align-items-center gap-2">
      {/* Toggle + Brand */}
      <div className="d-flex align-items-center gap-2">
        <button className="btn btn-sm btn-outline-secondary border-0" onClick={onToggleSidebar}>
          <i className="bi bi-list fs-5" />
        </button>
        <span className="fw-bold" style={{ fontSize: 14 }}>Condominio</span>
      </div>

      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="d-none d-md-flex align-items-center ms-2">
        <ol className="breadcrumb mb-0" style={{ fontSize: 12 }}>
          <li className="breadcrumb-item text-muted">Inicio</li>
          <li className="breadcrumb-item active fw-semibold" style={{ color: mod?.color }}>
            {mod?.label}
          </li>
          {sub && (
            <li className="breadcrumb-item active text-muted">{sub.label}</li>
          )}
        </ol>
      </nav>
    </nav>
    {user && (
      <div className="d-flex align-items-center gap-2 ms-auto">
        <span className="small text-muted">
          <i className="bi bi-person-circle me-1" />
          {user.username || user.nombres}
        </span>
        <button className="btn btn-sm btn-outline-secondary" onClick={onLogout}>
          <i className="bi bi-box-arrow-right me-1" />Salir
        </button>
      </div>
    )}
    </div>
    
  )
}
