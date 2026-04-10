import { useState, useEffect, useCallback } from 'react'
import DetalleFacturaModal from './DetalleFacturaModal'
import FacturaModal from './FacturaModal'
import PagoModal from '../pagos/PagoModal'

// ── Mock data ────────────────────────────────────────────────
const MOCK_FACTURAS = [
  { id: 1,  correlativo: 'F-0001', residente: 'María González',   receptor_nombre: 'María González',   receptor_nit: '12345678', receptor_direccion: 'Zona 10, Guatemala', fecha_emision: '2026-04-01', fecha_vencimiento: '2026-04-30', total: 952.00,  total_iva: 102.00, total_descuentos: 0, subtotal: 850.00, estado: 'Pendiente', id_moneda: 1, tipo_cambio: 1 },
  { id: 2,  correlativo: 'F-0002', residente: 'Carlos Pérez',     receptor_nombre: 'Carlos Pérez',     receptor_nit: '87654321', receptor_direccion: 'Zona 1, Guatemala',  fecha_emision: '2026-04-01', fecha_vencimiento: '2026-04-30', total: 728.00,  total_iva: 78.00,  total_descuentos: 0, subtotal: 650.00, estado: 'Pagada',    id_moneda: 1, tipo_cambio: 1 },
  { id: 3,  correlativo: 'F-0003', residente: 'Ana Martínez',     receptor_nombre: 'Ana Martínez',     receptor_nit: '11223344', receptor_direccion: 'Zona 15, Guatemala', fecha_emision: '2026-04-01', fecha_vencimiento: '2026-04-15', total: 840.00,  total_iva: 90.00,  total_descuentos: 0, subtotal: 750.00, estado: 'Vencida',   id_moneda: 1, tipo_cambio: 1 },
  { id: 4,  correlativo: 'F-0004', residente: 'Luis Rodríguez',   receptor_nombre: 'Luis Rodríguez',   receptor_nit: '55667788', receptor_direccion: 'Zona 5, Guatemala',  fecha_emision: '2026-04-02', fecha_vencimiento: '2026-04-30', total: 224.00,  total_iva: 24.00,  total_descuentos: 0, subtotal: 200.00, estado: 'Pendiente', id_moneda: 1, tipo_cambio: 1 },
  { id: 5,  correlativo: 'F-0005', residente: 'Sofía Torres',     receptor_nombre: 'Sofía Torres',     receptor_nit: '99887766', receptor_direccion: 'Zona 14, Guatemala', fecha_emision: '2026-04-02', fecha_vencimiento: '2026-04-30', total: 1008.00, total_iva: 108.00, total_descuentos: 0, subtotal: 900.00, estado: 'Pagada',    id_moneda: 1, tipo_cambio: 1 },
  { id: 6,  correlativo: 'F-0006', residente: 'Diego Herrera',    receptor_nombre: 'Diego Herrera',    receptor_nit: '33221100', receptor_direccion: 'Zona 13, Guatemala', fecha_emision: '2026-04-03', fecha_vencimiento: '2026-04-30', total: 168.00,  total_iva: 18.00,  total_descuentos: 0, subtotal: 150.00, estado: 'Pagada',    id_moneda: 1, tipo_cambio: 1 },
  { id: 7,  correlativo: 'F-0007', residente: 'Carmen Vásquez',   receptor_nombre: 'Carmen Vásquez',   receptor_nit: '44556677', receptor_direccion: 'Zona 7, Guatemala',  fecha_emision: '2026-04-03', fecha_vencimiento: '2026-04-15', total: 840.00,  total_iva: 90.00,  total_descuentos: 0, subtotal: 750.00, estado: 'Vencida',   id_moneda: 1, tipo_cambio: 1 },
  { id: 8,  correlativo: 'F-0008', residente: 'Roberto Méndez',   receptor_nombre: 'Roberto Méndez',   receptor_nit: '77665544', receptor_direccion: 'Zona 11, Guatemala', fecha_emision: '2026-04-04', fecha_vencimiento: '2026-04-30', total: 112.00,  total_iva: 12.00,  total_descuentos: 0, subtotal: 100.00, estado: 'Pendiente', id_moneda: 1, tipo_cambio: 1 },
  { id: 9,  correlativo: 'F-0009', residente: 'Laura Castillo',   receptor_nombre: 'Laura Castillo',   receptor_nit: '22334455', receptor_direccion: 'Zona 16, Guatemala', fecha_emision: '2026-04-04', fecha_vencimiento: '2026-04-30', total: 952.00,  total_iva: 102.00, total_descuentos: 0, subtotal: 850.00, estado: 'Pagada',    id_moneda: 1, tipo_cambio: 1 },
  { id: 10, correlativo: 'F-0010', residente: 'Miguel Fuentes',   receptor_nombre: 'Miguel Fuentes',   receptor_nit: '66778899', receptor_direccion: 'Zona 4, Guatemala',  fecha_emision: '2026-04-05', fecha_vencimiento: '2026-04-30', total: 336.00,  total_iva: 36.00,  total_descuentos: 0, subtotal: 300.00, estado: 'Pendiente', id_moneda: 1, tipo_cambio: 1 },
  { id: 11, correlativo: 'F-0011', residente: 'Patricia Ruiz',    receptor_nombre: 'Patricia Ruiz',    receptor_nit: '00112233', receptor_direccion: 'Zona 2, Guatemala',  fecha_emision: '2026-04-05', fecha_vencimiento: '2026-04-30', total: 728.00,  total_iva: 78.00,  total_descuentos: 0, subtotal: 650.00, estado: 'Anulada',   id_moneda: 1, tipo_cambio: 1 },
  { id: 12, correlativo: 'F-0012', residente: 'Fernando Morales', receptor_nombre: 'Fernando Morales', receptor_nit: '88990011', receptor_direccion: 'Zona 9, Guatemala',  fecha_emision: '2026-04-06', fecha_vencimiento: '2026-04-30', total: 280.00,  total_iva: 30.00,  total_descuentos: 0, subtotal: 250.00, estado: 'Pagada',    id_moneda: 1, tipo_cambio: 1 },
]

