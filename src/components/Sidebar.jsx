import { MODULES } from '../data/modules'

export default function Sidebar({ activeModule, setActiveModule, collapsed }) {
  return (
    <aside className={`cms-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <nav className="cms-sidebar-nav">
        {MODULES.map(mod => {
          const isActive = activeModule === mod.id
          return (
            <button
              key={mod.id}
              className={`cms-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveModule(mod.id)}
              title={collapsed ? mod.label : undefined}
              style={{ '--mod-color': mod.color }}
            >
              {isActive && <span className="nav-indicator" />}
              <i className={`bi ${mod.icon} cms-nav-icon`} style={{ color: isActive ? mod.color : undefined }} />
              {!collapsed && (
                <span className="cms-nav-label">{mod.label}</span>
              )}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
