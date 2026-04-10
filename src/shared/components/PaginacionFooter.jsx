import { PAGE_SIZE_OPTIONS } from '../hooks/usePaginacion'

/**
 * Barra completa: título + botón nuevo (arriba) / buscador + selector (abajo)
 * + footer con info y botones de página.
 *
 * Props:
 *  — Header —
 *  titulo        {string}    Ej. 'Encabezado de Facturas'
 *  icono         {string}    Clase bootstrap icon. Ej. 'bi-receipt-cutoff'
 *  labelBoton    {string}    Ej. 'Nueva Factura'
 *  onNuevo       {Function}
 *  moduleColor   {string}
 *  — Filtro —
 *  filtro        {string}
 *  setFiltro     {Function}
 *  placeholder   {string}    Ej. 'Filtrar...'
 *  — Paginación —
 *  paginaSegura  {number}
 *  totalPaginas  {number}
 *  porPagina     {number}
 *  setPorPagina  {Function}
 *  irA           {Function}
 *  paginas       {Function}
 *  totalDatos    {number}    Total después del filtro
 *  label         {string}    Ej. 'registros', 'facturas'
 */
export default function PaginacionFooter({
// — Header (nuevo) —
  titulo,
  icono,
  labelBoton,
  onNuevo,
  moduleColor  = '#0d6efd',

  // filtro
  filtro       = '',
  setFiltro,
  placeholder  = 'Filtrar...',
  // paginación
  paginaSegura,
  totalPaginas,
  porPagina,
  setPorPagina,
  irA,
  paginas,
  totalDatos   = 0,
  label        = 'registros',
}) {
  const desde = totalDatos === 0 ? 0 : (paginaSegura - 1) * porPagina + 1
  const hasta  = Math.min(paginaSegura * porPagina, totalDatos)

  return (
    <>
      {/* ── Header: título + botón nuevo ── */}
      {(titulo || labelBoton) && (
        <div
          className="d-flex align-items-center justify-content-between px-3 py-2 bg-white"
          style={{ borderBottom: '1px solid #dee2e6' }}
        >
          {titulo && (
            <span className="fw-bold" style={{ color: moduleColor }}>
              {icono && <i className={`bi ${icono} me-2`} />}
              {titulo}
            </span>
          )}
          {labelBoton && onNuevo && (
            <button className="btn btn-sm btn-primary" onClick={onNuevo}>
              <i className="bi bi-plus-lg me-1" />
              {labelBoton}
            </button>
          )}
        </div>
      )}
      {/* ── Barra: buscador + selector ── */}
      {setFiltro && (
        <div
          className="d-flex align-items-center justify-content-between gap-2 px-3 py-2 bg-white"
          style={{ borderBottom: '1px solid #dee2e6' }}
        >
          {/* Buscador */}
          <div className="input-group input-group-sm" style={{ maxWidth: 320 }}>
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search text-muted" style={{ fontSize: 11 }} />
            </span>
            <input
              className="form-control border-start-0"
              placeholder={placeholder}
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
            />
            {filtro && (
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setFiltro('')}
              >
                <i className="bi bi-x" />
              </button>
            )}
          </div>

          {/* Selector registros por página */}
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted" style={{ fontSize: 12 }}>Mostrar</span>
            <select
              className="form-select form-select-sm"
              style={{ width: 75 }}
              value={porPagina}
              onChange={e => setPorPagina(Number(e.target.value))}
            >
              {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* ── Footer: info + botones ── */}
      <div
        className="d-flex align-items-center justify-content-between flex-wrap gap-2 px-3 py-2 bg-white"
        style={{ borderTop: '1px solid #dee2e6' }}
      >
        <small className="text-muted">
          {totalDatos === 0
            ? `Sin ${label}`
            : `Mostrando ${desde}–${hasta} de ${totalDatos} ${label}`}
        </small>

        <nav>
          <ul className="pagination pagination-sm mb-0">
            <li className={`page-item ${paginaSegura === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => irA(1)}>«</button>
            </li>
            <li className={`page-item ${paginaSegura === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => irA(paginaSegura - 1)}>‹</button>
            </li>

            {paginas().map((p, idx) =>
              p === '...'
                ? <li key={`e${idx}`} className="page-item disabled">
                    <span className="page-link border-0 bg-transparent">…</span>
                  </li>
                : <li key={p} className="page-item">
                    <button
                      className="page-link"
                      style={paginaSegura === p
                        ? { background: moduleColor, borderColor: moduleColor, color: '#fff' }
                        : {}}
                      onClick={() => irA(p)}
                    >
                      {p}
                    </button>
                  </li>
            )}

            <li className={`page-item ${paginaSegura === totalPaginas ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => irA(paginaSegura + 1)}>›</button>
            </li>
            <li className={`page-item ${paginaSegura === totalPaginas ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => irA(totalPaginas)}>»</button>
            </li>
          </ul>
        </nav>
      </div>
    </>
  )
}