const MOCK_DETALLES = [
  { id: 1, facturaId: 1, numero_linea: 1, descripcion: 'Cuota mensual de mantenimiento', cantidad: 1, precio_unitario: 500.00, descuento_porcentaje: 0, descuento_monto: 0, subtotal_bruto: 500.00, subtotal_neto: 500.00, aplica_iva: 1, porcentaje_iva: 12, monto_iva: 60.00,  total_linea: 560.00 },
  { id: 2, facturaId: 1, numero_linea: 2, descripcion: 'Servicio de vigilancia',          cantidad: 1, precio_unitario: 250.00, descuento_porcentaje: 0, descuento_monto: 0, subtotal_bruto: 250.00, subtotal_neto: 250.00, aplica_iva: 1, porcentaje_iva: 12, monto_iva: 30.00,  total_linea: 280.00 },
  { id: 3, facturaId: 1, numero_linea: 3, descripcion: 'Agua potable',                    cantidad: 1, precio_unitario: 100.00, descuento_porcentaje: 0, descuento_monto: 0, subtotal_bruto: 100.00, subtotal_neto: 100.00, aplica_iva: 0, porcentaje_iva: 0,  monto_iva: 0,     total_linea: 100.00 },
  { id: 4, facturaId: 2, numero_linea: 1, descripcion: 'Cuota mensual de mantenimiento', cantidad: 1, precio_unitario: 580.00, descuento_porcentaje: 0, descuento_monto: 0, subtotal_bruto: 580.00, subtotal_neto: 580.00, aplica_iva: 1, porcentaje_iva: 12, monto_iva: 69.60, total_linea: 649.60 },
]

// ── Helpers ──────────────────────────────────────────────────
const fmt = (n) =>
  `Q ${Number(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`

const STATUS_COLOR = {
  Pendiente: 'warning', Pagada: 'success', Vencida: 'danger', Anulada: 'secondary',
}

const PAGE_SIZE_OPTIONS = [5, 10, 20]

