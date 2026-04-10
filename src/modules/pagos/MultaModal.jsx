import { useState, useEffect } from 'react'
import { createMulta, updateMulta } from './multaService'

const ESTADOS = ['PENDIENTE', 'PAGADA', 'APELADA', 'ANULADA', 'VENCIDA']

export default function MultaModal({ show, onClose, onSaved, multa }) {
  const [idResidente,      setIdRes]    = useState('')
  const [idPropiedad,      setIdProp]   = useState('')
  const [idTipoInfraccion, setIdTipo]   = useState('')
  const [descripcion,      setDesc]     = useState('')
  const [monto,            setMonto]    = useState('')
  const [fechaInfraccion,  setFechaInf] = useState('')
  const [fechaVencimiento, setFechaVenc]= useState('')
  const [estado,           setEstado]   = useState('PENDIENTE')
  const [evidenciaUrl,     setEvidencia]= useState('')
  const [idFactura,        setIdFact]   = useState('')
  const [observaciones,    setObs]      = useState('')
  const [loading,          setLoading]  = useState(false)
  const [error,            setError]    = useState(null)

  useEffect(() => {
    if (multa) {
      setIdRes(multa.idResidente ?? ''); setIdProp(multa.idPropiedad ?? '')
      setIdTipo(multa.idTipoInfraccion ?? ''); setDesc(multa.descripcion ?? '')
      setMonto(multa.monto ?? ''); setFechaInf(multa.fechaInfraccion?.substring(0, 10) ?? '')
      setFechaVenc(multa.fechaVencimiento?.substring(0, 10) ?? '')
      setEstado(multa.estado ?? 'PENDIENTE'); setEvidencia(multa.evidenciaUrl ?? '')
      setIdFact(multa.idFactura ?? ''); setObs(multa.observaciones ?? '')
    } else {
      setIdRes(''); setIdProp(''); setIdTipo(''); setDesc(''); setMonto('')
      setFechaInf(''); setFechaVenc(''); setEstado('PENDIENTE')
      setEvidencia(''); setIdFact(''); setObs('')
    }
    setError(null)
  }, [multa, show])

  const handleSubmit = async () => {
    if (!idResidente)     return setError('ID Residente es requerido')
    if (!descripcion.trim()) return setError('La descripción es requerida')
    if (!monto)           return setError('El monto es requerido')
    if (!fechaInfraccion) return setError('Fecha de infracción es requerida')
    setLoading(true); setError(null)
    try {
      const payload = {
        id: multa ? multa.id : 0,
        idResidente: Number(idResidente), idPropiedad: Number(idPropiedad) || null,
        idTipoInfraccion: Number(idTipoInfraccion) || null,
        descripcion, monto: Number(monto),
        fechaInfraccion, fechaVencimiento: fechaVencimiento || null,
        estado, evidenciaUrl, idFactura: Number(idFactura) || null, observaciones,
      }
      multa ? await updateMulta(multa.id, payload) : await createMulta(payload)
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
              <h5 className="modal-title">{multa ? '✏️ Editar Multa' : '🚫 Nueva Multa'}</h5>
              <button className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger py-2 mb-3"><i className="bi bi-exclamation-circle me-2" />{error}</div>}
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-semibold">ID Residente <span className="text-danger">*</span></label>
                  <input type="number" className="form-control" value={idResidente} onChange={e => setIdRes(e.target.value)} autoFocus />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">ID Propiedad</label>
                  <input type="number" className="form-control" value={idPropiedad} onChange={e => setIdProp(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">ID Tipo Infracción</label>
                  <input type="number" className="form-control" value={idTipoInfraccion} onChange={e => setIdTipo(e.target.value)} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Descripción <span className="text-danger">*</span></label>
                  <textarea className="form-control" rows={2} value={descripcion} onChange={e => setDesc(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Monto <span className="text-danger">*</span></label>
                  <div className="input-group">
                    <span className="input-group-text">Q</span>
                    <input type="number" step="0.01" className="form-control" value={monto} onChange={e => setMonto(e.target.value)} />
                  </div>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Fecha Infracción <span className="text-danger">*</span></label>
                  <input type="date" className="form-control" value={fechaInfraccion} onChange={e => setFechaInf(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Fecha Vencimiento</label>
                  <input type="date" className="form-control" value={fechaVencimiento} onChange={e => setFechaVenc(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Estado</label>
                  <select className="form-select" value={estado} onChange={e => setEstado(e.target.value)}>
                    {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">ID Factura (FK)</label>
                  <input type="number" className="form-control" value={idFactura} onChange={e => setIdFact(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">URL Evidencia</label>
                  <input className="form-control" placeholder="https://..." value={evidenciaUrl} onChange={e => setEvidencia(e.target.value)} />
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
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</> : multa ? 'Guardar cambios' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}