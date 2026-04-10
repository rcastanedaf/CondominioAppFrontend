import { useState, useEffect, useCallback } from 'react'
import IncidenciaModal   from './IncidenciaModal'
import SeguimientoModal  from './SeguimientoModal'

// ── Helpers ──────────────────────────────────────────────────
const fmt = (n) => `Q ${Number(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`

const PRIORIDAD_COLOR = {
  BAJA: 'success', MEDIA: 'warning', ALTA: 'danger', CRITICA: 'dark',
  // compatibilidad con datos en español
  Baja: 'success', Media: 'warning', Alta: 'danger', Crítica: 'dark',
}
const ESTADO_COLOR = {
  ABIERTA: 'danger', EN_PROCESO: 'warning', EN_ESPERA: 'info',
  RESUELTA: 'success', CERRADA: 'secondary', CANCELADA: 'secondary',
  // español
  Abierta: 'danger', 'En proceso': 'warning', Resuelta: 'success', Cerrada: 'secondary',
}

const PAGE_SIZE_OPTIONS = [5, 10, 20]

// ── Mock data ────────────────────────────────────────────────
const MOCK_INCIDENCIAS = [
  { id: 1,  idPropiedad: 3,  idEspacio: null, idCategoria: 1, idReportadoPor: 5,  titulo: 'Fuga de agua en pasillo nivel 2',       descripcion: 'Se detectó fuga de agua en el pasillo del nivel 2 frente al apartamento 204.', prioridad: 'ALTA',   estado: 'EN_PROCESO', idAsignadoA: 8,  idProveedor: null, costoEstimado: 500.00,  costoReal: null,   idFacturaCargo: null, fechaApertura: '2026-04-05T08:30:00', fechaResolucion: null,                observaciones: 'Se notificó a plomería interna.' },
  { id: 2,  idPropiedad: 7,  idEspacio: null, idCategoria: 2, idReportadoPor: 12, titulo: 'Ruido excesivo apartamento 301',         descripcion: 'Queja por ruido excesivo en horario nocturno proveniente del apartamento 301.', prioridad: 'MEDIA',  estado: 'ABIERTA',    idAsignadoA: null, idProveedor: null, costoEstimado: null,    costoReal: null,   idFacturaCargo: null, fechaApertura: '2026-04-04T20:15:00', fechaResolucion: null,                observaciones: '' },
  { id: 3,  idPropiedad: null, idEspacio: 2,  idCategoria: 1, idReportadoPor: 3,  titulo: 'Iluminación exterior dañada',             descripcion: 'Tres luminarias del estacionamiento no funcionan desde el lunes.',             prioridad: 'BAJA',   estado: 'RESUELTA',   idAsignadoA: 6,  idProveedor: 2,    costoEstimado: 1200.00, costoReal: 980.00, idFacturaCargo: 15,   fechaApertura: '2026-04-03T09:00:00', fechaResolucion: '2026-04-06T14:00:00', observaciones: 'Reparación completada.' },
  { id: 4,  idPropiedad: 1,  idEspacio: null, idCategoria: 3, idReportadoPor: 9,  titulo: 'Portón eléctrico sin funcionar',          descripcion: 'El portón principal no responde al control remoto ni al panel.',               prioridad: 'CRITICA', estado: 'EN_PROCESO', idAsignadoA: 6,  idProveedor: 3,    costoEstimado: 3500.00, costoReal: null,   idFacturaCargo: null, fechaApertura: '2026-04-07T07:00:00', fechaResolucion: null,                observaciones: 'Proveedor visitará mañana.' },
  { id: 5,  idPropiedad: 5,  idEspacio: null, idCategoria: 2, idReportadoPor: 14, titulo: 'Filtración en techo nivel 4',             descripcion: 'Mancha de humedad en techo del pasillo nivel 4.',                             prioridad: 'ALTA',   estado: 'EN_ESPERA',  idAsignadoA: null, idProveedor: null, costoEstimado: 2000.00, costoReal: null,   idFacturaCargo: null, fechaApertura: '2026-04-06T11:00:00', fechaResolucion: null,                observaciones: 'Pendiente revisión de impermeabilización.' },
  { id: 6,  idPropiedad: 2,  idEspacio: null, idCategoria: 4, idReportadoPor: 7,  titulo: 'Ascensor fuera de servicio',              descripcion: 'Ascensor principal detenido en nivel 3, puerta no cierra.',                   prioridad: 'CRITICA', estado: 'RESUELTA',   idAsignadoA: 6,  idProveedor: 4,    costoEstimado: 8000.00, costoReal: 7500.00,idFacturaCargo: 18,   fechaApertura: '2026-04-01T06:30:00', fechaResolucion: '2026-04-03T16:00:00', observaciones: 'Técnico certificado realizó la reparación.' },
  { id: 7,  idPropiedad: 9,  idEspacio: null, idCategoria: 2, idReportadoPor: 11, titulo: 'Basura acumulada en área común',           descripcion: 'Residuos sin recolectar por más de 3 días en la planta baja.',               prioridad: 'MEDIA',  estado: 'CERRADA',    idAsignadoA: 10, idProveedor: null, costoEstimado: null,    costoReal: null,   idFacturaCargo: null, fechaApertura: '2026-03-28T15:00:00', fechaResolucion: '2026-03-29T10:00:00', observaciones: '' },
  { id: 8,  idPropiedad: 4,  idEspacio: null, idCategoria: 1, idReportadoPor: 6,  titulo: 'Goteo en tuberías de baño comunal',       descripcion: 'Goteo constante en tubería de agua fría del baño del lobby.',                 prioridad: 'MEDIA',  estado: 'ABIERTA',    idAsignadoA: null, idProveedor: null, costoEstimado: 350.00,  costoReal: null,   idFacturaCargo: null, fechaApertura: '2026-04-08T09:45:00', fechaResolucion: null,                observaciones: '' },
  { id: 9,  idPropiedad: null, idEspacio: 1,  idCategoria: 3, idReportadoPor: 2,  titulo: 'Cámara de seguridad sin señal',           descripcion: 'Cámara del estacionamiento subterráneo sin imagen desde el jueves.',        prioridad: '  ALTA',  estado: 'EN_PROCESO', idAsignadoA: 8,  idProveedor: 5,    costoEstimado: 600.00,  costoReal: null,   idFacturaCargo: null, fechaApertura: '2026-04-07T14:00:00', fechaResolucion: null,                observaciones: 'Técnico de seguridad revisará el lunes.' },
  { id: 10, idPropiedad: 6,  idEspacio: null, idCategoria: 2, idReportadoPor: 15, titulo: 'Mascotas sin correa en áreas comunes',    descripcion: 'Propietario del apartamento 601 deja su mascota suelta en jardines.',       prioridad: 'BAJA',   estado: 'CERRADA',    idAsignadoA: 10, idProveedor: null, costoEstimado: null,    costoReal: null,   idFacturaCargo: null, fechaApertura: '2026-03-30T16:30:00', fechaResolucion: '2026-03-31T09:00:00', observaciones: 'Se habló con el propietario.' },
  { id: 11, idPropiedad: 8,  idEspacio: null, idCategoria: 1, idReportadoPor: 4,  titulo: 'Presión baja de agua apartamento 802',   descripcion: 'Presión insuficiente en el apartamento 802, especialmente en horario pico.', prioridad: 'MEDIA',  estado: 'ABIERTA',    idAsignadoA: null, idProveedor: null, costoEstimado: null,    costoReal: null,   idFacturaCargo: null, fechaApertura: '2026-04-08T07:30:00', fechaResolucion: null,                observaciones: '' },
  { id: 12, idPropiedad: null, idEspacio: 3,  idCategoria: 4, idReportadoPor: 8,  titulo: 'Sistema de incendios activado falsamente', descripcion: 'Alarma de incendio activada sin causa real en nivel 5, se evacuó el piso.',  prioridad: 'ALTA',   estado: 'RESUELTA',   idAsignadoA: 6,  idProveedor: 4,    costoEstimado: 1500.00, costoReal: 900.00, idFacturaCargo: 20,   fechaApertura: '2026-04-02T22:00:00', fechaResolucion: '2026-04-03T01:00:00', observaciones: 'Sensor de humo reemplazado.' },
]

