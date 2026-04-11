import { useState, useEffect } from 'react'
import { createRenovacion, updateRenovacion } from './renovacionService'
import FkSelector from '../../components/FkSelector'
import { getContratos } from '../contratos/contratoService'
import { getTipoMonedas } from '../catalogos/tipoMonedaService'

export default function RenovacionModal({ show, onClose, onSaved, renovacion }) {
  const [idContrato,       setIdContrato]  = useState('')
  const [fechaVigencia,    setFechaVig]    = useState('')
  const [nuevoMonto,       setMonto]       = useState('')
  const [idMoneda,         setIdMoneda]    = useState('')
  const [observaciones,    setObs]         = useState('')
  const [loading,          setLoading]     = useState(false)
  const [error,            setError]       = useState(null)
  const [labelContrato, setLabelContrato] = useState('')
  const [labelMoneda,   setLabelMoneda]   = useState('')

  useEffect(() => {
    if (renovacion) {
      setIdContrato(renovacion.idContrato ?? '')
      setFechaVig(renovacion.fechaNuevaVigencia?.substring(0, 10) ?? '')
      setMonto(renovacion.nuevoMonto ?? '')
      setIdMoneda(renovacion.idMoneda ?? '')
      setObs(renovacion.observaciones ?? '')
    } else {
      setIdContrato(''); setFechaVig(''); setMonto(''); setIdMoneda(''); setObs('')
    }
    setError(null)
  }, [renovacion, show])

  const handleSubmit = async () => {
    if (!idContrato)  return setError('ID Contrato es requerido')
    if (!fechaVigencia) return setError('La fecha de nueva vigencia es requerida')
    setLoading(true); setError(null)
    try {
      const payload = {
        id: renovacion ? renovacion.id : 0,
        idContrato: Number(idContrato),
        fechaNuevaVigencia: fechaVigencia,
        nuevoMonto: Number(nuevoMonto) || null,
        idMoneda: Number(idMoneda) || null,
        observaciones,
      }
      renovacion ? await updateRenovacion(renovacion.id, payload) : await createRenovacion(payload)
      onSaved()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  if (!show) return null
  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose} />
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{renovacion ? '✏️ Editar Renovación' : '🔄 Nueva Renovación'}</h5>
              <button className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger py-2 mb-3"><i className="bi bi-exclamation-circle me-2" />{error}</div>}
              <div className="row g-3">
                <div className="col-md-6">
                  <FkSelector
                    label="Contrato" required
                    fetchFn={getContratos}
                    getId={c => c.idContrato ?? c.id}
                    getLabel={c => c.correlativo ?? c.descripcion ?? `#${c.idContrato ?? c.id}`}
                    value={idContrato}
                    displayValue={labelContrato}
                    onChange={(id, lbl) => { setIdContrato(id); setLabelContrato(lbl) }}
                    placeholder="Selecciona contrato..."
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Nueva Vigencia <span className="text-danger">*</span></label>
                  <input type="date" className="form-control" value={fechaVigencia} onChange={e => setFechaVig(e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Nuevo Monto</label>
                  <div className="input-group">
                    <span className="input-group-text">Q</span>
                    <input type="number" step="0.01" className="form-control" value={nuevoMonto} onChange={e => setMonto(e.target.value)} />
                  </div>
                </div>
                <div className="col-md-6">
                  <FkSelector
                    label="Moneda"
                    fetchFn={getTipoMonedas}
                    getId={m => m.idTipoMoneda ?? m.id}
                    getLabel={m => m.nombre ?? m.codigo ?? `#${m.idTipoMoneda ?? m.id}`}
                    value={idMoneda}
                    displayValue={labelMoneda}
                    onChange={(id, lbl) => { setIdMoneda(id); setLabelMoneda(lbl) }}
                    placeholder="Selecciona moneda..."
                  />
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
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</> : renovacion ? 'Guardar cambios' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}