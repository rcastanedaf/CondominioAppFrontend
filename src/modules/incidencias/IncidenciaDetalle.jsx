import { useState, useEffect, useCallback, Fragment } from 'react'
import IncidenciaModal   from './IncidenciaModal'
import SeguimientoModal  from './SeguimientoModal'
import { getIncidencias, deleteIncidencia } from './incidenciaService'
import { getSeguimientos, deleteSeguimiento } from './seguimientoService'

const fmt = (n) => `Q ${Number(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`

const PRIORIDAD_COLOR = { BAJA: 'success', MEDIA: 'warning', ALTA: 'danger', CRITICA: 'dark' }
const ESTADO_COLOR = {
  ABIERTA: 'danger', EN_PROCESO: 'warning', EN_ESPERA: 'info',
  RESUELTA: 'success', CERRADA: 'secondary', CANCELADA: 'secondary',
}
const PAGE_SIZE_OPTIONS = [5, 10, 20]

export default function IncidenciaDetalle({ modColor = '#dc3545', onRegisterTaskHandler }) {
  const [incidencias,     setIncidencias]   = useState([])
  const [loading,         setLoading]       = useState(true)
  const [error,           setError]         = useState(null)
  const [incSeleccionada, setIncSelec]      = useState(null)
  const [filterInc,       setFilterInc]     = useState('')
  const [filterEstado,    setFilterEstado]  = useState('')
  const [filterPrioridad, setFilterPrioridad] = useState('')
  const [paginaActual,    setPaginaActual]  = useState(1)
  const [porPagina,       setPorPagina]     = useState(5)
  const [seguimientos,    setSeguimientos]  = useState([])
  const [loadingSeg,      setLoadingSeg]    = useState(false)
  const [confirmSegId,    setConfirmSegId]  = useState(null)
  const [confirmIncId,    setConfirmIncId]  = useState(null)
  const [showIncModal,    setShowIncModal]  = useState(false)
  const [incEdit,         setIncEdit]       = useState(null)
  const [showSegModal,    setShowSegModal]  = useState(false)
  const [segEdit,         setSegEdit]       = useState(null)

  const fetchIncidencias = () => {
    setLoading(true)
    getIncidencias()
      .then(res => setIncidencias(res.data ?? []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchIncidencias() }, [])

  const fetchSeguimientos = (inc) => {
  if (!inc) { setSeguimientos([]); return }
  setLoadingSeg(true)
  getSeguimientos(inc.idIncidencia)
    .then(res => {
      console.log('URL llamada con idIncidencia:', inc.idIncidencia)
      console.log('RAW res.data:', res.data?.data ?? [])
      setSeguimientos(res.data ?? [])
    })
    .catch((err) => {
      console.log('ERROR:', err)
      setSeguimientos([])
    })
    .finally(() => setLoadingSeg(false))
  }
  useEffect(() => { fetchSeguimientos(incSeleccionada) }, [incSeleccionada])

  const incidenciasFiltradas = incidencias.filter(inc => {
    const textoOk     = !filterInc || Object.values(inc).some(v => String(v).toLowerCase().includes(filterInc.toLowerCase()))
    const estadoOk    = !filterEstado    || inc.estado    === filterEstado
    const prioridadOk = !filterPrioridad || inc.prioridad === filterPrioridad
    return textoOk && estadoOk && prioridadOk
  })

  const totalPaginas      = Math.max(1, Math.ceil(incidenciasFiltradas.length / porPagina))
  const paginaSegura      = Math.min(paginaActual, totalPaginas)
  const incidenciasPagina = incidenciasFiltradas.slice((paginaSegura - 1) * porPagina, paginaSegura * porPagina)
  const irA = (p) => setPaginaActual(Math.max(1, Math.min(p, totalPaginas)))

  const numPages = () => {
    const pages = [], delta = 1
    for (let i = 1; i <= totalPaginas; i++) {
      if (i === 1 || i === totalPaginas || (i >= paginaSegura - delta && i <= paginaSegura + delta)) pages.push(i)
      else if (pages[pages.length - 1] !== '...') pages.push('...')
    }
    return pages
  }

  useEffect(() => { setPaginaActual(1) }, [filterInc, filterEstado, filterPrioridad, porPagina])

  const handleNuevoSeguimiento = useCallback(() => {
    if (!incSeleccionada) { alert('Selecciona primero una incidencia'); return }
    setSegEdit(null); setShowSegModal(true)
  }, [incSeleccionada])

  useEffect(() => {
    onRegisterTaskHandler?.('Agregar seguimiento', handleNuevoSeguimiento)
  }, [handleNuevoSeguimiento, onRegisterTaskHandler])

  const handleEliminarInc = async (id) => {
    try {
      await deleteIncidencia(id)
      setConfirmIncId(null)
      if (incSeleccionada?.idIncidencia === id) setIncSelec(null)
      fetchIncidencias()
    } catch (err) { alert('Error al eliminar: ' + err.message) }
  }

  const handleEliminarSeg = async (id) => {
    try {
      await deleteSeguimiento(id)
      setConfirmSegId(null)
      fetchSeguimientos(incSeleccionada)
    } catch (err) { alert('Error al eliminar: ' + err.message) }
  }

  if (loading) return <div className="text-center py-5 text-muted"><div className="spinner-border spinner-border-sm me-2" />Cargando incidencias...</div>
  if (error)   return <div className="alert alert-danger py-2"><i className="bi bi-exclamation-circle me-2" />{error}</div>

  return (
    <div className="d-flex flex-column gap-3" style={{ overflowY: 'auto' }}>

      {/* ══ INCIDENCIAS ══════════════════════════════════════ */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white d-flex align-items-center justify-content-between py-2 flex-wrap gap-2"
          style={{ borderBottom: `2px solid ${modColor}` }}>
          <span className="fw-bold" style={{ color: modColor }}>
            <i className="bi bi-exclamation-triangle me-2" />Registro de Incidencias
          </span>
          <div className="d-flex gap-2 align-items-center flex-wrap">
            <div className="input-group input-group-sm" style={{ width: 180 }}>
              <span className="input-group-text bg-white"><i className="bi bi-search text-muted" style={{ fontSize: 11 }} /></span>
              <input className="form-control border-start-0" placeholder="Buscar..."
                value={filterInc} onChange={e => setFilterInc(e.target.value)} />
              {filterInc && <button className="btn btn-outline-secondary btn-sm" onClick={() => setFilterInc('')}><i className="bi bi-x" /></button>}
            </div>
            <select className="form-select form-select-sm" style={{ width: 130 }}
              value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
              <option value="">Todos los estados</option>
              {['ABIERTA','EN_PROCESO','EN_ESPERA','RESUELTA','CERRADA','CANCELADA'].map(est => (
                <option key={est} value={est}>{est}</option>
              ))}
            </select>
            <select className="form-select form-select-sm" style={{ width: 120 }}
              value={filterPrioridad} onChange={e => setFilterPrioridad(e.target.value)}>
              <option value="">Todas</option>
              {['BAJA','MEDIA','ALTA','CRITICA'].map(pri => (
                <option key={pri} value={pri}>{pri}</option>
              ))}
            </select>
            <div className="d-flex align-items-center gap-1">
              <span className="text-muted" style={{ fontSize: 12 }}>Ver</span>
              <select className="form-select form-select-sm" style={{ width: 65 }}
                value={porPagina} onChange={e => setPorPagina(Number(e.target.value))}>
                {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <button className="btn btn-sm btn-primary" onClick={() => { setIncEdit(null); setShowIncModal(true) }}>
              <i className="bi bi-plus-lg me-1" />Nueva Incidencia
            </button>
          </div>
        </div>

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
                <th className="text-end">Costo Est.</th>
                <th className="text-end">Costo Real</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {incidenciasPagina.length === 0 ? (
                <tr><td colSpan={12} className="text-center text-muted py-4"><i className="bi bi-inbox me-2" />Sin incidencias</td></tr>
              ) : incidenciasPagina.map((inc, incIdx) => (
                <tr key={inc.idIncidencia ?? `inc-row-${incIdx}`}
                  style={{ cursor: 'pointer', background: incSeleccionada?.idIncidencia === inc.idIncidencia ? `${modColor}12` : undefined }}
                  onClick={() => setIncSelec(prev => prev?.idIncidencia === inc.idIncidencia ? null : inc)}>
                  <td className="text-center align-middle">
                    {incSeleccionada?.idIncidencia === inc.idIncidencia && <i className="bi bi-caret-right-fill" style={{ color: modColor, fontSize: 12 }} />}
                  </td>
                  <td className="text-muted">{inc.idIncidencia}</td>
                  <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span className="fw-semibold">{inc.titulo}</span>
                  </td>
                  <td><span className={`badge text-bg-${PRIORIDAD_COLOR[inc.prioridad?.trim()] || 'secondary'}`}>{inc.prioridad?.trim()}</span></td>
                  <td><span className={`badge text-bg-${ESTADO_COLOR[inc.estado] || 'secondary'}`}>{inc.estado}</span></td>
                  <td className="text-muted">{inc.idCategoria ?? '—'}</td>
                  <td className="text-muted">{inc.idPropiedad ?? '—'}</td>
                  <td className="text-end">{inc.costoEstimado ? fmt(inc.costoEstimado) : '—'}</td>
                  <td className="text-end">{inc.costoReal ? fmt(inc.costoReal) : '—'}</td>
                  <td onClick={ev => ev.stopPropagation()}>
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-outline-primary py-0 px-1" onClick={() => { setIncEdit(inc); setShowIncModal(true) }} title="Editar">
                        <i className="bi bi-pencil" style={{ fontSize: 11 }} />
                      </button>
                      {confirmIncId === inc.idIncidencia ? (
                        <Fragment key={`confirm-inc-${inc.idIncidencia}`}>
                          <span className="text-danger" style={{ fontSize: 11 }}>¿Eliminar?</span>
                          <button className="btn btn-sm btn-danger py-0 px-1" onClick={() => handleEliminarInc(inc.idIncidencia)}>Sí</button>
                          <button className="btn btn-sm btn-outline-secondary py-0 px-1" onClick={() => setConfirmIncId(null)}>No</button>
                        </Fragment>
                      ) : (
                        <button key={`trash-inc-${inc.idIncidencia}`} className="btn btn-sm btn-outline-danger py-0 px-1" onClick={() => setConfirmIncId(inc.idIncidencia)} title="Eliminar">
                          <i className="bi bi-trash" style={{ fontSize: 11 }} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card-footer bg-white d-flex align-items-center justify-content-between flex-wrap gap-2 py-2"
          style={{ borderTop: '1px solid #dee2e6' }}>
          <small className="text-muted">
            {incidenciasFiltradas.length === 0 ? 'Sin registros'
              : `Mostrando ${(paginaSegura - 1) * porPagina + 1}–${Math.min(paginaSegura * porPagina, incidenciasFiltradas.length)} de ${incidenciasFiltradas.length} incidencias`}
          </small>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${paginaSegura === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => irA(1)}><i className="bi bi-chevron-double-left" style={{ fontSize: 11 }} /></button>
              </li>
              <li className={`page-item ${paginaSegura === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => irA(paginaSegura - 1)}><i className="bi bi-chevron-left" style={{ fontSize: 11 }} /></button>
              </li>
              {numPages().map((p, idx) =>
                p === '...'
                  ? <li key={`ellipsis-${idx}`} className="page-item disabled">
                      <span className="page-link border-0 bg-transparent">…</span>
                    </li>
                  : <li key={`page-${p}`} className="page-item">
                      <button className="page-link"
                        style={paginaSegura === p ? { background: modColor, borderColor: modColor, color: '#fff' } : {}}
                        onClick={() => irA(p)}>{p}</button>
                    </li>
              )}
              <li className={`page-item ${paginaSegura === totalPaginas ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => irA(paginaSegura + 1)}><i className="bi bi-chevron-right" style={{ fontSize: 11 }} /></button>
              </li>
              <li className={`page-item ${paginaSegura === totalPaginas ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => irA(totalPaginas)}><i className="bi bi-chevron-double-right" style={{ fontSize: 11 }} /></button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* ══ SEGUIMIENTO ═════════════════════════════════════ */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white d-flex align-items-center justify-content-between py-2 flex-wrap gap-2"
          style={{ borderBottom: `2px solid ${modColor}` }}>
          <span className="fw-bold text-muted">
            <i className="bi bi-journal-text me-2" />
            {incSeleccionada
              ? <>Seguimiento — <span style={{ color: modColor }}>#{incSeleccionada.idIncidencia}</span> · {incSeleccionada.titulo}</>
              : 'Seguimiento (selecciona una incidencia arriba)'}
          </span>
          {incSeleccionada && (
            <button className="btn btn-sm"
              style={{ background: `${modColor}18`, border: `1px solid ${modColor}44`, color: modColor }}
              onClick={handleNuevoSeguimiento}>
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
            <div className="spinner-border spinner-border-sm me-2" style={{ color: modColor }} />Cargando seguimientos...
          </div>
        ) : (
          <div className="card-body p-0">
            {seguimientos.length === 0 ? (
              <div className="text-center text-muted py-4" style={{ fontSize: 13 }}>
                <i className="bi bi-journal-x me-2" />Sin seguimientos registrados
              </div>
            ) : (
              <div className="p-3 d-flex flex-column gap-2">
                {seguimientos.slice().sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map((seg, idx) => (
                  <div key={seg.idSeguimiento ?? `seg-row-${idx}`}
                    className="d-flex gap-3 align-items-start p-3 rounded-3"
                    style={{ background: idx === 0 ? `${modColor}08` : '#f8f9fa', border: `1px solid ${idx === 0 ? modColor + '30' : '#dee2e6'}` }}>
                    <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 36, height: 36, background: modColor + '20', color: modColor }}>
                      <i className="bi bi-person-fill" style={{ fontSize: 14 }} />
                    </div>
                    <div className="flex-fill">
                      <div className="d-flex align-items-center justify-content-between flex-wrap gap-1 mb-1">
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-semibold" style={{ fontSize: 12 }}>Usuario #{seg.idUsuario ?? '—'}</span>
                          {seg.estadoNuevo && (
                            <span className={`badge text-bg-${ESTADO_COLOR[seg.estadoNuevo] || 'secondary'}`} style={{ fontSize: 10 }}>→ {seg.estadoNuevo}</span>
                          )}
                          {idx === 0 && <span className="badge text-bg-primary" style={{ fontSize: 10 }}>Último</span>}
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <span className="text-muted" style={{ fontSize: 11 }}>
                            <i className="bi bi-clock me-1" />{seg.fecha?.replace('T', ' ').substring(0, 16) ?? '—'}
                          </span>
                          <button className="btn btn-sm btn-outline-primary py-0 px-1"
                            onClick={() => { setSegEdit(seg); setShowSegModal(true) }} title="Editar">
                            <i className="bi bi-pencil" style={{ fontSize: 11 }} />
                          </button>
                          {confirmSegId === seg.idSeguimiento ? (
                            <Fragment key={`confirm-seg-${seg.idSeguimiento}`}>
                              <span className="text-danger" style={{ fontSize: 11 }}>¿Eliminar?</span>
                              <button className="btn btn-sm btn-danger py-0 px-1" onClick={() => handleEliminarSeg(seg.idSeguimiento)}>Sí</button>
                              <button className="btn btn-sm btn-outline-secondary py-0 px-1" onClick={() => setConfirmSegId(null)}>No</button>
                            </Fragment>
                          ) : (
                            <button key={`trash-seg-${seg.idSeguimiento}`} className="btn btn-sm btn-outline-danger py-0 px-1" onClick={() => setConfirmSegId(seg.idSeguimiento)} title="Eliminar">
                              <i className="bi bi-trash" style={{ fontSize: 11 }} />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="mb-0 text-secondary" style={{ fontSize: 13, lineHeight: 1.5 }}>{seg.comentario}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <IncidenciaModal show={showIncModal} incidencia={incEdit}
        onClose={() => setShowIncModal(false)} onSaved={() => { setShowIncModal(false); fetchIncidencias() }} />
      <SeguimientoModal show={showSegModal} seguimiento={segEdit} incidenciaId={incSeleccionada?.idIncidencia}
        modColor={modColor} onClose={() => setShowSegModal(false)}
        onSaved={() => { setShowSegModal(false); fetchSeguimientos(incSeleccionada) }} />
    </div>
  )
}