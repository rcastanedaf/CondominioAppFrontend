import { useState, useEffect } from 'react'

export default function DetalleFacturaModal({ show, onClose, onSaved, detalle, factura, modColor = '#dc3545' }) {
  const [descripcion,         setDescripcion]         = useState('')
  const [cantidad,            setCantidad]            = useState(1)
  const [precioUnitario,      setPrecioUnitario]      = useState('')
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(0)
  const [aplicaIva,           setAplicaIva]           = useState(1)
  const [porcentajeIva,       setPorcentajeIva]       = useState(12)
  const [observaciones,       setObservaciones]       = useState('')
  const [error,               setError]               = useState(null)

  useEffect(() => {
    if (detalle) {
      setDescripcion(detalle.descripcion || '')
      setCantidad(detalle.cantidad || 1)
      setPrecioUnitario(detalle.precio_unitario || '')
      setDescuentoPorcentaje(detalle.descuento_porcentaje || 0)
      setAplicaIva(detalle.aplica_iva ?? 1)
      setPorcentajeIva(detalle.porcentaje_iva || 12)
      setObservaciones(detalle.observaciones || '')
    } else {
      setDescripcion(''); setCantidad(1); setPrecioUnitario('')
      setDescuentoPorcentaje(0); setAplicaIva(1); setPorcentajeIva(12); setObservaciones('')
    }
    setError(null)
  }, [detalle, show])

  // Cálculos en vivo
  const qty    = parseFloat(cantidad)       || 0
  const price  = parseFloat(precioUnitario) || 0
  const desc   = parseFloat(descuentoPorcentaje) || 0
  const iva    = aplicaIva ? parseFloat(porcentajeIva) || 0 : 0
  const bruto       = qty * price
  const descMonto   = bruto * (desc / 100)
  const neto        = bruto - descMonto
  const montoIva    = neto * (iva / 100)
  const totalLinea  = neto + montoIva
  const fmt = (n) => `Q ${n.toFixed(2)}`

  const handleSubmit = () => {
    if (!descripcion.trim()) return setError('La descripción es requerida')
    if (!precioUnitario || isNaN(precioUnitario)) return setError('El precio unitario es requerido')
    setError(null)
    onSaved({
      id: detalle?.id,
      descripcion, cantidad: qty, precio_unitario: price,
      descuento_porcentaje: desc, descuento_monto: descMonto,
      subtotal_bruto: bruto, subtotal_neto: neto,
      aplica_iva: aplicaIva, porcentaje_iva: iva,
      monto_iva: montoIva, total_linea: totalLinea,
      observaciones,
    })
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
                {detalle ? 'Editar Posición' : `Nueva Posición — ${factura?.correlativo}`}
              </h5>
              <button className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger py-2"><i className="bi bi-exclamation-circle me-2" />{error}</div>}
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-semibold">Descripción <span className="text-danger">*</span></label>
                  <input type="text" className="form-control" placeholder="Ej. Cuota mensual de mantenimiento" value={descripcion} onChange={e => setDescripcion(e.target.value)} autoFocus />
                </div>
                <div className="col-4">
                  <label className="form-label fw-semibold">Cantidad</label>
                  <input type="number" className="form-control" min="0" step="0.01" value={cantidad} onChange={e => setCantidad(e.target.value)} />
                </div>
                <div className="col-4">
                  <label className="form-label fw-semibold">Precio Unitario <span className="text-danger">*</span></label>
                  <input type="number" className="form-control" min="0" step="0.01" placeholder="0.00" value={precioUnitario} onChange={e => setPrecioUnitario(e.target.value)} />
                </div>
                <div className="col-4">
                  <label className="form-label fw-semibold">Descuento %</label>
                  <input type="number" className="form-control" min="0" max="100" step="0.01" value={descuentoPorcentaje} onChange={e => setDescuentoPorcentaje(e.target.value)} />
                </div>
                <div className="col-4">
                  <label className="form-label fw-semibold">Aplica IVA</label>
                  <select className="form-select" value={aplicaIva} onChange={e => setAplicaIva(Number(e.target.value))}>
                    <option value={1}>Sí</option>
                    <option value={0}>No</option>
                  </select>
                </div>
                {aplicaIva === 1 && (
                  <div className="col-4">
                    <label className="form-label fw-semibold">% IVA</label>
                    <input type="number" className="form-control" min="0" value={porcentajeIva} onChange={e => setPorcentajeIva(e.target.value)} />
                  </div>
                )}
                <div className="col-12">
                  <label className="form-label fw-semibold">Observaciones</label>
                  <textarea className="form-control" rows={2} value={observaciones} onChange={e => setObservaciones(e.target.value)} />
                </div>
              </div>

              {/* Preview de cálculos */}
              <div className="mt-3 p-3 rounded-3 d-flex gap-4 flex-wrap" style={{ background: `${modColor}08`, border: `1px solid ${modColor}22`, fontSize: 13 }}>
                <span>Bruto: <strong>{fmt(bruto)}</strong></span>
                <span>Desc: <strong className="text-danger">-{fmt(descMonto)}</strong></span>
                <span>Neto: <strong>{fmt(neto)}</strong></span>
                <span>IVA ({iva}%): <strong>{fmt(montoIva)}</strong></span>
                <span className="fw-bold" style={{ color: modColor }}>Total: {fmt(totalLinea)}</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSubmit} style={{ background: modColor, borderColor: modColor }}>
                {detalle ? 'Guardar cambios' : 'Agregar posición'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}