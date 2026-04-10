/**
 * Layout estándar para todos los módulos.
 * Incluye: tabs de sub-módulos, título, botón "Nuevo" y slot para contenido.
 *
 * Props:
 *  - mod              {Object}   Definición del módulo (de modules.js)
 *  - activeSubModule  {string}
 *  - setActiveSubModule {Function}
 *  - onNew            {Function} Callback del botón "+ Nuevo"
 *  - children         {ReactNode} Contenido (normalmente un <DataTable />)
 */
export default function ModuleLayout({
  mod,
  activeSubModule,
  setActiveSubModule,
  onNew,
  children,
}) {
  const currentLabel = activeSubModule
    ? mod?.submodules.find(s => s.id === activeSubModule)?.label
    : mod?.label

  return (
    <main className="cms-main">
      {/* Sub-module tabs */}
      <div className="cms-submod-tabs">
        <button
          className={`cms-tab-btn ${!activeSubModule ? 'active' : ''}`}
          onClick={() => setActiveSubModule(null)}
          style={{ '--mod-color': mod?.color }}
        >
          <i className={`bi ${mod?.icon} me-1`} style={{ fontSize: 13 }} />
          General
        </button>
        {mod?.submodules.map(sub => (
          <button
            key={sub.id}
            className={`cms-tab-btn ${activeSubModule === sub.id ? 'active' : ''}`}
            onClick={() => setActiveSubModule(sub.id)}
            style={{ '--mod-color': mod?.color }}
          >
            {sub.label}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="cms-content-area">
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <h5 className="mb-0 fw-bold" style={{ color: mod?.color }}>
            {currentLabel}
          </h5>
        </div>

        {/* Slot de contenido del módulo */}
        {children}
      </div>
    </main>
  )
}
