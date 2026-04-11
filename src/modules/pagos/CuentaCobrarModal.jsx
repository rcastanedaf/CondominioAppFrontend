import { useState, useEffect } from 'react'
import { createCuentaCobrar, updateCuentaCobrar } from './cuentaCobrarService'
import FkSelector from '../../components/FkSelector'
import { getResidentes } from '../residentes/residenteService'
import { getFacturas } from '../facturacion/facturacionService'

const ESTADOS = ['PENDIENTE', 'PARCIAL', 'PAGADA', 'VENCIDA', 'ANULADA']

export default function CuentaCobrarModal({ show, onClose, onSaved, cuenta }) {
  const [idResidente,  setIdRes]    = useState('')
  const [idFactura,    setIdFact]   = useState('')
  const [montoOriginal,setMonto]    = useState('')
  const [montoPagado,  setMontoPag] = useState('')
  const [montoMora,    setMora]     = useState('')
  const [estado,       setEstado]   = useState('PENDIENTE')
  const [loading,      setLoading]  = useState(false)
  const [error,        setError]    = useState(null)
  const [labelRes,  setLabelRes]  = useState('')
  const [labelFact, setLabelFact] = useState('')

  useEffect(() => {
    if (cuenta) {
      setIdRes(cuenta.idResidente ?? ''); setIdFact(cuenta.idFactura ?? '')
      setMonto(cuenta.montoOriginal ?? ''); setMontoPag(cuenta.montoPagado ?? '')
      setMora(cuenta.montoMora ?? ''); setEstado(cuenta.estado ?? 'PENDIENTE')
    } else {
      setIdRes(''); setIdFact(''); setMonto(''); setMontoPag(''); setMora(''); setEstado('PENDIENTE')
    }
    setError(null)
  }, [cuenta, show])

  const montoPendiente = (Number(montoOriginal) + Number(montoMora) - Number(montoPagado)).toFixed(2)

  const handleSubmit = async () => {
    if (!idResidente) return setError('ID Residente es requerido')
    if (!idFactura)   return setError('ID Factura es requerido')
    if (!montoOriginal) return setError('Monto original es requerido')
    setLoading(true); setError(null)
    try {
      const payload = {
        id: cuenta ? cuenta.id : 0,
        idResidente: Number(idResidente), idFactura: Number(idFactura),
        montoOriginal: Number(montoOriginal), montoPagado: Number(montoPagado) || 0,
        montoMora: Number(montoMora) || 0, montoPendiente: Number(montoPendiente),
        estado,
      }
      cuenta ? await updateCuentaCobrar(cuenta.id, payload) : await createCuentaCobrar(payload)
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
              <h5 className="modal-title">{cuenta ? '✏️ Editar Cuenta x Cobrar' : '📋 Nueva Cuenta x Cobrar'}</h5>
              <button className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger py-2 mb-3"><i className="bi bi-exclamation-circle me-2" />{error}</div>}
              <div className="row g-3">
                <div className="col-md-6">
                  <FkSelector
                    label="Residente" required
                    fetchFn={getResidentes}
                    getId={r => r.idResidente ?? r.id}
                    getLabel={r => r.nombres
                      ? `${r.nombres} ${r.apellidos ?? ''}`.trim()
                      : `#${r.idResidente ?? r.id}`}
                    value={idResidente}
                    displayValue={labelRes}
                    onChange={(id, lbl) => { setIdRes(id); setLabelRes(lbl) }}
                    placeholder="Selecciona residente..."
                  />
                </div>
                <div className="col-md-6">
                  <FkSelector
                    label="Factura" required
                    fetchFn={getFacturas}
                    getId={f => f.idFactura ?? f.id}
                    getLabel={f => f.correlativo ?? f.serie
                      ? `${f.serie}-${f.numeroFactura}`
                      : `#${f.idFactura ?? f.id}`}
                    value={idFactura}
                    displayValue={labelFact}
                    onChange={(id, lbl) => { setIdFact(id); setLabelFact(lbl) }}
                    placeholder="Selecciona factura..."
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Monto Original <span className="text-danger">*</span></label>
                  <div className="input-group">
                    <span className="input-group-text">Q</span>
                    <input type="number" step="0.01" className="form-control" value={montoOriginal} onChange={e => setMonto(e.target.value)} />
                  </div>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Monto Pagado</label>
                  <div className="input-group">
                    <span className="input-group-text">Q</span>
                    <input type="number" step="0.01" className="form-control" value={montoPagado} onChange={e => setMontoPag(e.target.value)} />
                  </div>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Monto Mora</label>
                  <div className="input-group">
                    <span className="input-group-text">Q</span>
                    <input type="number" step="0.01" className="form-control" value={montoMora} onChange={e => setMora(e.target.value)} />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Monto Pendiente (calculado)</label>
                  <div className="form-control bg-light fw-bold text-danger">Q {montoPendiente}</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Estado</label>
                  <select className="form-select" value={estado} onChange={e => setEstado(e.target.value)}>
                    {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</> : cuenta ? 'Guardar cambios' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}