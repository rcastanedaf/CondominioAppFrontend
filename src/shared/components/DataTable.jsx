import { useState } from 'react'
import { STATUS_MAP, COL_LABELS } from '../constants/tableConfig'

/**
 * Tabla de datos reutilizable para todos los módulos.
 *
 * Props:
 *  - rows       {Array}    Filas de datos
 *  - statusCols {Array}    Columnas que deben renderizarse como badge (default: ['estado','prioridad'])
 *  - onEdit     {Function} Callback al pulsar Editar
 *  - onView     {Function} Callback al pulsar Ver
 *  - moduleColor {string}  Color del módulo activo para la paginación
 */
export default function DataTable({
  rows = [],
  statusCols = ['estado', 'prioridad'],
  onEdit,
  onView,
  moduleColor = '#0d6efd',
}) {
  const [filter, setFilter] = useState('')

  const cols = rows.length > 0 ? Object.keys(rows[0]) : []

  const filtered = rows.filter(row =>
    Object.values(row).some(val =>
      String(val).toLowerCase().includes(filter.toLowerCase())
    )
  )

  return (
    <>
      {/* Toolbar */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
        <div className="d-flex align-items-center gap-2">
          <span className="badge text-bg-light border" style={{ fontSize: 11 }}>
            {filtered.length} registros
          </span>
        </div>
        <div className="d-flex gap-2">
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-white">
              <i className="bi bi-search text-muted" style={{ fontSize: 11 }} />
            </span>
            <input
              className="form-control border-start-0"
              placeholder="Filtrar registros..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
            />
          </div>
          <button className="btn btn-sm btn-outline-secondary">
            <i className="bi bi-download me-1" />
            Exportar
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="cms-table-wrap">
        <table className="table table-hover cms-table">
          <thead>
            <tr>
              {cols.map(col => (
                <th key={col}>{COL_LABELS[col] || col}</th>
              ))}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={cols.length + 1} className="text-center text-muted py-4">
                  <i className="bi bi-inbox me-2" />
                  Sin resultados
                </td>
              </tr>
            ) : (
              filtered.map((row, i) => (
                <tr key={i}>
                  {cols.map(col => (
                    <td key={col} className="align-middle">
                      {statusCols.includes(col) ? (
                        <span className={`badge text-bg-${STATUS_MAP[row[col]] || 'secondary'}`}>
                          {row[col]}
                        </span>
                      ) : col === 'id' ? (
                        <span className="text-muted">{row[col]}</span>
                      ) : row[col]}
                    </td>
                  ))}
                  <td className="align-middle">
                    <div className="d-flex gap-1">
                      <button
                        className="btn btn-sm btn-outline-primary py-0 px-2"
                        onClick={() => onEdit?.(row)}
                      >
                        <i className="bi bi-pencil me-1" style={{ fontSize: 11 }} />
                        Editar
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary py-0 px-2"
                        onClick={() => onView?.(row)}
                      >
                        <i className="bi bi-eye me-1" style={{ fontSize: 11 }} />
                        Ver
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="d-flex align-items-center justify-content-between mt-2">
        <small className="text-muted">
          Mostrando 1–{filtered.length} de {filtered.length} registros
        </small>
        <nav>
          <ul className="pagination pagination-sm mb-0">
            <li className="page-item disabled"><span className="page-link">‹</span></li>
            <li className="page-item active">
              <span className="page-link" style={{ background: moduleColor, borderColor: moduleColor }}>
                1
              </span>
            </li>
            <li className="page-item disabled"><span className="page-link">›</span></li>
          </ul>
        </nav>
      </div>
    </>
  )
}
