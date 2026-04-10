import { MODULES } from '../data/modules'

const MOCK_ROWS = {
  catalogos: [
    { id: 1, nombre: 'Apartamento', descripcion: 'Unidad tipo apartamento', estado: 'Activo' },
    { id: 2, nombre: 'Casa', descripcion: 'Unidad tipo casa', estado: 'Activo' },
    { id: 3, nombre: 'Local Comercial', descripcion: 'Espacio comercial', estado: 'Activo' },
    { id: 4, nombre: 'Bodega', descripcion: 'Área de almacenamiento', estado: 'Inactivo' },
  ],
  residentes: [
    { id: 1, nombre: 'María González', tipo: 'Propietaria', unidad: 'Apto 101', telefono: '5555-0001', estado: 'Activo' },
    { id: 2, nombre: 'Carlos Pérez', tipo: 'Arrendatario', unidad: 'Apto 202', telefono: '5555-0002', estado: 'Activo' },
    { id: 3, nombre: 'Ana Martínez', tipo: 'Residente', unidad: 'Casa 5', telefono: '5555-0003', estado: 'Activo' },
    { id: 4, nombre: 'Luis Rodríguez', tipo: 'Propietario', unidad: 'Apto 305', telefono: '5555-0004', estado: 'Inactivo' },
  ],
  contratos: [
    { id: 1, residente: 'Carlos Pérez', propiedad: 'Apto 202', inicio: '01/01/2025', fin: '31/12/2025', monto: 'Q 2,500', estado: 'Vigente' },
    { id: 2, residente: 'Sofía Lima', propiedad: 'Casa 3', inicio: '01/06/2024', fin: '31/05/2025', monto: 'Q 3,200', estado: 'Vencido' },
  ],
  acceso: [
    { id: 1, persona: 'Juan Visitante', tipo: 'Visita', unidad: 'Apto 101', entrada: '08:30', salida: '10:00', fecha: '06/04/2026' },
    { id: 2, persona: 'Carlos Pérez', tipo: 'Residente', unidad: 'Apto 202', entrada: '07:15', salida: '—', fecha: '06/04/2026' },
    { id: 3, persona: 'Repartidor DHL', tipo: 'Proveedor', unidad: 'Apto 104', entrada: '11:00', salida: '11:10', fecha: '06/04/2026' },
  ],
  facturacion: [
    { id: 1, no: 'F-0001', residente: 'María González', concepto: 'Cuota mensual', monto: 'Q 850.00', fecha: '01/04/2026', estado: 'Pendiente' },
    { id: 2, no: 'F-0002', residente: 'Carlos Pérez', concepto: 'Cuota mensual', monto: 'Q 650.00', fecha: '01/04/2026', estado: 'Pagada' },
    { id: 3, no: 'F-0003', residente: 'Ana Martínez', concepto: 'Cuota mensual', monto: 'Q 750.00', fecha: '01/04/2026', estado: 'Vencida' },
    { id: 4, no: 'F-0004', residente: 'Luis Rodríguez', concepto: 'Mantenimiento', monto: 'Q 200.00', fecha: '01/04/2026', estado: 'Pendiente' },
  ],
  pagos: [
    { id: 1, residente: 'Carlos Pérez', factura: 'F-0002', monto: 'Q 650.00', fecha: '03/04/2026', metodo: 'Transferencia', estado: 'Aplicado' },
    { id: 2, residente: 'Ana Martínez', factura: 'F-0003', monto: 'Q 750.00', fecha: '05/04/2026', metodo: 'Efectivo', estado: 'Pendiente' },
  ],
  espacios: [
    { id: 1, nombre: 'Salón de Eventos', capacidad: '80 personas', tarifa: 'Q 500.00', estado: 'Disponible' },
    { id: 2, nombre: 'Piscina', capacidad: '20 personas', tarifa: 'Q 150.00', estado: 'Mantenimiento' },
    { id: 3, nombre: 'Cancha Deportiva', capacidad: '22 personas', tarifa: 'Q 100.00', estado: 'Disponible' },
    { id: 4, nombre: 'Área BBQ', capacidad: '30 personas', tarifa: 'Q 200.00', estado: 'Disponible' },
  ],
  personal: [
    { id: 1, nombre: 'Roberto Cifuentes', cargo: 'Seguridad', turno: 'Diurno', telefono: '5555-1001', estado: 'Activo' },
    { id: 2, nombre: 'Elena Súchite', cargo: 'Limpieza', turno: 'Mixto', telefono: '5555-1002', estado: 'Activo' },
    { id: 3, nombre: 'Marco López', cargo: 'Mantenimiento', turno: 'Diurno', telefono: '5555-1003', estado: 'Activo' },
  ],
  incidencias: [
    { id: 1, titulo: 'Fuga de agua en pasillo', categoria: 'Mantenimiento', prioridad: 'Alta', reportado: '05/04/2026', estado: 'Abierta' },
    { id: 2, titulo: 'Ruido excesivo Apto 301', categoria: 'Convivencia', prioridad: 'Media', reportado: '04/04/2026', estado: 'En proceso' },
    { id: 3, titulo: 'Iluminación exterior dañada', categoria: 'Mantenimiento', prioridad: 'Baja', reportado: '03/04/2026', estado: 'Resuelta' },
  ],
  sistema: [
    { id: 1, usuario: 'jcermenob', nombre: 'Jonathan Cermeño', rol: 'Administrador', ultimo_acceso: '06/04/2026 08:00', estado: 'Activo' },
    { id: 2, usuario: 'rcastanedaf', nombre: 'Rogelio Castañeda', rol: 'Operador', ultimo_acceso: '05/04/2026 17:30', estado: 'Activo' },
    { id: 3, usuario: 'edonisb2', nombre: 'Erick Donis', rol: 'DBA', ultimo_acceso: '04/04/2026 09:15', estado: 'Activo' },
  ],
}

