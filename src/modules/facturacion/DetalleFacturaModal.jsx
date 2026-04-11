import { useState, useEffect } from 'react'
import { createDetalle, updateDetalle } from '../facturacion/facturacionService'
import FkSelector from '../../components/FkSelector'
import { getTipoServicios } from '../facturacion/tipoServicioService'
import { getConceptosDescuento } from '../facturacion/conceptoDescuentoService'

export default function DetalleFacturaModal({ show, onClose, onSaved, detalle, factura, numeroLinea, modColor = '#dc3545' }) {
  // ── FK selectors ───────────────────────────────────────────
  const [idTipoServicio,      setIdTipoServicio]      = useState('')
  const [labelTipoServicio,   setLabelTipoServicio]   = useState('')
  const [idConceptoDescuento, setIdConceptoDescuento] = useState('')
  const [labelConceptoDesc,   setLabelConceptoDesc]   = useState('')

  // ── Campos directos ────────────────────────────────────────
  const [descripcion,         setDescripcion]         = useState('')
  const [cantidad,            setCantidad]            = useState(1)
  const [precioUnitario,      setPrecioUnitario]      = useState('')
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(0)
  const [aplicaIva,           setAplicaIva]           = useState(1)
  const [porcentajeIva,       setPorcentajeIva]       = useState(12)
  const [periodoInicio,       setPeriodoInicio]       = useState('')
  const [periodoFin,          setPeriodoFin]          = useState('')
  const [observaciones,       setObservaciones]       = useState('')

  // ── UI ─────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  // ── Populate al abrir ──────────────────────────────────────
  useEffect(() => {
    if (!show) return
    if (detalle) {
      setIdTipoServicio(detalle.idTipoServicio           ?? ''); setLabelTipoServicio('')
      setIdConceptoDescuento(detalle.idConceptoDescuento ?? ''); setLabelConceptoDesc('')
      setDescripcion(detalle.descripcion                 ?? '')
      setCantidad(detalle.cantidad                       ?? 1)
      setPrecioUnitario(detalle.precioUnitario           ?? '')
      setDescuentoPorcentaje(detalle.descuentoPorcentaje ?? 0)
      setAplicaIva(detalle.aplicaIva                     ?? 1)
      setPorcentajeIva(detalle.porcentajeIva             ?? 12)
      setPeriodoInicio(detalle.periodoInicio?.substring(0, 10) ?? '')
      setPeriodoFin(detalle.periodoFin?.substring(0, 10)       ?? '')
      setObservaciones(detalle.observaciones             ?? '')
    } else {
      setIdTipoServicio('');      setLabelTipoServicio('')
      setIdConceptoDescuento(''); setLabelConceptoDesc('')
      setDescripcion(''); setCantidad(1); setPrecioUnitario('')
      setDescuentoPorcentaje(0); setAplicaIva(1); setPorcentajeIva(12)
      setPeriodoInicio(''); setPeriodoFin(''); setObservaciones('')
    }
    setError(null)
  }, [show]) // eslint-disable-line

  // ── Cálculos en vivo ───────────────────────────────────────
  const qty            = parseFloat(cantidad)            || 0
  const price          = parseFloat(precioUnitario)      || 0
  const descPct        = parseFloat(descuentoPorcentaje) || 0
  const ivaPct         = aplicaIva ? parseFloat(porcentajeIva) || 0 : 0
  const subtotalBruto  = qty * price
  const descuentoMonto = subtotalBruto * (descPct / 100)
  const subtotalNeto   = subtotalBruto - descuentoMonto
  const montoIva       = subtotalNeto * (ivaPct / 100)
  const totalLinea     = subtotalNeto + montoIva
  const fmt = (n) => `Q ${n.toFixed(2)}`

  // ── Submit ─────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!descripcion.trim())                      return setError('La descripción es requerida')
    if (!precioUnitario || isNaN(precioUnitario)) return setError('El precio unitario es requerido')
    if (!factura?.idFactura)                      return setError('No hay factura asociada')

    setLoading(true); setError(null)
    try {
      const payload = {
        // ✅ Solo propiedades que existen en DetalleFacturaModel
        IdDetalle:           detalle ? (detalle.idDetalle ?? detalle.id ?? 0) : 0,
        IdFactura:           Number(factura.idFactura),
        NumeroLinea:         detalle?.numeroLinea ?? numeroLinea ?? 1,
        IdTipoServicio:      Number(idTipoServicio) || null,
        Descripcion:         descripcion.trim(),
        Cantidad:            qty,
        PrecioUnitario:      price,
        DescuentoPorcentaje: descPct,
        DescuentoMonto:      descuentoMonto,
        SubtotalBruto:       subtotalBruto,
        SubtotalNeto:        subtotalNeto,
        AplicaIva:           aplicaIva,
        PorcentajeIva:       ivaPct,
        MontoIva:            montoIva,
        TotalLinea:          totalLinea,
        PeriodoInicio:       periodoInicio || null,
        PeriodoFin:          periodoFin   || null,
        Observaciones:       observaciones,
        // ✅ IdUnidadMedida e IdConceptoDescuento eliminados — no existen en el modelo C#
      }
      detalle ? await updateDetalle(payload) : await createDetalle(payload)
      onSaved()
    } catch (err) {
      setError(err.response?.data?.message ?? err.message)
    } finally { setLoading(false) }
  }

  if (!show) return null
  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose} />
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title" style={{ color: modColor }}>
                <i className="bi bi-list-ul me-2" />
                {detalle
                  ? 'Editar Posición'
                  : `Nueva Posición — ${factura?.correlativo ?? `Factura #${factura?.idFactura}`}`}
              </h5>
              <button className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              {error && (
                <div className="alert alert-danger py-2 mb-3">
                  <i className="bi bi-exclamation-circle me-2" />{error}
                </div>
              )}

              <div className="row g-3">

                {/* Descripción */}
                <div className="col-12">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>
                    Descripción <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Ej. Cuota mensual de mantenimiento"
                    value={descripcion}
                    onChange={e => setDescripcion(e.target.value)}
                    autoFocus
                  />
                </div>

                {/* Tipo Servicio */}
                <div className="col-md-6">
                  <FkSelector
                    label="Tipo de Servicio"
                    fetchFn={getTipoServicios}
                    getId={t => t.idTipoServicio ?? t.id}
                    getLabel={t => t.nombre ?? t.descripcion ?? `#${t.idTipoServicio ?? t.id}`}
                    value={idTipoServicio}
                    displayValue={labelTipoServicio}
                    onChange={(id, lbl) => { setIdTipoServicio(id); setLabelTipoServicio(lbl) }}
                    placeholder="Selecciona tipo de servicio..."
                  />
                </div>

                {/* Concepto Descuento — referencia visual, no persiste aún en BD */}
                <div className="col-md-6">
                  <FkSelector
                    label="Concepto de Descuento"
                    fetchFn={getConceptosDescuento}
                    getId={c => c.id ?? c.idConceptoDescuento}   // ✅ los objetos tienen 'id'
                    getLabel={c => c.nombre ?? c.descripcion ?? `#${c.id ?? c.idConceptoDescuento}`}
                    value={idConceptoDescuento}
                    displayValue={labelConceptoDesc}
                    onChange={(id, lbl) => { setIdConceptoDescuento(id); setLabelConceptoDesc(lbl) }}
                    placeholder="Selecciona concepto..."
                  />
                </div>

                {/* Cantidad / Precio / Descuento */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Cantidad</label>
                  <input
                    type="number" min="0" step="0.0001"
                    className="form-control form-control-sm"
                    value={cantidad}
                    onChange={e => setCantidad(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>
                    Precio Unitario <span className="text-danger">*</span>
                  </label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text">Q</span>
                    <input
                      type="number" min="0" step="0.0001"
                      className="form-control"
                      placeholder="0.00"
                      value={precioUnitario}
                      onChange={e => setPrecioUnitario(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Descuento %</label>
                  <div className="input-group input-group-sm">
                    <input
                      type="number" min="0" max="100" step="0.01"
                      className="form-control"
                      value={descuentoPorcentaje}
                      onChange={e => setDescuentoPorcentaje(e.target.value)}
                    />
                    <span className="input-group-text">%</span>
                  </div>
                </div>

                {/* IVA */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Aplica IVA</label>
                  <select
                    className="form-select form-select-sm"
                    value={aplicaIva}
                    onChange={e => setAplicaIva(Number(e.target.value))}
                  >
                    <option value={1}>Sí</option>
                    <option value={0}>No</option>
                  </select>
                </div>
                {aplicaIva === 1 && (
                  <div className="col-md-4">
                    <label className="form-label fw-semibold" style={{ fontSize: 13 }}>% IVA</label>
                    <div className="input-group input-group-sm">
                      <input
                        type="number" min="0" step="0.01"
                        className="form-control"
                        value={porcentajeIva}
                        onChange={e => setPorcentajeIva(e.target.value)}
                      />
                      <span className="input-group-text">%</span>
                    </div>
                  </div>
                )}

                {/* Período */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Período Inicio</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={periodoInicio}
                    onChange={e => setPeriodoInicio(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Período Fin</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={periodoFin}
                    onChange={e => setPeriodoFin(e.target.value)}
                  />
                </div>

                {/* Observaciones */}
                <div className="col-12">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Observaciones</label>
                  <textarea
                    className="form-control form-control-sm"
                    rows={2}
                    value={observaciones}
                    onChange={e => setObservaciones(e.target.value)}
                  />
                </div>
              </div>

              {/* ── Preview de cálculos ── */}
              <div
                className="mt-3 p-3 rounded-3 d-flex gap-4 flex-wrap align-items-center"
                style={{ background: `${modColor}08`, border: `1px solid ${modColor}22`, fontSize: 13 }}
              >
                <span className="text-muted">
                  Bruto: <strong className="text-dark">{fmt(subtotalBruto)}</strong>
                </span>
                <span className="text-muted">
                  Desc: <strong className="text-danger">-{fmt(descuentoMonto)}</strong>
                </span>
                <span className="text-muted">
                  Neto: <strong className="text-dark">{fmt(subtotalNeto)}</strong>
                </span>
                <span className="text-muted">
                  IVA ({ivaPct}%): <strong className="text-dark">{fmt(montoIva)}</strong>
                </span>
                <span className="ms-auto fw-bold fs-6" style={{ color: modColor }}>
                  Total línea: {fmt(totalLinea)}
                </span>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>
                Cancelar
              </button>
              <button
                className="btn text-white"
                style={{ background: modColor, borderColor: modColor }}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</>
                  : detalle ? 'Guardar cambios' : 'Agregar posición'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
