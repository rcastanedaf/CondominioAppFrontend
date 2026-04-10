import { useState, useEffect } from 'react'
import { createContrato, updateContrato } from './contratoService'

const TIPOS   = ['ARRENDAMIENTO', 'COMPRAVENTA', 'USUFRUCTO', 'OTRO']
const ESTADOS = ['VIGENTE', 'VENCIDO', 'RESCINDIDO', 'PENDIENTE']

export default function ContratoModal({ show, onClose, onSaved, contrato }) {
  const [idPropiedad,      setIdProp]    = useState('')
  const [idResidente,      setIdRes]     = useState('')
  const [idTipoContrato,   setIdTipo]    = useState('')
  const [tipoContrato,     setTipoCont]  = useState('ARRENDAMIENTO')
  const [fechaInicio,      setFechaIn]   = useState('')
  const [fechaFin,         setFechaFin]  = useState('')
  const [monto,            setMonto]     = useState('')
  const [idMoneda,         setIdMoneda]  = useState('')
  const [depositoGarantia, setDeposito]  = useState('')
  const [estado,           setEstado]    = useState('VIGENTE')
  const [documentoUrl,     setDocUrl]    = useState('')
  const [observaciones,    setObs]       = useState('')
  const [loading,          setLoading]   = useState(false)
  const [error,            setError]     = useState(null)

  useEffect(() => {
    if (contrato) {
      setIdProp(contrato.idPropiedad ?? '')
      setIdRes(contrato.idResidente ?? '')
      setIdTipo(contrato.idTipoContrato ?? '')
      setTipoCont(contrato.tipoContrato ?? 'ARRENDAMIENTO')
      setFechaIn(contrato.fechaInicio?.substring(0, 10) ?? '')
      setFechaFin(contrato.fechaFin?.substring(0, 10) ?? '')
      setMonto(contrato.monto ?? '')
      setIdMoneda(contrato.idMoneda ?? '')
      setDeposito(contrato.depositoGarantia ?? '')
      setEstado(contrato.estado ?? 'VIGENTE')
      setDocUrl(contrato.documentoUrl ?? '')
      setObs(contrato.observaciones ?? '')
    } else {
      setIdProp(''); setIdRes(''); setIdTipo(''); setTipoCont('ARRENDAMIENTO')
      setFechaIn(''); setFechaFin(''); setMonto(''); setIdMoneda('')
      setDeposito(''); setEstado('VIGENTE'); setDocUrl(''); setObs('')
    }
    setError(null)
  }, [contrato, show])

  const handleSubmit = async () => {
    if (!idPropiedad) return setError('ID Propiedad es requerido')
    if (!idResidente) return setError('ID Residente es requerido')
    if (!fechaInicio) return setError('Fecha de inicio es requerida')
    if (!monto)       return setError('El monto es requerido')
    setLoading(true); setError(null)
    try {
      const payload = {
        id: contrato ? contrato.id : 0,
        idPropiedad: Number(idPropiedad), idResidente: Number(idResidente),
        idTipoContrato: Number(idTipoContrato) || null,
        tipoContrato, fechaInicio, fechaFin: fechaFin || null,
        monto: Number(monto), idMoneda: Number(idMoneda) || null,
        depositoGarantia: Number(depositoGarantia) || null,
        estado, documentoUrl, observaciones,
      }
      contrato ? await updateContrato(contrato.id, payload) : await createContrato(payload)
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
              <h5 className="modal-title">{contrato ? '✏️ Editar Contrato' : '🧾 Nuevo Contrato'}</h5>
              <button className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger py-2 mb-3"><i className="bi bi-exclamation-circle me-2" />{error}</div>}
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-semibold">ID Propiedad <span className="text-danger">*</span></label>
                  <input type="number" className="form-control" value={idPropiedad} onChange={e => setIdProp(e.target.value)} autoFocus />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">ID Residente <span className="text-danger">*</span></label>
                  <input type="number" className="form-control" value={idResidente} onChange={e => setIdRes(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Tipo Contrato</label>
                  <select className="form-select" value={tipoContrato} onChange={e => setTipoCont(e.target.value)}>
                    {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Fecha Inicio <span className="text-danger">*</span></label>
                  <input type="date" className="form-control" value={fechaInicio} onChange={e => setFechaIn(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Fecha Fin</label>
                  <input type="date" className="form-control" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Estado</label>
                  <select className="form-select" value={estado} onChange={e => setEstado(e.target.value)}>
                    {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Monto <span className="text-danger">*</span></label>
                  <div className="input-group">
                    <span className="input-group-text">Q</span>
                    <input type="number" step="0.01" className="form-control" value={monto} onChange={e => setMonto(e.target.value)} />
                  </div>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">ID Moneda (FK)</label>
                  <input type="number" className="form-control" value={idMoneda} onChange={e => setIdMoneda(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Depósito Garantía</label>
                  <div className="input-group">
                    <span className="input-group-text">Q</span>
                    <input type="number" step="0.01" className="form-control" value={depositoGarantia} onChange={e => setDeposito(e.target.value)} />
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">URL Documento</label>
                  <input className="form-control" placeholder="https://..." value={documentoUrl} onChange={e => setDocUrl(e.target.value)} />
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
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</> : contrato ? 'Guardar cambios' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}