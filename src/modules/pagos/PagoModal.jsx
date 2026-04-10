import { useState, useEffect } from 'react'
import { createPago, updatePago } from './pagoService'

const ESTADOS = ['PENDIENTE', 'APLICADO', 'ANULADO', 'EN_REVISION']

export default function PagoModal({ show, onClose, onSaved, pago }) {
  const [idFactura,      setIdFactura]  = useState('')
  const [numeroRecibo,   setNumRecibo]  = useState('')
  const [fechaPago,      setFechaPago]  = useState('')
  const [fechaValor,     setFechaValor] = useState('')
  const [montoPagado,    setMonto]      = useState('')
  const [idMoneda,       setIdMoneda]   = useState('')
  const [tipoCambio,     setTipoCambio] = useState('')
  const [montoEnGtq,     setMontoGtq]   = useState('')
  const [idMetodoPago,   setMetodo]     = useState('')
  const [idBancoOrigen,  setBancoOr]    = useState('')
  const [idBancoDest,    setBancoDest]  = useState('')
  const [referencia,     setReferencia] = useState('')
  const [imagenUrl,      setImgUrl]     = useState('')
  const [estado,         setEstado]     = useState('PENDIENTE')
  const [observaciones,  setObs]        = useState('')
  const [loading,        setLoading]    = useState(false)
  const [error,          setError]      = useState(null)

  useEffect(() => {
    if (pago) {
      setIdFactura(pago.idFactura ?? ''); setNumRecibo(pago.numeroRecibo ?? '')
      setFechaPago(pago.fechaPago?.substring(0, 10) ?? '')
      setFechaValor(pago.fechaValor?.substring(0, 10) ?? '')
      setMonto(pago.montoPagado ?? ''); setIdMoneda(pago.idMoneda ?? '')
      setTipoCambio(pago.tipoCambio ?? ''); setMontoGtq(pago.montoEnGtq ?? '')
      setMetodo(pago.idMetodoPago ?? ''); setBancoOr(pago.idBancoOrigen ?? '')
      setBancoDest(pago.idBancoDestino ?? ''); setReferencia(pago.referencia ?? '')
      setImgUrl(pago.imagenVoucherUrl ?? ''); setEstado(pago.estado ?? 'PENDIENTE')
      setObs(pago.observaciones ?? '')
    } else {
      setIdFactura(''); setNumRecibo(''); setFechaPago(''); setFechaValor('')
      setMonto(''); setIdMoneda(''); setTipoCambio(''); setMontoGtq('')
      setMetodo(''); setBancoOr(''); setBancoDest(''); setReferencia('')
      setImgUrl(''); setEstado('PENDIENTE'); setObs('')
    }
    setError(null)
  }, [pago, show])

  const handleSubmit = async () => {
    if (!idFactura)  return setError('ID Factura es requerido')
    if (!fechaPago)  return setError('Fecha de pago es requerida')
    if (!fechaValor) return setError('Fecha valor es requerida')
    if (!montoPagado) return setError('El monto es requerido')
    setLoading(true); setError(null)
    try {
      const payload = {
        id: pago ? pago.id : 0,
        idFactura: Number(idFactura), numeroRecibo, fechaPago, fechaValor,
        montoPagado: Number(montoPagado), idMoneda: Number(idMoneda) || null,
        tipoCambio: Number(tipoCambio) || null, montoEnGtq: Number(montoEnGtq) || null,
        idMetodoPago: Number(idMetodoPago) || null,
        idBancoOrigen: Number(idBancoOrigen) || null,
        idBancoDestino: Number(idBancoDest) || null,
        referencia, imagenVoucherUrl: imagenUrl, estado, observaciones,
      }
      pago ? await updatePago(pago.id, payload) : await createPago(payload)
      onSaved()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  if (!show) return null
  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose} />
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{pago ? '✏️ Editar Pago' : '💳 Nuevo Pago'}</h5>
              <button className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger py-2 mb-3"><i className="bi bi-exclamation-circle me-2" />{error}</div>}
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-semibold">ID Factura <span className="text-danger">*</span></label>
                  <input type="number" className="form-control" value={idFactura} onChange={e => setIdFactura(e.target.value)} autoFocus />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Número Recibo</label>
                  <input className="form-control" value={numeroRecibo} onChange={e => setNumRecibo(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Estado</label>
                  <select className="form-select" value={estado} onChange={e => setEstado(e.target.value)}>
                    {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Fecha Pago <span className="text-danger">*</span></label>
                  <input type="date" className="form-control" value={fechaPago} onChange={e => setFechaPago(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Fecha Valor <span className="text-danger">*</span></label>
                  <input type="date" className="form-control" value={fechaValor} onChange={e => setFechaValor(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Monto Pagado <span className="text-danger">*</span></label>
                  <div className="input-group">
                    <span className="input-group-text">Q</span>
                    <input type="number" step="0.01" className="form-control" value={montoPagado} onChange={e => setMonto(e.target.value)} />
                  </div>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">ID Método Pago</label>
                  <input type="number" className="form-control" value={idMetodoPago} onChange={e => setMetodo(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Banco Origen</label>
                  <input type="number" className="form-control" value={idBancoOrigen} onChange={e => setBancoOr(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Banco Destino</label>
                  <input type="number" className="form-control" value={idBancoDest} onChange={e => setBancoDest(e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Referencia</label>
                  <input className="form-control" value={referencia} onChange={e => setReferencia(e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">URL Voucher</label>
                  <input className="form-control" placeholder="https://..." value={imagenUrl} onChange={e => setImgUrl(e.target.value)} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Observaciones</label>
                  <textarea className="form-control" rows={2} value={observaciones} onChange={e => setObs(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</> : pago ? 'Guardar cambios' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}