// ── Componente ───────────────────────────────────────────────
export default function FacturaDetalle({ modColor = '#dc3545', onRegisterTaskHandler }) {

  // Estado encabezados
  const [facturas,            setFacturas]     = useState(MOCK_FACTURAS)
  const [facturaSeleccionada, setFacturaSelec] = useState(null)
  const [filterFact,          setFilterFact]   = useState('')
  const [filterEstado,        setFilterEstado] = useState('') 
  const [showFacturaModal, setShowFacturaModal] = useState(false)
  const [facturaEdit,      setFacturaEdit]      = useState(null)
  const [showPagoModal, setShowPagoModal] = useState(false)

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1)
  const [porPagina,    setPorPagina]    = useState(5)

  // Estado posiciones
  const [detalles,     setDetalles]     = useState([])
  const [loadingDet,   setLoadingDet]   = useState(false)
  const [filterDet,    setFilterDet]    = useState('')
  const [confirmDetId, setConfirmDetId] = useState(null)

  // Modal
  const [showModal,   setShowModal]   = useState(false)
  const [detalleEdit, setDetalleEdit] = useState(null)
  const [selected, setSelected]   = useState(null)

  // ── Filtrado ─────────────────────────────────────────────
  const facturasFiltradas = facturas.filter(f => {
  const textoOk  = !filterFact   || Object.values(f).some(v =>
    String(v).toLowerCase().includes(filterFact.toLowerCase())
  )
  const estadoOk = !filterEstado || f.estado === filterEstado
  return textoOk && estadoOk
})

  // ── Paginación ───────────────────────────────────────────
  const totalPaginas   = Math.max(1, Math.ceil(facturasFiltradas.length / porPagina))
  const paginaSegura   = Math.min(paginaActual, totalPaginas)
  const facturasPagina = facturasFiltradas.slice(
    (paginaSegura - 1) * porPagina,
    paginaSegura * porPagina
  )

  const irA = (p) => setPaginaActual(Math.max(1, Math.min(p, totalPaginas)))

  const numPages = () => {
    const pages = []
    const delta = 1
    for (let i = 1; i <= totalPaginas; i++) {
      if (
        i === 1 ||
        i === totalPaginas ||
        (i >= paginaSegura - delta && i <= paginaSegura + delta)
      ) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...')
      }
    }
    return pages
  }

  // Resetear página si cambia el filtro o el tamaño
 useEffect(() => { setPaginaActual(1) }, [filterFact, filterEstado, porPagina])

  // Deseleccionar si la factura activa desaparece del filtro
