import { MODULES } from '../data/modules'

export default function Topbar({ activeModule, activeSubModule, onToggleSidebar }) {
  const mod = MODULES.find(m => m.id === activeModule)
  const sub = mod?.submodules.find(s => s.id === activeSubModule)

  return (
    <nav className="cms-topbar navbar navbar-expand px-3 d-flex align-items-center gap-2">
      {/* Toggle + Brand */}
      <div className="d-flex align-items-center gap-2">
        <button className="btn btn-sm btn-outline-secondary border-0" onClick={onToggleSidebar}>
          <i className="bi bi-list fs-5" />
        </button>
        <span className="cms-brand-icon">🏢</span>
        <span className="fw-bold" style={{ fontSize: 14 }}>CondominioApp</span>
        <span className="badge text-bg-primary" style={{ fontSize: 10 }}>CMS v1.0</span>
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

      {/* Right side */}
      <div className="ms-auto d-flex align-items-center gap-2">
        {/* Search */}
        <div className="input-group input-group-sm cms-topbar-search d-none d-lg-flex">
          <span className="input-group-text bg-white border-end-0">
            <i className="bi bi-search text-muted" style={{ fontSize: 12 }} />
          </span>
          <input
            type="text"
            className="form-control border-start-0 ps-1"
            placeholder="Buscar..."
          />
        </div>

        {/* Notifications */}
        <button className="btn btn-sm btn-outline-secondary border-0 position-relative">
          <i className="bi bi-bell fs-6" />
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger cms-notif-badge">
            3
          </span>
        </button>

        {/* Settings */}
        <button className="btn btn-sm btn-outline-secondary border-0">
          <i className="bi bi-gear fs-6" />
        </button>

        {/* User */}
        <div className="d-flex align-items-center gap-2 border rounded-3 px-2 py-1" style={{ fontSize: 12 }}>
          <div className="cms-user-avatar">JC</div>
          <div className="d-none d-md-flex flex-column lh-1">
            <span className="fw-semibold" style={{ fontSize: 12 }}>Jonathan C.</span>
            <span className="text-muted" style={{ fontSize: 10 }}>Product Owner</span>
          </div>
          <button className="btn btn-sm btn-outline-secondary border-0 p-0 ms-1">
            <i className="bi bi-box-arrow-right" />
          </button>
        </div>
      </div>
    </nav>
  )
}
