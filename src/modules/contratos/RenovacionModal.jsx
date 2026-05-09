import { useState, useEffect } from 'react'
import { createRenovacion, updateRenovacion } from './renovacionService'
import FkSelector from '../../components/FkSelector'
import { getContratos } from '../contratos/contratoService'
import { getTipoMonedas } from '../catalogos/tipoMonedaService'

export default function RenovacionModal({ show, onClose, onSaved, renovacion }) {
  const [idContrato,       setIdContrato]  = useState('')
  const [fechaVigenciaIni,    setFechaVigIni]    = useState('')
  const [fechaVigenciaFin,    setFechaVigFin]    = useState('')
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
      setFechaVigIni(renovacion.fechaVigenciaIni?.substring(0, 10) ?? '')
      setFechaVigFin(renovacion.fechaVigenciaFin?.substring(0, 10) ?? '')
      setMonto(renovacion.nuevoMonto ?? '')
      setIdMoneda(renovacion.idMoneda ?? '')
      setObs(renovacion.observaciones ?? '')
    } else {
      setIdContrato(''); setFechaVigIni(''); setFechaVigFin(''); setMonto(''); setIdMoneda(''); setObs('')
    }
    setError(null)
  }, [renovacion, show])

  const handleSubmit = async () => {
    if (!idContrato)  return setError('ID Contrato es requerido')
    if (!fechaVigenciaIni) return setError('La fecha de nueva de inicio es requerida')
    if (!fechaVigenciaFin) return setError('La fecha de nueva de fin es requerida')
    setLoading(true); setError(null)
    try {
      const payload = {
        id_renovacion: renovacion ? renovacion.id_renovacion : 0,
        id_contrato: Number(idContrato),
        FECHA_INICIO: fechaVigenciaIni,
        FECHA_FIN: fechaVigenciaFin,
        MONTO_NUEVO: Number(nuevoMonto) || null,
        id_moneda: Number(idMoneda) || null,
        observaciones,
      }

      console.log(payload);

      renovacion ? await updateRenovacion(renovacion.id_renovacion, payload) : await createRenovacion(payload)
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
                    getId={c => c.id_contrato ?? c.id_contrato}
                    getLabel={c => c.correlativo ?? c.correlativo ?? `#${c.id_contrato ?? c.id_contrato}`}
                    value={idContrato}
                    displayValue={labelContrato}
                    onChange={(id, lbl) => { setIdContrato(id); setLabelContrato(lbl) }}
                    placeholder="Selecciona contrato..."
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Nueva Vigencia <span className="text-danger">*</span></label>
                  <input type="date" className="form-control" value={fechaVigenciaIni} onChange={e => setFechaVigIni(e.target.value)} />
                  <input type="date" className="form-control" value={fechaVigenciaFin} onChange={e => setFechaVigFin(e.target.value)} />
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