const MOCK_SEGUIMIENTOS = [
  { id: 1, idIncidencia: 1, idUsuario: 8,  comentario: 'Se inspeccionó el área, fuga proviene de tubería de 1/2 pulgada en unión.',  estadoNuevo: 'EN_PROCESO', fecha: '2026-04-05T10:00:00' },
  { id: 2, idIncidencia: 1, idUsuario: 8,  comentario: 'Se cerró el paso de agua del sector. Se solicitó material a bodega.',          estadoNuevo: null,          fecha: '2026-04-05T14:30:00' },
  { id: 3, idIncidencia: 1, idUsuario: 8,  comentario: 'Material disponible. Reparación programada para mañana 8 AM.',                 estadoNuevo: null,          fecha: '2026-04-06T09:00:00' },
  { id: 4, idIncidencia: 3, idUsuario: 6,  comentario: 'Inspección realizada. Se identificaron 3 luminarias dañadas.',                 estadoNuevo: 'EN_PROCESO', fecha: '2026-04-03T11:00:00' },
  { id: 5, idIncidencia: 3, idUsuario: 6,  comentario: 'Proveedor realizó la sustitución. Todas las luces operativas.',                 estadoNuevo: 'RESUELTA',   fecha: '2026-04-06T14:00:00' },
  { id: 6, idIncidencia: 4, idUsuario: 6,  comentario: 'Revisión inicial: falla en tarjeta de control del motor.',                     estadoNuevo: 'EN_PROCESO', fecha: '2026-04-07T08:00:00' },
  { id: 7, idIncidencia: 6, idUsuario: 6,  comentario: 'Técnico de ascensores revisó la instalación. Cable de seguridad roto.',        estadoNuevo: null,          fecha: '2026-04-01T09:00:00' },
  { id: 8, idIncidencia: 6, idUsuario: 6,  comentario: 'Cable reemplazado y sistema probado. Ascensor operativo.',                     estadoNuevo: 'RESUELTA',   fecha: '2026-04-03T16:00:00' },
]

