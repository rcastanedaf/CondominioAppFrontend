import { useState, useEffect, useCallback } from 'react'
import { usePaginacion }       from '../../shared/hooks/usePaginacion'
import PagoModal               from './PagoModal'
import { getResidentes, getPersonas, getPagosByResidente } from './residentePagoService'
import { createPago, updatePago, deletePago } from './pagoService'
const fmt = (n) => `Q ${Number(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`

const ESTADO_PAGO_COLOR = {
  PENDIENTE:   'warning',
  CONFIRMADO:  'success',
  RECHAZADO:   'danger',
  REVERTIDO:   'secondary',
}

// ── Helper: normaliza un pago crudo del backend ──────────────────────────────
function normalizePago(p) {
  return {
    id:               p.IdPago          ?? p.idPago,   // usado en key / tabla
    idPago:           p.IdPago          ?? p.idPago,   // ✅ FIX: necesario para el modal al editar
    idFactura:        p.IdFactura        ?? p.idFactura,
    numeroRecibo:     p.NumeroRecibo     ?? p.numeroRecibo,
    fechaPago:        p.FechaPago        ?? p.fechaPago,
    fechaValor:       p.FechaValor       ?? p.fechaValor,
    montoPagado:      p.MontoPagado      ?? p.montoPagado,
    idMoneda:         p.IdMoneda         ?? p.idMoneda,
    tipoCambio:       p.TipoCambio       ?? p.tipoCambio,
    montoEnGtq:       p.MontoEnGtq       ?? p.montoEnGtq,
    idMetodoPago:     p.IdMetodoPago     ?? p.idMetodoPago,
    idBancoOrigen:    p.IdBancoOrigen    ?? p.idBancoOrigen,
    idBancoDestino:   p.IdBancoDestino   ?? p.idBancoDestino,
    referencia:       p.Referencia       ?? p.referencia,
    imagenVoucherUrl: p.ImagenVoucherUrl ?? p.imagenVoucherUrl,
    estado:           p.Estado           ?? p.estado,
    registradoPor:    p.RegistradoPor    ?? p.registradoPor,
    aprobadoPor:      p.AprobadoPor      ?? p.aprobadoPor,
    observaciones:    p.Observaciones    ?? p.observaciones,
  }
}

