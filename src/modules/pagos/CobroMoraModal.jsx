import { useState, useEffect } from 'react'
import { createCobroMora, updateCobroMora } from './cobroMoraService'
import { getCuentasCobrar } from './cuentaCobrarService'
import FkSelector from '../../components/FkSelector'


export default function CobroMoraModal({ show, onClose, onSaved, cobro }) {
  const [idCuenta,          setIdCuenta]    = useState('')
  const [fechaCalculo,      setFechaCalc]   = useState('')
  const [diasAtraso,        setDias]        = useState('')
  const [saldoBase,         setSaldoBase]   = useState('')
  const [porcentajeAplicado,setPct]         = useState('')
  const [montoMora,         setMonto]       = useState('')
  const [acumuladoTotal,    setAcum]        = useState('')
  const [observaciones,     setObs]         = useState('')
  const [loading,           setLoading]     = useState(false)
  const [error,             setError]       = useState(null)
  const [labelCuenta, setLabelCuenta] = useState('')


  useEffect(() => {
    if (cobro) {
      setIdCuenta(cobro.idCuenta ?? ''); setFechaCalc(cobro.fechaCalculo?.substring(0, 10) ?? '')
      setDias(cobro.diasAtraso ?? ''); setSaldoBase(cobro.saldoBase ?? '')
      setPct(cobro.porcentajeAplicado ?? ''); setMonto(cobro.montoMora ?? '')
      setAcum(cobro.acumuladoTotal ?? ''); setObs(cobro.observaciones ?? '')
    } else {
      setIdCuenta(''); setFechaCalc(''); setDias(''); setSaldoBase('')
      setPct(''); setMonto(''); setAcum(''); setObs('')
    }
    setError(null)
  }, [cobro, show])

  const handleSubmit = async () => {
    if (!idCuenta)    return setError('ID Cuenta es requerido')
    if (!fechaCalculo) return setError('Fecha de cálculo es requerida')
    if (!diasAtraso)  return setError('Días de atraso son requeridos')
    if (!saldoBase)   return setError('Saldo base es requerido')
    setLoading(true); setError(null)
    try {
      const payload = {
        id: cobro ? cobro.id : 0,
        idCuenta: Number(idCuenta), fechaCalculo,
        diasAtraso: Number(diasAtraso), saldoBase: Number(saldoBase),
        porcentajeAplicado: Number(porcentajeAplicado) || 0,
        montoMora: Number(montoMora) || 0, acumuladoTotal: Number(acumuladoTotal) || 0,
        observaciones,
      }
      cobro ? await updateCobroMora(cobro.id, payload) : await createCobroMora(payload)
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
              <h5 className="modal-title">{cobro ? '✏️ Editar Cobro Mora' : '⚠️ Nuevo Cobro de Mora'}</h5>
              <button className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger py-2 mb-3"><i className="bi bi-exclamation-circle me-2" />{error}</div>}
              <div className="row g-3">
                <div className="col-md-6">
                  <FkSelector
                    label="Cuenta x Cobrar" required
                    fetchFn={getCuentasCobrar}
                    getId={c => c.idCuenta ?? c.id}
                    getLabel={c => c.descripcion ?? `Cuenta #${c.idCuenta ?? c.id}`}
                    value={idCuenta}
                    displayValue={labelCuenta}
                    onChange={(id, lbl) => { setIdCuenta(id); setLabelCuenta(lbl) }}
                    placeholder="Selecciona cuenta..."
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Fecha Cálculo <span className="text-danger">*</span></label>
                  <input type="date" className="form-control" value={fechaCalculo} onChange={e => setFechaCalc(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Días Atraso <span className="text-danger">*</span></label>
                  <input type="number" className="form-control" value={diasAtraso} onChange={e => setDias(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Saldo Base <span className="text-danger">*</span></label>
                  <div className="input-group">
                    <span className="input-group-text">Q</span>
                    <input type="number" step="0.01" className="form-control" value={saldoBase} onChange={e => setSaldoBase(e.target.value)} />
                  </div>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">% Aplicado</label>
                  <input type="number" step="0.01" className="form-control" value={porcentajeAplicado} onChange={e => setPct(e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Monto Mora</label>
                  <div className="input-group">
                    <span className="input-group-text">Q</span>
                    <input type="number" step="0.01" className="form-control" value={montoMora} onChange={e => setMonto(e.target.value)} />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Acumulado Total</label>
                  <div className="input-group">
                    <span className="input-group-text">Q</span>
                    <input type="number" step="0.01" className="form-control" value={acumuladoTotal} onChange={e => setAcum(e.target.value)} />
                  </div>
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
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</> : cobro ? 'Guardar cambios' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}