const COL_LABELS = {
  id: '#', nombre: 'Nombre', descripcion: 'Descripción', estado: 'Estado',
  tipo: 'Tipo', unidad: 'Unidad', telefono: 'Teléfono', residente: 'Residente',
  propiedad: 'Propiedad', inicio: 'Inicio', fin: 'Fin', monto: 'Monto',
  persona: 'Persona', entrada: 'Entrada', salida: 'Salida', fecha: 'Fecha',
  no: 'No.', concepto: 'Concepto', metodo: 'Método', capacidad: 'Capacidad',
  tarifa: 'Tarifa', cargo: 'Cargo', turno: 'Turno', titulo: 'Título',
  categoria: 'Categoría', prioridad: 'Prioridad', reportado: 'Reportado',
  usuario: 'Usuario', rol: 'Rol', ultimo_acceso: 'Último Acceso', factura: 'Factura',
}

const STATUS_MAP = {
  'Activo': 'success', 'Inactivo': 'secondary', 'Vigente': 'success',
  'Vencido': 'danger', 'Disponible': 'success', 'Mantenimiento': 'warning',
  'Pendiente': 'warning', 'Pagada': 'success', 'Vencida': 'danger',
  'Abierta': 'danger', 'En proceso': 'warning', 'Resuelta': 'success',
  'Alta': 'danger', 'Media': 'warning', 'Baja': 'secondary',
  'Aplicado': 'success',
}

export default function MainContent({ activeModule, activeSubModule, setActiveSubModule }) {
  const mod = MODULES.find(m => m.id === activeModule)
  const rows = MOCK_ROWS[activeModule] || []
  const cols = rows.length > 0 ? Object.keys(rows[0]) : []

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
          <div className="d-flex align-items-center gap-2">
            <h5 className="mb-0 fw-bold" style={{ color: mod?.color }}>
              {activeSubModule
                ? mod?.submodules.find(s => s.id === activeSubModule)?.label
                : mod?.label}
            </h5>
            <span className="badge text-bg-light border" style={{ fontSize: 11 }}>
              {rows.length} registros
            </span>
          </div>
          <div className="d-flex align-items-center gap-2 cms-toolbar">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-white">
                <i className="bi bi-search text-muted" style={{ fontSize: 11 }} />
              </span>
              <input className="form-control border-start-0" placeholder="Filtrar registros..." />
            </div>
            <button
              className="btn btn-sm fw-semibold"
              style={{
                background: `color-mix(in srgb, ${mod?.color} 12%, transparent)`,
                border: `1px solid color-mix(in srgb, ${mod?.color} 35%, transparent)`,
                color: mod?.color,
                whiteSpace: 'nowrap'
              }}
            >
              <i className="bi bi-plus-lg me-1" />
              Nuevo
            </button>
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
              {rows.map((row, i) => (
                <tr key={i}>
                  {cols.map(col => (
                    <td key={col} className="align-middle">
                      {(col === 'estado' || col === 'prioridad') ? (
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
                      <button className="btn btn-sm btn-outline-primary py-0 px-2">
                        <i className="bi bi-pencil me-1" style={{ fontSize: 11 }} />
                        Editar
                      </button>
                      <button className="btn btn-sm btn-outline-secondary py-0 px-2">
                        <i className="bi bi-eye me-1" style={{ fontSize: 11 }} />
                        Ver
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="d-flex align-items-center justify-content-between">
          <small className="text-muted">
            Mostrando 1–{rows.length} de {rows.length} registros
          </small>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className="page-item disabled">
                <span className="page-link">‹</span>
              </li>
              <li className="page-item active">
                <span className="page-link" style={{ background: mod?.color, borderColor: mod?.color }}>1</span>
              </li>
              <li className="page-item disabled">
                <span className="page-link">›</span>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </main>
  )
}