// ── Componente principal ─────────────────────────────────────
export default function IncidenciaDetalle({ modColor = '#dc3545', onRegisterTaskHandler }) {

  // Encabezado
  const [incidencias,         setIncidencias]   = useState(MOCK_INCIDENCIAS)
  const [incSeleccionada,     setIncSelec]       = useState(null)
  const [filterInc,           setFilterInc]      = useState('')
  const [filterEstado,        setFilterEstado]   = useState('')
  const [filterPrioridad,     setFilterPrioridad]= useState('')

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1)
  const [porPagina,    setPorPagina]    = useState(5)

  // Seguimientos
  const [seguimientos,  setSeguimientos]  = useState([])
  const [loadingSeg,    setLoadingSeg]    = useState(false)
  const [confirmSegId,  setConfirmSegId]  = useState(null)

  // Modales
  const [showIncModal,  setShowIncModal]  = useState(false)
  const [incEdit,       setIncEdit]       = useState(null)
  const [showSegModal,  setShowSegModal]  = useState(false)
  const [segEdit,       setSegEdit]       = useState(null)

  // ── Filtrado ───────────────────────────────────────────────
  const incidenciasFiltradas = incidencias.filter(inc => {
    const textoOk = !filterInc || Object.values(inc).some(v =>
      String(v).toLowerCase().includes(filterInc.toLowerCase())
    )
    const estadoOk    = !filterEstado    || inc.estado    === filterEstado
    const prioridadOk = !filterPrioridad || inc.prioridad === filterPrioridad
    return textoOk && estadoOk && prioridadOk
  })

  // ── Paginación ─────────────────────────────────────────────
  const totalPaginas    = Math.max(1, Math.ceil(incidenciasFiltradas.length / porPagina))
  const paginaSegura    = Math.min(paginaActual, totalPaginas)
  const incidenciasPagina = incidenciasFiltradas.slice(
    (paginaSegura - 1) * porPagina,
    paginaSegura * porPagina
  )
  const irA = (p) => setPaginaActual(Math.max(1, Math.min(p, totalPaginas)))

  const numPages = () => {
    const pages = [], delta = 1
    for (let i = 1; i <= totalPaginas; i++) {
      if (i === 1 || i === totalPaginas || (i >= paginaSegura - delta && i <= paginaSegura + delta))
        pages.push(i)
      else if (pages[pages.length - 1] !== '...')
        pages.push('...')
    }
    return pages
  }

  useEffect(() => { setPaginaActual(1) }, [filterInc, filterEstado, filterPrioridad, porPagina])

  useEffect(() => {
    if (incSeleccionada && !incidenciasFiltradas.find(i => i.id === incSeleccionada.id)) {
      setIncSelec(null)
    }
  }, [filterInc, filterEstado, filterPrioridad]) // eslint-disable-line

  // ── Cargar seguimientos ────────────────────────────────────
  useEffect(() => {
    if (!incSeleccionada) { setSeguimientos([]); return }
    setLoadingSeg(true)
    setTimeout(() => {
      setSeguimientos(MOCK_SEGUIMIENTOS.filter(s => s.idIncidencia === incSeleccionada.id))
      setLoadingSeg(false)
    }, 250)
  }, [incSeleccionada])

  // ── TaskPanel ──────────────────────────────────────────────
  const handleNuevoSeguimiento = useCallback(() => {
    if (!incSeleccionada) { alert('Selecciona primero una incidencia'); return }
    setSegEdit(null); setShowSegModal(true)
  }, [incSeleccionada])

  useEffect(() => {
    onRegisterTaskHandler?.('Agregar seguimiento', handleNuevoSeguimiento)
  }, [handleNuevoSeguimiento, onRegisterTaskHandler])

  // ── CRUD incidencias ───────────────────────────────────────
  const handleNuevaInc  = ()    => { setIncEdit(null);  setShowIncModal(true) }
  const handleEditarInc = (inc) => { setIncEdit(inc);   setShowIncModal(true) }
  const handleEliminarInc = (id) => {
    setIncidencias(prev => prev.filter(i => i.id !== id))
    if (incSeleccionada?.id === id) setIncSelec(null)
  }
  const handleSavedInc = (data) => {
    if (incEdit) setIncidencias(prev => prev.map(i => i.id === data.id ? data : i))
    else         setIncidencias(prev => [...prev, { ...data, id: Date.now(), fechaApertura: new Date().toISOString() }])
    setShowIncModal(false)
  }

  // ── CRUD seguimientos ──────────────────────────────────────
  const handleEditarSeg   = (seg) => { setSegEdit(seg); setShowSegModal(true) }
  const handleEliminarSeg = (id)  => { setSeguimientos(prev => prev.filter(s => s.id !== id)); setConfirmSegId(null) }
  const handleSavedSeg    = (data) => {
    if (segEdit) setSeguimientos(prev => prev.map(s => s.id === data.id ? data : s))
    else         setSeguimientos(prev => [...prev, { ...data, id: Date.now(), idIncidencia: incSeleccionada.id, fecha: new Date().toISOString() }])
    setShowSegModal(false)
  }

  // ─────────────────────────────────────────────────────────
  return (
    <div className="d-flex flex-column gap-3">

      {/* ══ ENCABEZADO: incidencias ══════════════════════════ */}
      <div className="card border-0 shadow-sm">

        {/* Header */}
        <div
          className="card-header bg-white d-flex align-items-center justify-content-between py-2 flex-wrap gap-2"
          style={{ borderBottom: `2px solid ${modColor}` }}
        >
          <span className="fw-bold" style={{ color: modColor }}>
            <i className="bi bi-exclamation-triangle me-2" />
            Registro de Incidencias
          </span>

          <div className="d-flex gap-2 align-items-center flex-wrap">
            {/* Buscador */}
            <div className="input-group input-group-sm" style={{ width: 180 }}>
              <span className="input-group-text bg-white">
                <i className="bi bi-search text-muted" style={{ fontSize: 11 }} />
              </span>
              <input className="form-control border-start-0" placeholder="Buscar..."
                value={filterInc} onChange={e => setFilterInc(e.target.value)} />
              {filterInc && (
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setFilterInc('')}>
                  <i className="bi bi-x" />
                </button>
              )}
            </div>

            {/* Filtro estado */}
            <select className="form-select form-select-sm" style={{ width: 130 }}
              value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
              <option value="">Todos los estados</option>
              {['ABIERTA','EN_PROCESO','EN_ESPERA','RESUELTA','CERRADA','CANCELADA'].map(e =>
                <option key={e} value={e}>{e}</option>
              )}
            </select>

            {/* Filtro prioridad */}
            <select className="form-select form-select-sm" style={{ width: 120 }}
              value={filterPrioridad} onChange={e => setFilterPrioridad(e.target.value)}>
              <option value="">Todas</option>
              {['BAJA','MEDIA','ALTA','CRITICA'].map(p =>
                <option key={p} value={p}>{p}</option>
              )}
            </select>

            {/* Registros por página */}
            <div className="d-flex align-items-center gap-1">
              <span className="text-muted" style={{ fontSize: 12 }}>Ver</span>
              <select className="form-select form-select-sm" style={{ width: 65 }}
                value={porPagina} onChange={e => setPorPagina(Number(e.target.value))}>
                {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            <button className="btn btn-sm btn-primary" onClick={handleNuevaInc}>
              <i className="bi bi-plus-lg me-1" />Nueva Incidencia
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div style={{ overflowX: 'auto' }}>
          <table className="table table-hover table-sm cms-table mb-0" style={{ fontSize: 12 }}>
            <thead className="table-light">
              <tr>
                <th style={{ width: 30 }} />
                <th>#</th>
                <th>Título</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Categoría</th>
                <th>Propiedad</th>
                <th>F. Apertura</th>
                <th>F. Resolución</th>
                <th className="text-end">Costo Est.</th>
                <th className="text-end">Costo Real</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {incidenciasPagina.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center text-muted py-4">
                    <i className="bi bi-inbox me-2" />Sin incidencias
                  </td>
                </tr>
              ) : (
                incidenciasPagina.map(inc => (
                  <tr
                    key={inc.id}
                    style={{
                      cursor: 'pointer',
                      background: incSeleccionada?.id === inc.id ? `${modColor}12` : undefined,
                    }}
                    onClick={() => setIncSelec(prev => prev?.id === inc.id ? null : inc)}
                  >
                    <td className="text-center align-middle">
                      {incSeleccionada?.id === inc.id && (
                        <i className="bi bi-caret-right-fill" style={{ color: modColor, fontSize: 12 }} />
                      )}
                    </td>
                    <td className="text-muted">{inc.id}</td>
                    <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span className="fw-semibold">{inc.titulo}</span>
                    </td>
                    <td>
                      <span className={`badge text-bg-${PRIORIDAD_COLOR[inc.prioridad?.trim()] || 'secondary'}`}>
                        {inc.prioridad?.trim()}
                      </span>
                    </td>
                    <td>
                      <span className={`badge text-bg-${ESTADO_COLOR[inc.estado] || 'secondary'}`}>
                        {inc.estado}
                      </span>
                    </td>
                    <td className="text-muted">{inc.idCategoria ?? '—'}</td>
                    <td className="text-muted">{inc.idPropiedad ?? '—'}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {inc.fechaApertura ? inc.fechaApertura.substring(0, 10) : '—'}
                    </td>
                    <td className="text-muted" style={{ whiteSpace: 'nowrap' }}>
                      {inc.fechaResolucion ? inc.fechaResolucion.substring(0, 10) : '—'}
                    </td>
                    <td className="text-end">{inc.costoEstimado ? fmt(inc.costoEstimado) : '—'}</td>
                    <td className="text-end">{inc.costoReal ? fmt(inc.costoReal) : '—'}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-sm btn-outline-primary py-0 px-1"
                          onClick={() => handleEditarInc(inc)}
                          title="Editar"
                        >
                          <i className="bi bi-pencil" style={{ fontSize: 11 }} />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger py-0 px-1"
                          onClick={() => handleEliminarInc(inc.id)}
                          title="Eliminar"
                        >
                          <i className="bi bi-trash" style={{ fontSize: 11 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer paginación */}
        <div
          className="card-footer bg-white d-flex align-items-center justify-content-between flex-wrap gap-2 py-2"
          style={{ borderTop: '1px solid #dee2e6' }}
        >
          <small className="text-muted">
            {incidenciasFiltradas.length === 0
              ? 'Sin registros'
              : `Mostrando ${(paginaSegura - 1) * porPagina + 1}–${Math.min(
                  paginaSegura * porPagina, incidenciasFiltradas.length
                )} de ${incidenciasFiltradas.length} incidencias`}
          </small>

          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${paginaSegura === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => irA(1)} title="Primera">
                  <i className="bi bi-chevron-double-left" style={{ fontSize: 11 }} />
                </button>
              </li>
              <li className={`page-item ${paginaSegura === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => irA(paginaSegura - 1)}>
                  <i className="bi bi-chevron-left" style={{ fontSize: 11 }} />
                </button>
              </li>
              {numPages().map((p, idx) =>
                p === '...'
                  ? <li key={`e-${idx}`} className="page-item disabled"><span className="page-link border-0 bg-transparent">…</span></li>
                  : <li key={p} className="page-item">
                      <button
                        className="page-link"
                        style={paginaSegura === p ? { background: modColor, borderColor: modColor, color: '#fff' } : {}}
                        onClick={() => irA(p)}
                      >{p}</button>
                    </li>
              )}
              <li className={`page-item ${paginaSegura === totalPaginas ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => irA(paginaSegura + 1)}>
                  <i className="bi bi-chevron-right" style={{ fontSize: 11 }} />
                </button>
              </li>
              <li className={`page-item ${paginaSegura === totalPaginas ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => irA(totalPaginas)} title="Última">
                  <i className="bi bi-chevron-double-right" style={{ fontSize: 11 }} />
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* ══ SEGUIMIENTO ═════════════════════════════════════ */}
      <div className="card border-0 shadow-sm">

        <div
          className="card-header bg-white d-flex align-items-center justify-content-between py-2 flex-wrap gap-2"
          style={{ borderBottom: `2px solid ${modColor}` }}
        >
          <span className="fw-bold text-muted">
            <i className="bi bi-journal-text me-2" />
            {incSeleccionada
              ? <>Seguimiento — <span style={{ color: modColor }}>#{incSeleccionada.id}</span> · {incSeleccionada.titulo}</>
              : 'Seguimiento (selecciona una incidencia arriba)'}
          </span>

          {incSeleccionada && (
            <button
              className="btn btn-sm"
              style={{ background: `${modColor}18`, border: `1px solid ${modColor}44`, color: modColor }}
              onClick={handleNuevoSeguimiento}
            >
              <i className="bi bi-plus-lg me-1" />Agregar Seguimiento
            </button>
          )}
        </div>

        {!incSeleccionada ? (
          <div className="d-flex align-items-center justify-content-center text-muted flex-column py-5">
            <i className="bi bi-arrow-up-circle fs-1 mb-2 opacity-25" />
            <span style={{ fontSize: 13 }}>Selecciona una incidencia para ver su historial</span>
          </div>

        ) : loadingSeg ? (
          <div className="text-center py-4 text-muted">
            <div className="spinner-border spinner-border-sm me-2" style={{ color: modColor }} />
            Cargando seguimientos...
          </div>

        ) : (
          <div className="card-body p-0">
            {seguimientos.length === 0 ? (
              <div className="text-center text-muted py-4" style={{ fontSize: 13 }}>
                <i className="bi bi-journal-x me-2" />
                Sin seguimientos registrados para esta incidencia
              </div>
            ) : (
              /* Timeline de seguimientos */
              <div className="p-3 d-flex flex-column gap-2">
                {seguimientos
                  .slice()
                  .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                  .map((seg, idx) => (
                    <div
                      key={seg.id}
                      className="d-flex gap-3 align-items-start p-3 rounded-3"
                      style={{ background: idx === 0 ? `${modColor}08` : '#f8f9fa', border: `1px solid ${idx === 0 ? modColor + '30' : '#dee2e6'}` }}
                    >
                      {/* Ícono timeline */}
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: 36, height: 36, background: modColor + '20', color: modColor }}
                      >
                        <i className="bi bi-person-fill" style={{ fontSize: 14 }} />
                      </div>

                      {/* Contenido */}
                      <div className="flex-fill">
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-1 mb-1">
                          <div className="d-flex align-items-center gap-2">
                            <span className="fw-semibold" style={{ fontSize: 12 }}>
                              Usuario #{seg.idUsuario ?? '—'}
                            </span>
                            {seg.estadoNuevo && (
                              <span className={`badge text-bg-${ESTADO_COLOR[seg.estadoNuevo] || 'secondary'}`}
                                style={{ fontSize: 10 }}>
                                → {seg.estadoNuevo}
                              </span>
                            )}
                            {idx === 0 && (
                              <span className="badge text-bg-primary" style={{ fontSize: 10 }}>Último</span>
                            )}
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <span className="text-muted" style={{ fontSize: 11 }}>
                              <i className="bi bi-clock me-1" />
                              {seg.fecha ? seg.fecha.replace('T', ' ').substring(0, 16) : '—'}
                            </span>
                            {/* Acciones */}
                            <button
                              className="btn btn-sm btn-outline-primary py-0 px-1"
                              onClick={() => handleEditarSeg(seg)}
                              title="Editar"
                            >
                              <i className="bi bi-pencil" style={{ fontSize: 11 }} />
                            </button>
                            {confirmSegId === seg.id ? (
                              <>
                                <span className="text-danger" style={{ fontSize: 11 }}>¿Eliminar?</span>
                                <button className="btn btn-sm btn-danger py-0 px-1"
                                  onClick={() => handleEliminarSeg(seg.id)}>Sí</button>
                                <button className="btn btn-sm btn-outline-secondary py-0 px-1"
                                  onClick={() => setConfirmSegId(null)}>No</button>
                              </>
                            ) : (
                              <button
                                className="btn btn-sm btn-outline-danger py-0 px-1"
                                onClick={() => setConfirmSegId(seg.id)}
                                title="Eliminar"
                              >
                                <i className="bi bi-trash" style={{ fontSize: 11 }} />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="mb-0 text-secondary" style={{ fontSize: 13, lineHeight: 1.5 }}>
                          {seg.comentario}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modales */}
      <IncidenciaModal
        show={showIncModal}
        incidencia={incEdit}
        onClose={() => setShowIncModal(false)}
        onSaved={handleSavedInc}
      />
      <SeguimientoModal
        show={showSegModal}
        seguimiento={segEdit}
        incidenciaId={incSeleccionada?.id}
        modColor={modColor}
        onClose={() => setShowSegModal(false)}
        onSaved={handleSavedSeg}
      />
    </div>
  )
}