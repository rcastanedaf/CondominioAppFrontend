import { useState, useEffect, useCallback, Fragment } from 'react'
import DetalleFacturaModal from './DetalleFacturaModal'
import FacturaModal from './FacturaModal'
import PagoModal from '../pagos/PagoModal'
import {
  getFacturas, deleteFactura,
  getDetallesByFactura, createDetalle, updateDetalle, deleteDetalle
} from './facturacionService'

const fmt = (n) =>
  `Q ${Number(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`

const STATUS_COLOR = {
  PENDIENTE: 'warning', PAGADA: 'success', VENCIDA: 'danger', ANULADA: 'secondary',
}

const PAGE_SIZE_OPTIONS = [5, 10, 20]

export default function FacturaDetalle({ modColor = '#dc3545', onRegisterTaskHandler }) {

  const [facturas,            setFacturas]        = useState([])
  const [loading,             setLoading]         = useState(true)
  const [error,               setError]           = useState(null)
  const [facturaSeleccionada, setFacturaSelec]    = useState(null)
  const [filterFact,          setFilterFact]      = useState('')
  const [filterEstado,        setFilterEstado]    = useState('')
  const [showFacturaModal,    setShowFacturaModal] = useState(false)
  const [facturaEdit,         setFacturaEdit]     = useState(null)
  const [showPagoModal,       setShowPagoModal]   = useState(false)
  const [confirmFactId,       setConfirmFactId]   = useState(null)
  const [pendingOpenFactura,  setPendingOpenFactura]  = useState(false)
  const [pendingOpenDetalle,  setPendingOpenDetalle]  = useState(false)
  const [paginaActual,        setPaginaActual]    = useState(1)
  const [porPagina,           setPorPagina]       = useState(5)
  const [detalles,            setDetalles]        = useState([])
  const [loadingDet,          setLoadingDet]      = useState(false)
  const [filterDet,           setFilterDet]       = useState('')
  const [confirmDetId,        setConfirmDetId]    = useState(null)
  const [showModal,           setShowModal]       = useState(false)
  const [detalleEdit,         setDetalleEdit]     = useState(null)
  const [facturaParaPago, setFacturaParaPago] = useState(null)


  // ── Fetch facturas ────────────────────────────────────────
  const fetchFacturas = () => {
    setLoading(true)
    getFacturas()
      .then(res => {
        const lista = res.data ?? []
        setFacturas(lista)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchFacturas() }, [])

  // ── Fetch detalles ────────────────────────────────────────
  const fetchDetalles = useCallback((fact) => {
    if (!fact) { setDetalles([]); return }
    setLoadingDet(true)
    getDetallesByFactura(fact.idFactura)
      .then(res => {
        const lista = res.data ?? []
        setDetalles(lista)
      })
      .catch(() => setDetalles([]))
      .finally(() => setLoadingDet(false))
  }, [])

  useEffect(() => { fetchDetalles(facturaSeleccionada) }, [facturaSeleccionada, fetchDetalles])

  // ── Editar factura (async state fix) ─────────────────────
  const handleEditarFactura = (f) => {
    setFacturaEdit(f)
    setPendingOpenFactura(true)
  }
  useEffect(() => {
    if (pendingOpenFactura && facturaEdit) {
      setShowFacturaModal(true)
      setPendingOpenFactura(false)
    }
  }, [facturaEdit, pendingOpenFactura])

  // ── Editar detalle (async state fix) ─────────────────────
  const handleEditarDetalle = (det) => {
    setDetalleEdit(det)
    setPendingOpenDetalle(true)
  }
  useEffect(() => {
    if (pendingOpenDetalle && detalleEdit) {
      setShowModal(true)
      setPendingOpenDetalle(false)
    }
  }, [detalleEdit, pendingOpenDetalle])

  // ── Nueva posición ────────────────────────────────────────
  const handleNuevaPosicion = useCallback(() => {
    if (!facturaSeleccionada) { alert('Selecciona primero una factura'); return }
    setDetalleEdit(null)
    setShowModal(true)
  }, [facturaSeleccionada])

  useEffect(() => {
    onRegisterTaskHandler?.('Nueva posición', handleNuevaPosicion)
  }, [handleNuevaPosicion, onRegisterTaskHandler])

  // ── Filtrado y paginación ─────────────────────────────────
  const facturasFiltradas = facturas.filter(f => {
    const textoOk  = !filterFact   || Object.values(f).some(v =>
      String(v).toLowerCase().includes(filterFact.toLowerCase()))
    const estadoOk = !filterEstado || f.estado === filterEstado
    return textoOk && estadoOk
  })

  const totalPaginas   = Math.max(1, Math.ceil(facturasFiltradas.length / porPagina))
  const paginaSegura   = Math.min(paginaActual, totalPaginas)
  const facturasPagina = facturasFiltradas.slice(
    (paginaSegura - 1) * porPagina, paginaSegura * porPagina)
  const irA = (p) => setPaginaActual(Math.max(1, Math.min(p, totalPaginas)))

  const numPages = () => {
    const pages = [], delta = 1
    for (let i = 1; i <= totalPaginas; i++) {
      if (i === 1 || i === totalPaginas || (i >= paginaSegura - delta && i <= paginaSegura + delta))
        pages.push(i)
      else if (pages[pages.length - 1] !== '...') pages.push('...')
    }
    return pages
  }

  useEffect(() => { setPaginaActual(1) }, [filterFact, filterEstado, porPagina])
  useEffect(() => {
    if (facturaSeleccionada && !facturasFiltradas.find(f => f.idFactura === facturaSeleccionada.idFactura))
      setFacturaSelec(null)
  }, [filterFact, filterEstado]) // eslint-disable-line

  // ── Eliminar factura ──────────────────────────────────────
  const handleEliminarFact = async (id) => {
    try {
      await deleteFactura(id)
      setConfirmFactId(null)
      if (facturaSeleccionada?.idFactura === id) setFacturaSelec(null)
      fetchFacturas()
    } catch (err) { alert('Error al eliminar factura: ' + err.message) }
  }

  // ── Eliminar detalle ──────────────────────────────────────
  const handleEliminarDet = async (id) => {
    try {
      await deleteDetalle(id)
      setConfirmDetId(null)
      fetchDetalles(facturaSeleccionada)
    } catch (err) { alert('Error al eliminar posición: ' + err.message) }
  }

  // ── Guardar detalle ───────────────────────────────────────
  const handleSaved = () => {
    setShowModal(false)
    setDetalleEdit(null)
    fetchDetalles(facturaSeleccionada)
  }

  // ── Cerrar modales ────────────────────────────────────────
  const handleCloseFacturaModal = () => { setShowFacturaModal(false); setFacturaEdit(null) }
  const handleCloseDetalleModal = () => { setShowModal(false); setDetalleEdit(null) }

  // ── Totales detalles ──────────────────────────────────────
  const detalleFiltrado = detalles.filter(d =>
    !filterDet || Object.values(d).some(v =>
      String(v).toLowerCase().includes(filterDet.toLowerCase())))

  const totDet = detalles.reduce(
    (a, d) => ({
      neto:  a.neto  + Number(d.subtotalNeto || 0),
      iva:   a.iva   + Number(d.montoIva     || 0),
      total: a.total + Number(d.totalLinea   || 0),
    }),
    { neto: 0, iva: 0, total: 0 }
  )

  if (loading) return (
    <div className="text-center py-5 text-muted">
      <div className="spinner-border spinner-border-sm me-2" />Cargando facturas...
    </div>
  )
  if (error) return (
    <div className="alert alert-danger py-2">
      <i className="bi bi-exclamation-circle me-2" />{error}
    </div>
  )

  return (
    <div className="d-flex flex-column h-100 gap-3" style={{ overflowY: 'auto' }}>

      {/* ══ ENCABEZADO FACTURAS ═════════════════════════════ */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white d-flex align-items-center justify-content-between py-2 flex-wrap gap-2"
          style={{ borderBottom: `2px solid ${modColor}` }}>
          <span className="fw-bold" style={{ color: modColor }}>
            <i className="bi bi-receipt-cutoff me-2" />Encabezado de Facturas
          </span>
          <div className="d-flex gap-2 align-items-center flex-wrap">
            <div className="input-group input-group-sm" style={{ width: 200 }}>
              <span className="input-group-text bg-white">
                <i className="bi bi-search text-muted" style={{ fontSize: 11 }} />
              </span>
              <input className="form-control border-start-0" placeholder="Filtrar..."
                value={filterFact} onChange={e => setFilterFact(e.target.value)} />
              {filterFact && (
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setFilterFact('')}>
                  <i className="bi bi-x" />
                </button>
              )}
            </div>
            <select className="form-select form-select-sm" style={{ width: 130 }}
              value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
              <option value="">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Pagada">Pagada</option>
              <option value="Vencida">Vencida</option>
              <option value="Anulada">Anulada</option>
            </select>
            <div className="d-flex align-items-center gap-1">
              <span className="text-muted" style={{ fontSize: 12 }}>Mostrar</span>
              <select className="form-select form-select-sm" style={{ width: 65 }}
                value={porPagina} onChange={e => setPorPagina(Number(e.target.value))}>
                {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <button className="btn btn-sm btn-primary"
              onClick={() => { setFacturaEdit(null); setShowFacturaModal(true) }}>
              <i className="bi bi-plus-lg me-1" />Nueva Factura
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table table-hover table-sm cms-table mb-0" style={{ fontSize: 12 }}>
            <thead className="table-light">
              <tr>
                <th style={{ width: 30 }} /><th>#</th><th>Serie/Número</th>
                <th>Receptor</th><th>NIT</th><th>F. Emisión</th><th>Vencimiento</th>
                <th className="text-end">Subtotal</th><th className="text-end">IVA</th>
                <th className="text-end">Total</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {facturasPagina.length === 0 ? (
                <tr><td colSpan={12} className="text-center text-muted py-4">
                  <i className="bi bi-inbox me-2" />Sin registros
                </td></tr>
              ) : facturasPagina.map((f, fIdx) => (
                <tr key={f.idFactura ?? `fact-row-${fIdx}`}
                  style={{ cursor: 'pointer', background: facturaSeleccionada?.idFactura === f.idFactura ? `${modColor}12` : undefined }}
                  onClick={() => setFacturaSelec(prev => prev?.idFactura === f.idFactura ? null : f)}>
                  <td className="text-center align-middle">
                    {facturaSeleccionada?.idFactura === f.idFactura &&
                      <i className="bi bi-caret-right-fill" style={{ color: modColor, fontSize: 12 }} />}
                  </td>
                  <td className="text-muted">{f.idFactura}</td>
                  <td className="fw-semibold" style={{ color: modColor }}>
                    {f.serie ? `${f.serie}-${f.numeroFactura}` : f.numeroFactura ?? '—'}
                  </td>
                  <td>{f.receptorNombre ?? '—'}</td>
                  <td>{f.receptorNit ?? '—'}</td>
                  <td>{f.fechaEmision?.substring(0, 10) ?? '—'}</td>
                  <td>{f.fechaVencimiento?.substring(0, 10) ?? '—'}</td>
                  <td className="text-end">{fmt(f.subtotal)}</td>
                  <td className="text-end">{fmt(f.totalIva)}</td>
                  <td className="text-end fw-semibold">{fmt(f.total)}</td>
                  <td>
                    <span className={`badge text-bg-${STATUS_COLOR[f.estado] || 'secondary'}`}>
                      {f.estado}
                    </span>
                  </td>
                  <td onClick={ev => ev.stopPropagation()}>
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-outline-primary py-0 px-1"
                        onClick={() => handleEditarFactura(f)}>
                        <i className="bi bi-pencil" style={{ fontSize: 11 }} />
                      </button>
                      <button className="btn btn-sm btn-outline-success py-0 px-1"
                        onClick={() => {
                          setFacturaParaPago(f)   // ✅ guardar la factura seleccionada
                          setShowPagoModal(true)
                        }}>
                        <i className="bi bi-cash-coin" style={{ fontSize: 11 }} />
                      </button>
                      {confirmFactId === f.idFactura ? (
                        <Fragment key={`confirm-fact-${f.idFactura}`}>
                          <span className="text-danger align-self-center" style={{ fontSize: 11 }}>¿Eliminar?</span>
                          <button className="btn btn-sm btn-danger py-0 px-1"
                            onClick={() => handleEliminarFact(f.idFactura)}>Sí</button>
                          <button className="btn btn-sm btn-outline-secondary py-0 px-1"
                            onClick={() => setConfirmFactId(null)}>No</button>
                        </Fragment>
                      ) : (
                        <button className="btn btn-sm btn-outline-danger py-0 px-1"
                          onClick={() => setConfirmFactId(f.idFactura)}>
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
            {facturasFiltradas.length === 0 ? 'Sin registros'
              : `Mostrando ${(paginaSegura - 1) * porPagina + 1}–${Math.min(paginaSegura * porPagina, facturasFiltradas.length)} de ${facturasFiltradas.length} registros`}
          </small>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${paginaSegura === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => irA(1)}>
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
                <button className="page-link" onClick={() => irA(paginaSegura + 1)}>
                  <i className="bi bi-chevron-right" style={{ fontSize: 11 }} />
                </button>
              </li>
              <li className={`page-item ${paginaSegura === totalPaginas ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => irA(totalPaginas)}>
                  <i className="bi bi-chevron-double-right" style={{ fontSize: 11 }} />
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* ══ POSICIONES ══════════════════════════════════════ */}
      <div className="card border-0 shadow-sm flex-fill" style={{ minHeight: 0 }}>
        <div className="card-header bg-white d-flex align-items-center justify-content-between py-2 flex-wrap gap-2"
          style={{ borderBottom: `2px solid ${modColor}` }}>
          <span className="fw-bold text-muted">
            <i className="bi bi-list-ul me-2" />
            {facturaSeleccionada
              ? <>Posiciones — <span style={{ color: modColor }}>
                  {facturaSeleccionada.serie
                    ? `${facturaSeleccionada.serie}-${facturaSeleccionada.numeroFactura}`
                    : facturaSeleccionada.numeroFactura ?? `#${facturaSeleccionada.idFactura}`}
                </span> · {facturaSeleccionada.receptorNombre}</>
              : 'Posiciones (selecciona una factura arriba)'}
          </span>
          <div className="d-flex gap-2 align-items-center">
            {facturaSeleccionada && (
              <div className="input-group input-group-sm" style={{ width: 170 }}>
                <span className="input-group-text bg-white">
                  <i className="bi bi-search text-muted" style={{ fontSize: 11 }} />
                </span>
                <input className="form-control border-start-0" placeholder="Filtrar posiciones..."
                  value={filterDet} onChange={e => setFilterDet(e.target.value)} />
              </div>
            )}
            {facturaSeleccionada && (
              <button className="btn btn-sm"
                style={{ background: `${modColor}18`, border: `1px solid ${modColor}44`, color: modColor }}
                onClick={handleNuevaPosicion}>
                <i className="bi bi-plus-lg me-1" />Nueva Posición
              </button>
            )}
          </div>
        </div>

        {!facturaSeleccionada ? (
          <div className="d-flex align-items-center justify-content-center text-muted flex-column py-5">
            <i className="bi bi-arrow-up-circle fs-1 mb-2 opacity-25" />
            <span style={{ fontSize: 13 }}>Haz clic en una factura del encabezado para ver sus posiciones</span>
          </div>
        ) : loadingDet ? (
          <div className="text-center py-4 text-muted">
            <div className="spinner-border spinner-border-sm me-2" />Cargando posiciones...
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="table table-hover table-sm cms-table mb-0" style={{ fontSize: 12 }}>
                <thead className="table-light">
                  <tr>
                    <th>Pos.</th><th>Descripción</th>
                    <th className="text-end">Cant.</th><th className="text-end">Precio Unit.</th>
                    <th className="text-end">Desc. %</th><th className="text-end">Desc. Monto</th>
                    <th className="text-end">Subtotal Neto</th><th className="text-center">IVA</th>
                    <th className="text-end">Monto IVA</th><th className="text-end">Total</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {detalleFiltrado.length === 0 ? (
                    <tr><td colSpan={11} className="text-center text-muted py-3">
                      <i className="bi bi-inbox me-2" />
                      {filterDet ? 'Sin resultados para ese filtro' : 'Sin posiciones. Usa "+ Nueva Posición"'}
                    </td></tr>
                  ) : detalleFiltrado.map((det, dIdx) => (
                    <tr key={det.idDetalle ?? `det-row-${dIdx}`}>
                      <td className="text-muted">{det.numeroLinea}</td>
                      <td>{det.descripcion}</td>
                      <td className="text-end">{det.cantidad}</td>
                      <td className="text-end">{fmt(det.precioUnitario)}</td>
                      <td className="text-end">{det.descuentoPorcentaje ?? 0}%</td>
                      <td className="text-end">{fmt(det.descuentoMonto)}</td>
                      <td className="text-end">{fmt(det.subtotalNeto)}</td>
                      <td className="text-center">
                        {det.aplicaIva
                          ? <span className="badge text-bg-info">{det.porcentajeIva}%</span>
                          : <span className="text-muted">—</span>}
                      </td>
                      <td className="text-end">{fmt(det.montoIva)}</td>
                      <td className="text-end fw-semibold">{fmt(det.totalLinea)}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <button className="btn btn-sm btn-outline-primary py-0 px-1"
                            onClick={() => handleEditarDetalle(det)}>
                            <i className="bi bi-pencil" style={{ fontSize: 11 }} />
                          </button>
                          {confirmDetId === det.idDetalle ? (
                            <Fragment key={`confirm-det-${det.idDetalle}`}>
                              <span className="text-danger align-self-center" style={{ fontSize: 11 }}>¿Eliminar?</span>
                              <button className="btn btn-sm btn-danger py-0 px-1"
                                onClick={() => handleEliminarDet(det.idDetalle)}>Sí</button>
                              <button className="btn btn-sm btn-outline-secondary py-0 px-1"
                                onClick={() => setConfirmDetId(null)}>No</button>
                            </Fragment>
                          ) : (
                            <button className="btn btn-sm btn-outline-danger py-0 px-1"
                              onClick={() => setConfirmDetId(det.idDetalle)}>
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
            <div className="card-footer bg-white d-flex justify-content-end gap-4 py-2"
              style={{ fontSize: 13 }}>
              <span>Neto: <strong>{fmt(totDet.neto)}</strong></span>
              <span>+ IVA: <strong>{fmt(totDet.iva)}</strong></span>
              <span className="fw-bold fs-6" style={{ color: modColor }}>
                Total: {fmt(totDet.total)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* ══ MODALES ═════════════════════════════════════════ */}
      <FacturaModal
        show={showFacturaModal}
        factura={facturaEdit}
        modColor={modColor}
        onClose={handleCloseFacturaModal}
        onSaved={() => { handleCloseFacturaModal(); fetchFacturas() }}
      />

      <DetalleFacturaModal
        show={showModal}
        detalle={detalleEdit}
        factura={facturaSeleccionada}
        modColor={modColor}
        numeroLinea={
          detalles.length === 0 ? 1 
          : Math.max(...detalles.map(d => d.numeroLinea ?? 0)) + 1
        }
        onClose={handleCloseDetalleModal}
        onSaved={handleSaved}
      />

      <PagoModal
        show={showPagoModal}
        pago={null}
        facturaInicial={facturaParaPago}   // ✅ nueva prop
        onClose={() => { setShowPagoModal(false); setFacturaParaPago(null) }}
        onSaved={() => { setShowPagoModal(false); setFacturaParaPago(null); fetchFacturas() }}
      />
    </div>
  )
}