useEffect(() => {
  if (facturaSeleccionada && !facturasFiltradas.find(f => f.id === facturaSeleccionada.id)) {
    setFacturaSelec(null)
  }
}, [filterFact, filterEstado])  // eslint-disable-line

  // ── Cargar posiciones ─────────────────────────────────────
  useEffect(() => {
    if (!facturaSeleccionada) { setDetalles([]); return }
    setLoadingDet(true)
    setTimeout(() => {
      setDetalles(MOCK_DETALLES.filter(d => d.facturaId === facturaSeleccionada.id))
      setLoadingDet(false)
    }, 300)
  }, [facturaSeleccionada])

  // ── TaskPanel handler ─────────────────────────────────────
  const handleNuevaPosicion = useCallback(() => {
    if (!facturaSeleccionada) { alert('Selecciona primero una factura'); return }
    setDetalleEdit(null)
    setShowModal(true)
  }, [facturaSeleccionada])

  useEffect(() => {
    onRegisterTaskHandler?.('Nueva posición', handleNuevaPosicion)
  }, [handleNuevaPosicion, onRegisterTaskHandler])

  // ── Acciones posiciones ───────────────────────────────────
  const handleEditar   = (det) => { setDetalleEdit(det); setShowModal(true) }
  const handleEliminar = (id)  => { setDetalles(prev => prev.filter(d => d.id !== id)); setConfirmDetId(null) }
  const handleSaved    = (det) => {
    if (detalleEdit) {
      setDetalles(prev => prev.map(d => d.id === det.id ? det : d))
    } else {
      setDetalles(prev => [
        ...prev,
        { ...det, id: Date.now(), facturaId: facturaSeleccionada.id, numero_linea: prev.length + 1 },
      ])
    }
    setShowModal(false)
  }

  const detalleFiltrado = detalles.filter(d =>
    Object.values(d).some(v => String(v).toLowerCase().includes(filterDet.toLowerCase()))
  )

  const totDet = detalles.reduce(
    (a, d) => ({ neto: a.neto + (d.subtotal_neto || 0), iva: a.iva + (d.monto_iva || 0), total: a.total + (d.total_linea || 0) }),
    { neto: 0, iva: 0, total: 0 }
  )

  // ────────────────────────────────────────────────────────
  return (
    <div className="d-flex flex-column h-100 gap-3">

      {/* ══ ENCABEZADO ══════════════════════════════════════ */}
      <div className="card border-0 shadow-sm">

        {/* Cabecera tarjeta */}
        <div className="card-header bg-white d-flex align-items-center justify-content-between py-2 flex-wrap gap-2">
          <span className="fw-bold" style={{ color: modColor }}>
            <i className="bi bi-receipt-cutoff me-2" />
            Encabezado de Facturas
          </span>

          <div className="d-flex gap-2 align-items-center flex-wrap">
            {/* Buscador */}
            <div className="input-group input-group-sm" style={{ width: 200 }}>
              <span className="input-group-text bg-white">
                <i className="bi bi-search text-muted" style={{ fontSize: 11 }} />
              </span>
              <input
                className="form-control border-start-0"
                placeholder="Filtrar..."
                value={filterFact}
                onChange={e => setFilterFact(e.target.value)}
              />
              {filterFact && (
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setFilterFact('')}>
                  <i className="bi bi-x" />
                </button>
              )}
            </div>

             {/* Filtro estado — AGREGAR */}
              <select
                className="form-select form-select-sm"
                style={{ width: 130 }}
                value={filterEstado}
                onChange={e => setFilterEstado(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Pagada">Pagada</option>
                <option value="Vencida">Vencida</option>
                <option value="Anulada">Anulada</option>
              </select>

            {/* Registros por página */}
            <div className="d-flex align-items-center gap-1">
              <span className="text-muted" style={{ fontSize: 12 }}>Mostrar</span>
              <select
                className="form-select form-select-sm"
                style={{ width: 65 }}
                value={porPagina}
                onChange={e => setPorPagina(Number(e.target.value))}
              >
                {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            <button className="btn btn-sm btn-primary" onClick={() => { setFacturaEdit(null); setShowFacturaModal(true) }}>
              <i className="bi bi-plus-lg me-1" />Nueva Factura
            </button>
          </div>
        </div>

        {/* Tabla — solo la página actual */}
        <div style={{ overflowX: 'auto' }}>
          <table className="table table-hover table-sm cms-table mb-0" style={{ fontSize: 12 }}>
            <thead className="table-light">
              <tr>
                <th style={{ width: 30 }} />
                <th>#</th>
                <th>Correlativo</th>
                <th>Residente</th>
                <th>NIT</th>
                <th>F. Emisión</th>
                <th>Vencimiento</th>
                <th className="text-end">Subtotal</th>
                <th className="text-end">IVA</th>
                <th className="text-end">Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {facturasPagina.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center text-muted py-4">
                    <i className="bi bi-inbox me-2" />Sin registros
                  </td>
                </tr>
              ) : (
                facturasPagina.map(f => (        // ← usa facturasPagina, no facturasFiltradas
                  <tr
                    key={f.id}
                    style={{
                      cursor: 'pointer',
                      background: facturaSeleccionada?.id === f.id ? `${modColor}12` : undefined,
                    }}
                    onClick={() => setFacturaSelec(prev => prev?.id === f.id ? null : f)}
                  >
                    <td className="text-center align-middle">
                      {facturaSeleccionada?.id === f.id && (
                        <i className="bi bi-caret-right-fill" style={{ color: modColor, fontSize: 12 }} />
                      )}
                    </td>
                    <td className="text-muted">{f.id}</td>
                    <td className="fw-semibold" style={{ color: modColor }}>{f.correlativo}</td>
                    <td>{f.residente}</td>
                    <td>{f.receptor_nit}</td>
                    <td>{f.fecha_emision}</td>
                    <td>{f.fecha_vencimiento}</td>
                    <td className="text-end">{fmt(f.subtotal)}</td>
                    <td className="text-end">{fmt(f.total_iva)}</td>
                    <td className="text-end fw-semibold">{fmt(f.total)}</td>
                    <td>
                      <span className={`badge text-bg-${STATUS_COLOR[f.estado] || 'secondary'}`}>
                        {f.estado}
                      </span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-sm btn-outline-primary py-0 px-1"
                          onClick={() => { setFacturaEdit(f); setShowFacturaModal(true) }}
                        >
                          <i className="bi bi-pencil" style={{ fontSize: 11 }} />
                        </button>
                        <button className="btn btn-sm btn-outline-success py-0 px-1" onClick={() => { setSelected(null); setShowPagoModal(true) }}>
                          <i className="bi bi-cash-coin" style={{ fontSize: 11 }} />
                        </button>
                        
                        {/* Eliminar — muestra confirmación inline */}
                        {setConfirmDetId === f.id ? (
                        <>
                        <span className="text-danger small align-self-center">¿Confirmar?</span>
                        <button
                          className="btn btn-sm btn-danger py-0 px-2"
                          onClick={() => handleEliminar(f.id)}
                        >
                          Sí
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary py-0 px-2"
                          onClick={() => setConfirmDetId(null)}
                        >
                          No
                        </button>
                      </>
                        ) : (
                        <button className="btn btn-sm btn-outline-danger py-0 px-1">
                          <i className="bi bi-x-circle" style={{ fontSize: 11 }} />
                        </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Footer paginación ── */}
        <div
          className="card-footer bg-white d-flex align-items-center justify-content-between flex-wrap gap-2 py-2"
          style={{ borderTop: '1px solid #dee2e6' }}
        >
          {/* Info registros */}
          <small className="text-muted">
            {facturasFiltradas.length === 0
              ? 'Sin registros'
              : `Mostrando ${(paginaSegura - 1) * porPagina + 1}–${Math.min(
                  paginaSegura * porPagina,
                  facturasFiltradas.length
                )} de ${facturasFiltradas.length} registros`}
          </small>

          {/* Botones de página */}
          <nav>
            <ul className="pagination pagination-sm mb-0">

              {/* Primera */}
              <li className={`page-item ${paginaSegura === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => irA(1)} title="Primera">
                  <i className="bi bi-chevron-double-left" style={{ fontSize: 11 }} />
                </button>
              </li>

              {/* Anterior */}
              <li className={`page-item ${paginaSegura === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => irA(paginaSegura - 1)} title="Anterior">
                  <i className="bi bi-chevron-left" style={{ fontSize: 11 }} />
                </button>
              </li>

              {/* Números */}
              {numPages().map((p, idx) =>
                p === '...'
                  ? (
                    <li key={`e-${idx}`} className="page-item disabled">
                      <span className="page-link border-0 bg-transparent">…</span>
                    </li>
                  ) : (
                    <li key={p} className="page-item">
                      <button
                        className="page-link"
                        style={
                          paginaSegura === p
                            ? { background: modColor, borderColor: modColor, color: '#fff' }
                            : {}
                        }
                        onClick={() => irA(p)}
                      >
                        {p}
                      </button>
                    </li>
                  )
              )}

              {/* Siguiente */}
              <li className={`page-item ${paginaSegura === totalPaginas ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => irA(paginaSegura + 1)} title="Siguiente">
                  <i className="bi bi-chevron-right" style={{ fontSize: 11 }} />
                </button>
              </li>

              {/* Última */}
              <li className={`page-item ${paginaSegura === totalPaginas ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => irA(totalPaginas)} title="Última">
                  <i className="bi bi-chevron-double-right" style={{ fontSize: 11 }} />
                </button>
              </li>

            </ul>
          </nav>
        </div>
      </div>

      {/* ══ POSICIONES ══════════════════════════════════════ */}
      <div className="card border-0 shadow-sm flex-fill" style={{ minHeight: 0 }}>

        <div className="card-header bg-white d-flex align-items-center justify-content-between py-2 flex-wrap gap-2">
          <span className="fw-bold text-muted">
            <i className="bi bi-list-ul me-2" />
            {facturaSeleccionada
              ? <>Posiciones — <span style={{ color: modColor }}>{facturaSeleccionada.correlativo}</span> · {facturaSeleccionada.residente}</>
              : 'Posiciones (selecciona una factura arriba)'}
          </span>

          <div className="d-flex gap-2 align-items-center">
            {facturaSeleccionada && (
              <div className="input-group input-group-sm" style={{ width: 170 }}>
                <span className="input-group-text bg-white">
                  <i className="bi bi-search text-muted" style={{ fontSize: 11 }} />
                </span>
                <input
                  className="form-control border-start-0"
                  placeholder="Filtrar posiciones..."
                  value={filterDet}
                  onChange={e => setFilterDet(e.target.value)}
                />
              </div>
            )}
            {facturaSeleccionada && (
              <button
                className="btn btn-sm"
                style={{ background: `${modColor}18`, border: `1px solid ${modColor}44`, color: modColor }}
                onClick={handleNuevaPosicion}
              >
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
                    <th>Pos.</th>
                    <th>Descripción</th>
                    <th className="text-end">Cant.</th>
                    <th className="text-end">Precio Unit.</th>
                    <th className="text-end">Desc. %</th>
                    <th className="text-end">Desc. Monto</th>
                    <th className="text-end">Subtotal Neto</th>
                    <th className="text-center">IVA</th>
                    <th className="text-end">Monto IVA</th>
                    <th className="text-end">Total</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {detalleFiltrado.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="text-center text-muted py-3">
                        <i className="bi bi-inbox me-2" />
                        {filterDet ? 'Sin resultados para ese filtro' : 'Sin posiciones. Usa "+ Nueva Posición"'}
                      </td>
                    </tr>
                  ) : (
                    detalleFiltrado.map(det => (
                      <tr key={det.id}>
                        <td className="text-muted">{det.numero_linea}</td>
                        <td>{det.descripcion}</td>
                        <td className="text-end">{det.cantidad}</td>
                        <td className="text-end">{fmt(det.precio_unitario)}</td>
                        <td className="text-end">{det.descuento_porcentaje}%</td>
                        <td className="text-end">{fmt(det.descuento_monto)}</td>
                        <td className="text-end">{fmt(det.subtotal_neto)}</td>
                        <td className="text-center">
                          {det.aplica_iva
                            ? <span className="badge text-bg-info">{det.porcentaje_iva}%</span>
                            : <span className="text-muted">—</span>}
                        </td>
                        <td className="text-end">{fmt(det.monto_iva)}</td>
                        <td className="text-end fw-semibold">{fmt(det.total_linea)}</td>
                        <td>
                          <div className="d-flex gap-1">
                            <button
                              className="btn btn-sm btn-outline-primary py-0 px-1"
                              onClick={() => handleEditar(det)}
                            >
                              <i className="bi bi-pencil" style={{ fontSize: 11 }} />
                            </button>
                            {confirmDetId === det.id ? (
                              <>
                                <span className="text-danger small align-self-center">¿Eliminar?</span>
                                <button className="btn btn-sm btn-danger py-0 px-1" onClick={() => handleEliminar(det.id)}>Sí</button>
                                <button className="btn btn-sm btn-outline-secondary py-0 px-1" onClick={() => setConfirmDetId(null)}>No</button>
                              </>
                            ) : (
                              <button
                                className="btn btn-sm btn-outline-danger py-0 px-1"
                                onClick={() => setConfirmDetId(det.id)}
                              >
                                <i className="bi bi-trash" style={{ fontSize: 11 }} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Totales footer */}
            <div
              className="card-footer bg-white d-flex justify-content-end gap-4 py-2"
              style={{ fontSize: 13 }}
            >
              <span>Neto: <strong>{fmt(totDet.neto)}</strong></span>
              <span>+ IVA: <strong>{fmt(totDet.iva)}</strong></span>
              <span className="fw-bold fs-6" style={{ color: modColor }}>
                Bruto: {fmt(totDet.total)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Modal factura */}
      <FacturaModal
        show={showFacturaModal}
        factura={facturaEdit}
        modColor={modColor}
        onClose={() => setShowFacturaModal(false)}
        onSaved={(f) => {
          if (facturaEdit) {
            setFacturas(prev => prev.map(x => x.id === f.id ? f : x))
          } else {
            setFacturas(prev => [...prev, { ...f, id: Date.now() }])
          }
          setShowFacturaModal(false)
        }}
      />

      {/* Modal posición */}
      <DetalleFacturaModal
        show={showModal}
        detalle={detalleEdit}
        factura={facturaSeleccionada}
        modColor={modColor}
        onClose={() => setShowModal(false)}
        onSaved={handleSaved}
      />

      <PagoModal show={showPagoModal} pago={selected}
              onClose={() => setShowPagoModal(false)} onSaved={() => { setShowPagoModal(false); fetchData() }} />
    </div>
  )
}