export default function PagosResidente({ modColor = '#0dcaf0', onRegisterTaskHandler }) {

  // ── Residentes ────────────────────────────────────────────
  const [residentes,      setResidentes]   = useState([])
  const [loadingRes,      setLoadingRes]   = useState(true)
  const [errorRes,        setErrorRes]     = useState(null)
  const [resSeleccionado, setResSelec]     = useState(null)
  const [filterTipo,      setFilterTipo]   = useState('')
  const [personas,        setPersonas]     = useState([])
  const [todosPagos,      setTodosPagos]   = useState([])

  // Paginación residentes
  const resFiltradosTipo = residentes.filter(r =>
    !filterTipo || r.tipoResidente === filterTipo
  )
  const {
    datosPagina: resPagina, datosFiltrados: resFiltrados,
    filtro: filtroRes,      setFiltro: setFiltroRes,
    paginaSegura: pagRes,   totalPaginas: totPagRes,
    porPagina: ppRes,       setPorPagina: setPpRes,
    irA: irARes,            paginas: paginasRes,
  } = usePaginacion(resFiltradosTipo)

  // ── Pagos ─────────────────────────────────────────────────
  const [pagos,        setPagos]       = useState([])
  const [loadingPag,   setLoadingPag]  = useState(false)
  const [errorPag,     setErrorPag]    = useState(null)
  const [filterEstPag, setFilterEstPag]= useState('')

  const pagosFiltradosEst = pagos.filter(p =>
    !filterEstPag || p.estado === filterEstPag
  )
  const {
    datosPagina: pagPagina, datosFiltrados: pagFiltrados,
    filtro: filtroPag,      setFiltro: setFiltroPag,
    paginaSegura: pagPag,   totalPaginas: totPagPag,
    porPagina: ppPag,       setPorPagina: setPpPag,
    irA: irAPag,            paginas: paginasPag,
  } = usePaginacion(pagosFiltradosEst)

  // ── Modal ─────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false)
  const [pagoEdit,  setPagoEdit]  = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  // ── Cargar residentes ─────────────────────────────────────
  useEffect(() => {
    setLoadingRes(true)
    Promise.all([getResidentes(), getPersonas()])
      .then(([resRes, perRes]) => {
        const listaResidentes = resRes.data?.data ?? []

        const listaPersonas = perRes.data?.data ?? []

        const enriched = listaResidentes.map(r => {
          const persona = listaPersonas.find(
            p => (p.id_Persona ?? p.Id_Persona) === (r.id_Persona ?? r.Id_Persona)
          )
          return {
            id:            r.id_Residente  ?? r.Id_Residente,
            id_Persona:    r.id_Persona    ?? r.Id_Persona,
            id_Propiedad:  r.id_Propiedad  ?? r.Id_Propiedad,
            tipoResidente: r.tipo_Residente ?? r.Tipo_Residente ?? r.tipoResidente,
            fechaIngreso:  r.fecha_Ingreso  ?? r.Fecha_Ingreso,
            estado:        r.estado ?? r.Estado,
            observaciones: r.observaciones  ?? r.Observaciones,
            nombres:       persona?.nombres      ?? persona?.Nombres      ?? `(Persona #${r.id_Persona ?? r.Id_Persona})`,
            apellidos:     persona?.apellidos    ?? persona?.Apellidos    ?? '',
            dpi:           persona?.dpi          ?? persona?.DPI          ?? '—',
            telefono:      persona?.telefono_Principal ?? persona?.Telefono_Principal ?? '—',
            email:         persona?.email        ?? persona?.Email        ?? '—',
          }
        })

        setResidentes(enriched)
      })
      .catch(err => setErrorRes(err.message))
      .finally(() => setLoadingRes(false))
  }, [])

  // Deseleccionar si desaparece del filtro
  useEffect(() => {
    if (resSeleccionado && !resFiltradosTipo.find(r => r.id === resSeleccionado.id)) {
      setResSelec(null)
    }
  }, [filterTipo]) // eslint-disable-line

  // ── Cargar pagos al seleccionar residente ─────────────────
  useEffect(() => {
    if (!resSeleccionado) { setPagos([]); return }
    setLoadingPag(true)
    setErrorPag(null)
    getPagosByResidente(resSeleccionado.id)
      .then(res => {
        const lista = res.data?.data ?? res.data  ?? []
        setPagos(lista.map(normalizePago))  // ✅ usa helper centralizado
      })
      .catch(err => setErrorPag(err.message))
      .finally(() => setLoadingPag(false))
  }, [resSeleccionado])

  // ── TaskPanel ─────────────────────────────────────────────
  const handleNuevoPago = useCallback(() => {
    if (!resSeleccionado) { alert('Selecciona primero un residente'); return }
    setPagoEdit(null); setShowModal(true)
  }, [resSeleccionado])

  useEffect(() => {
    onRegisterTaskHandler?.('Registrar pago', handleNuevoPago)
  }, [handleNuevoPago, onRegisterTaskHandler])

  // ── CRUD pagos ────────────────────────────────────────────
  const handleEditar = (p) => { setPagoEdit(p); setShowModal(true) }

  const handleEliminar = async (id) => {
    try {
      await deletePago(id)
      // ✅ FIX: ambas listas usan .id (que es el mismo valor que idPago)
      setPagos(prev => prev.filter(p => p.id !== id))
      setTodosPagos(prev => prev.filter(p => p.id !== id))
      setConfirmId(null)
    } catch (err) { alert('Error al eliminar: ' + err.message) }
  }

  const handleSaved = () => {
    setShowModal(false)
    if (resSeleccionado) {
      getPagosByResidente(resSeleccionado.id)
        .then(res => {
          const lista = Array.isArray(res.data.data) ? res.data : res.data?.data ?? []
          setPagos(lista.map(normalizePago))  // ✅ usa helper centralizado
        })
        .catch(err => setErrorPag(err.message))
    }
  }

  // ── Totales ───────────────────────────────────────────────
  const totalConfirmado  = pagos.filter(p => p.estado === 'CONFIRMADO').reduce((a, p) => a + Number(p.montoPagado), 0)
  const totalPendiente = pagos.filter(p => p.estado === 'PENDIENTE').reduce((a, p) => a + Number(p.montoPagado), 0)

  // ── Helper paginación ─────────────────────────────────────
  const BtnPag = ({ pagina, total, irA, paginas, color }) => (
    <ul className="pagination pagination-sm mb-0">
      <li className={`page-item ${pagina === 1 ? 'disabled' : ''}`}><button className="page-link" onClick={() => irA(1)}>«</button></li>
      <li className={`page-item ${pagina === 1 ? 'disabled' : ''}`}><button className="page-link" onClick={() => irA(pagina - 1)}>‹</button></li>
      {paginas().map((p, idx) =>
        p === '...'
          ? <li key={`e${idx}`} className="page-item disabled"><span className="page-link border-0 bg-transparent">…</span></li>
          : <li key={p} className="page-item">
              <button className="page-link"
                style={pagina === p ? { background: color, borderColor: color, color: '#fff' } : {}}
                onClick={() => irA(p)}>{p}</button>
            </li>
      )}
      <li className={`page-item ${pagina === total ? 'disabled' : ''}`}><button className="page-link" onClick={() => irA(pagina + 1)}>›</button></li>
      <li className={`page-item ${pagina === total ? 'disabled' : ''}`}><button className="page-link" onClick={() => irA(total)}>»</button></li>
    </ul>
  )

  // ─────────────────────────────────────────────────────────
  return (
    <div className="d-flex flex-column gap-3" style={{ overflowY: 'auto' }}>

      {/* ══ ENCABEZADO: RESIDENTES ══════════════════════════ */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-2 px-3"
          style={{ borderBottom: `2px solid ${modColor}` }}>

          {/* Fila 1: título + filtro tipo */}
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="fw-bold" style={{ color: modColor }}>
              <i className="bi bi-people me-2" />Residentes
            </span>
            <select className="form-select form-select-sm" style={{ width: 160 }}
              value={filterTipo} onChange={e => setFilterTipo(e.target.value)}>
              <option value="">Todos los tipos</option>
              {['PROPIETARIO','ARRENDATARIO','FAMILIAR'].map(t =>
                <option key={t} value={t}>{t}</option>
              )}
            </select>
          </div>

          {/* Fila 2: buscador + mostrar */}
          <div className="d-flex align-items-center justify-content-between gap-2">
            <div className="input-group input-group-sm" style={{ maxWidth: 300 }}>
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search text-muted" style={{ fontSize: 11 }} />
              </span>
              <input className="form-control border-start-0" placeholder="Buscar residente..."
                value={filtroRes} onChange={e => setFiltroRes(e.target.value)} />
              {filtroRes && (
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setFiltroRes('')}>
                  <i className="bi bi-x" />
                </button>
              )}
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted" style={{ fontSize: 12 }}>Mostrar</span>
              <select className="form-select form-select-sm" style={{ width: 70 }}
                value={ppRes} onChange={e => setPpRes(Number(e.target.value))}>
                {[5,10,20].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Tabla residentes */}
        {loadingRes ? (
          <div className="text-center py-4 text-muted">
            <div className="spinner-border spinner-border-sm me-2" />Cargando residentes...
          </div>
        ) : errorRes ? (
          <div className="alert alert-danger m-3 py-2">
            <i className="bi bi-exclamation-circle me-2" />{errorRes}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table table-hover table-sm cms-table mb-0" style={{ fontSize: 12 }}>
              <thead className="table-light">
                <tr>
                  <th style={{ width: 30 }} />
                  <th>#</th>
                  <th>Nombres</th>
                  <th>Apellidos</th>
                  <th>DPI</th>
                  <th>Propiedad</th>
                  <th>Tipo</th>
                  <th>Teléfono</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {resPagina.length === 0 ? (
                  <tr><td colSpan={9} className="text-center text-muted py-4">
                    <i className="bi bi-inbox me-2" />Sin residentes
                  </td></tr>
                ) : resPagina.map(r => (
                  <tr key={r.id}
                    style={{ cursor: 'pointer', background: resSeleccionado?.id === r.id ? `${modColor}18` : undefined }}
                    onClick={() => setResSelec(prev => prev?.id === r.id ? null : r)}
                  >
                    <td className="text-center align-middle">
                      {resSeleccionado?.id === r.id && (
                        <i className="bi bi-caret-right-fill" style={{ color: modColor, fontSize: 12 }} />
                      )}
                    </td>
                    <td className="text-muted">{r.id}</td>
                    <td className="fw-semibold">{r.nombres}</td>
                    <td>{r.apellidos}</td>
                    <td className="text-muted">{r.dpi}</td>
                    <td>
                      <span className="badge text-bg-light border" style={{ fontSize: 10 }}>
                        {r.idPropiedad ?? '—'}
                      </span>
                    </td>
                    <td>
                      <span className="badge text-bg-light border" style={{ fontSize: 10 }}>
                        {r.tipoResidente}
                      </span>
                    </td>
                    <td>{r.telefonoPrincipal ?? '—'}</td>
                    <td>
                      <span className={`badge text-bg-${r.activo === 1 ? 'success' : 'secondary'}`}>
                        {r.activo === 1 ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer paginación residentes */}
        <div className="card-footer bg-white d-flex align-items-center justify-content-between flex-wrap gap-2 py-2"
          style={{ borderTop: '1px solid #dee2e6' }}>
          <small className="text-muted">
            {resFiltrados.length === 0 ? 'Sin residentes'
              : `Mostrando ${(pagRes - 1) * ppRes + 1}–${Math.min(pagRes * ppRes, resFiltrados.length)} de ${resFiltrados.length} residentes`}
          </small>
          <nav><BtnPag pagina={pagRes} total={totPagRes} irA={irARes} paginas={paginasRes} color={modColor} /></nav>
        </div>
      </div>

      {/* ══ PAGOS DEL RESIDENTE ══════════════════════════════ */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-2 px-3"
          style={{ borderBottom: `2px solid ${modColor}` }}>

          {/* Fila 1: título + botón */}
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="fw-bold text-muted">
              <i className="bi bi-credit-card me-2" />
              {resSeleccionado
                ? <>Pagos — <span style={{ color: modColor }}>{resSeleccionado.nombres} {resSeleccionado.apellidos}</span></>
                : 'Pagos (selecciona un residente arriba)'}
            </span>
            {resSeleccionado && (
              <button className="btn btn-sm text-white" style={{ background: modColor }}
                onClick={handleNuevoPago}>
                <i className="bi bi-plus-lg me-1" />Registrar Pago
              </button>
            )}
          </div>

          {/* Fila 2: filtros (solo si hay residente) */}
          {resSeleccionado && (
            <div className="d-flex align-items-center justify-content-between gap-2">
              <div className="input-group input-group-sm" style={{ maxWidth: 260 }}>
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search text-muted" style={{ fontSize: 11 }} />
                </span>
                <input className="form-control border-start-0" placeholder="Filtrar pagos..."
                  value={filtroPag} onChange={e => setFiltroPag(e.target.value)} />
                {filtroPag && (
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => setFiltroPag('')}>
                    <i className="bi bi-x" />
                  </button>
                )}
              </div>
              <div className="d-flex align-items-center gap-2">
                <select className="form-select form-select-sm" style={{ width: 145 }}
                  value={filterEstPag} onChange={e => setFilterEstPag(e.target.value)}>
                  <option value="">Todos los estados</option>
                  {['PENDIENTE', 'CONFIRMADO', 'RECHAZADO', 'REVERTIDO'].map(e =>
                    <option key={e} value={e}>{e}</option>
                  )}
                </select>
                <span className="text-muted" style={{ fontSize: 12 }}>Mostrar</span>
                <select className="form-select form-select-sm" style={{ width: 70 }}
                  value={ppPag} onChange={e => setPpPag(Number(e.target.value))}>
                  {[5,10,20].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Contenido */}
        {!resSeleccionado ? (
          <div className="d-flex align-items-center justify-content-center text-muted flex-column py-5">
            <i className="bi bi-arrow-up-circle fs-1 mb-2 opacity-25" />
            <span style={{ fontSize: 13 }}>Selecciona un residente para ver sus pagos</span>
          </div>
        ) : loadingPag ? (
          <div className="text-center py-4 text-muted">
            <div className="spinner-border spinner-border-sm me-2" style={{ color: modColor }} />
            Cargando pagos...
          </div>
        ) : errorPag ? (
          <div className="alert alert-danger m-3 py-2">
            <i className="bi bi-exclamation-circle me-2" />{errorPag}
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="table table-hover table-sm cms-table mb-0" style={{ fontSize: 12 }}>
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>No. Recibo</th>
                    <th>Factura</th>
                    <th>Fecha Pago</th>
                    <th>Fecha Valor</th>
                    <th className="text-end">Monto</th>
                    <th>Método</th>
                    <th>Referencia</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pagPagina.length === 0 ? (
                    <tr><td colSpan={10} className="text-center text-muted py-4">
                      <i className="bi bi-inbox me-2" />Sin pagos registrados
                    </td></tr>
                  ) : pagPagina.map(p => (
                    <tr key={p.id}>
                      <td className="text-muted">{p.id}</td>
                      <td className="fw-semibold" style={{ color: modColor }}>{p.numeroRecibo}</td>
                      <td>{p.idFactura ?? '—'}</td>
                      <td>{p.fechaPago?.substring(0, 10)}</td>
                      <td className="text-muted">{p.fechaValor?.substring(0, 10)}</td>
                      <td className="text-end fw-semibold">{fmt(p.montoPagado)}</td>
                      <td>
                        <span className="badge text-bg-light border" style={{ fontSize: 10 }}>
                          {p.idMetodoPago ?? '—'}
                        </span>
                      </td>
                      <td className="text-muted">{p.referencia || '—'}</td>
                      <td>
                        <span className={`badge text-bg-${ESTADO_PAGO_COLOR[p.estado] || 'secondary'}`}>
                          {p.estado}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button className="btn btn-sm btn-outline-primary py-0 px-1"
                            onClick={() => handleEditar(p)}>
                            <i className="bi bi-pencil" style={{ fontSize: 11 }} />
                          </button>
                          {confirmId === p.id ? (
                            <>
                              <span className="text-danger small align-self-center">¿Eliminar?</span>
                              <button className="btn btn-sm btn-danger py-0 px-1"
                                onClick={() => handleEliminar(p.id)}>Sí</button>
                              <button className="btn btn-sm btn-outline-secondary py-0 px-1"
                                onClick={() => setConfirmId(null)}>No</button>
                            </>
                          ) : (
                            <button className="btn btn-sm btn-outline-danger py-0 px-1"
                              onClick={() => setConfirmId(p.id)}>
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

            {/* Footer: totales + paginación */}
            <div className="card-footer bg-white d-flex align-items-center justify-content-between flex-wrap gap-3 py-2"
              style={{ borderTop: '1px solid #dee2e6' }}>
              <div className="d-flex gap-4" style={{ fontSize: 13 }}>
                <span>Aplicados: <strong className="text-success">{fmt(totalConfirmado)}</strong></span>
                <span>Pendientes: <strong className="text-warning">{fmt(totalPendiente)}</strong></span>
                <span>Total: <strong style={{ color: modColor }}>{fmt(totalConfirmado + totalPendiente)}</strong></span>
              </div>
              <nav><BtnPag pagina={pagPag} total={totPagPag} irA={irAPag} paginas={paginasPag} color={modColor} /></nav>
            </div>
          </>
        )}
      </div>

      {/* Modal pago */}
      <PagoModal
        show={showModal}
        pago={pagoEdit}
        onClose={() => setShowModal(false)}
        onSaved={handleSaved}
      />
    </div>
  )
}
